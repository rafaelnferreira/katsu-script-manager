import * as fs from 'fs';
import {ApplicationStatus} from "../models/application-status";
import { Util } from '../util/util';
import {JobsInput} from '../models/jobs-input';
import jobsConfig from '../../config/jobs/jobs.config.json'; 

export class ActionService {

    constructor(private applicationStatus: ApplicationStatus){}

    spinUpImages(actions) {
        const selectedActions = Array.isArray(Object.values(actions)[0])? Object.values(actions)[0] : Object.values(actions);

        const commandsToPerform = [];

        //@ts-ignore
        selectedActions.forEach(a => {
            commandsToPerform.push(this.applicationStatus.config.commandsList.get(a));
        });

        commandsToPerform.forEach((c) => {
            const serviceName = c.slice(c.lastIndexOf(' ') + 1);
            const fileLogName = this.applicationStatus.config.dockerLogsFolder + serviceName;
            const runningServiceProcess = Util.spawn(c);

            Util.tailLogsToFile(fileLogName, runningServiceProcess);

            //saving the process into a map, we can kill the process on altImages
            this.applicationStatus.runningServicesProcesses.set(serviceName, runningServiceProcess);

            // we set the terminal id and the name of the running service associated with the terminal
            this.applicationStatus.runningImages.add(serviceName);
        });

        // set the services to be active for the UI
        this.applicationStatus.commands.cmd.forEach(c => {
            this.applicationStatus.runningImages.forEach((value) => {
                if (c.serviceName === value) {
                    c.active = true;
                }
            });
        });

    }

    altImages(serviceName): void {

        const fileLogName = this.applicationStatus.config.dockerLogsFolder + serviceName + '.log';

        const runningInstance = this.applicationStatus.runningServicesProcesses.get(serviceName);

        //bring down the service
        Util.spawnSync('docker stop ' + serviceName);

        runningInstance.kill();
        // removing the running images
        this.applicationStatus.runningImages.delete(serviceName);

        //removing the process from the map
        this.applicationStatus.runningServicesProcesses.delete(serviceName);

        // setting the image to inactive
        const imageIdx = this.applicationStatus.commands.cmd.findIndex((c) => c.serviceName === serviceName);
        this.applicationStatus.commands.cmd[imageIdx].active = false;

        setTimeout(() => fs.appendFileSync(fileLogName, 'PROCESS TERMINATED'), 0);
    }

    runScript(scriptName: string, args: string[], logsName?: string ): boolean {
        const matchedScriptFile = this.applicationStatus.scriptsNames.find((s) => s === scriptName);

        if(matchedScriptFile) {
            const scriptProc = Util.execFile(this.applicationStatus.config.scriptsFolder + scriptName, args);
       
            // organize logs in daily folders 
            const todayFolder = new Date().getDay().toString() + '-' + new Date().getMonth().toString() + '-' + new Date().getFullYear().toString() + '/';
            console.log(todayFolder)


            if (!fs.existsSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder)) {
                fs.mkdirSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder);
            }
            
            const fileLogName = this.applicationStatus.config.scriptsLogsFolder + todayFolder + (logsName ? logsName + '-' + new Date().toLocaleTimeString() : 
            scriptName + new Date().toLocaleTimeString());

            Util.tailLogsToFile(fileLogName, scriptProc);

            return true;
        }
        return false;
    }

    executeJob(job: JobsInput) {
        const applicableJobs = jobsConfig.filter(c => c.jobName === job.jobName && c.branch === job.branch);
        applicableJobs.forEach(job => this.runScript(job.scriptName, job.args, job.name));
    }
}