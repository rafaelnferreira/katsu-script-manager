import * as fs from 'fs';
import {ApplicationStatus} from "../models/application-status";
import { Util } from '../util/util';
import {JobsInput} from '../models/jobs-input';
import jobsConfig from '../../config/jobs/jobs.config.json'; 
import moment from 'moment';

export class ActionService {

    constructor(private applicationStatus: ApplicationStatus){}

    runScript(scriptName: string, args: string[], logsName?: string ): boolean {
        const matchedScriptFile = this.applicationStatus.scriptsNames.find((s) => s === scriptName);

        if(matchedScriptFile) {
            const scriptProc = Util.execFile(`${this.applicationStatus.config.scriptsFolder}/${scriptName}`, args, this.applicationStatus.config.scriptsFolder);
       
            // organize logs in daily folders 
            const todayFolder = moment().format('YYYYMMDD')
            console.log(todayFolder)


            if (!fs.existsSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder)) {
                fs.mkdirSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder);
            }
            
            const timeStamp = moment().format('HHmmss');

            const fileLogName = this.applicationStatus.config.scriptsLogsFolder + todayFolder + '/' +
             (logsName ? logsName + '-' + timeStamp : scriptName + timeStamp);

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