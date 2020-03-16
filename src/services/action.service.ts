import * as fs from 'fs';
import { ApplicationStatus } from "../types/application-status";
import { Util } from '../util/util';
import { JobsInput } from '../types/jobs-input';
import moment from 'moment';
import { logger } from './../app';
import { JobsConfig } from '../types/jobs.config';

export class ActionService {

    constructor(private applicationStatus: ApplicationStatus) { }

    runScript(scriptName: string, args: string[], logsName?: string): boolean {
        return this.applicationStatus.acceptingRequests
            ? this.findScriptAndRun(scriptName, args, logsName)
            : this.logAndDoNothing(scriptName);
    }

    executeJob(job: JobsInput) {
        logger.debug('Trying to execute job: ' + job.jobName + ' on branch: ' + job.branch);
        let jobsConfig = require(this.applicationStatus.config.jobsConfig);
        const applicableJobs = jobsConfig.filter(c => c.jobName === job.jobName && c.branch === job.branch);

        if (applicableJobs.length > 0) {
            logger.debug('Found jobs number: ' + applicableJobs.length);
            applicableJobs.forEach(job => this.runScript(job.scriptName, job.args, job.name));
        } else {
            logger.debug('No applicable jobs found');
        }
    }

    saveJob(job: JobsConfig) {
        let jobsConfig = this.getJobs();
        jobsConfig.push(job);
        let newJobs = JSON.stringify(jobsConfig);
        let s = this.applicationStatus.config.jobsConfig;
        Util.writeToFileAsync(s, newJobs,'Added job succesfully' );

    }

    deleteJob(jobName: string) {
        let jobsConfig = this.getJobs();
        jobsConfig = jobsConfig.filter(job => job.name !== jobName);
        let newJobs = JSON.stringify(jobsConfig);
        let s = this.applicationStatus.config.jobsConfig;
        Util.writeToFileAsync(s, newJobs,'Deleted job succesfully' );
    }

    getJobs(): JobsConfig[] {
        // I know I know, why don't you do return require() etc..., yeah doesn't work. I think it caches it so it returns the initial file even after edit
       return JSON.parse(fs.readFileSync(this.applicationStatus.config.jobsConfig, 'UTF-8'));
    }

    private logAndDoNothing(scriptName): boolean {
        logger.warn(`Received request to execute script ${scriptName}, ignoring it as application is not processing events`);
        return false;
    }

    private findScriptAndRun(scriptName: string, args: string[], logsName?: string): boolean {
        logger.debug('Trying to run script: ' + scriptName);

        const matchedScriptFile = this.applicationStatus.scriptsNames.find((s) => s === scriptName);

        if (matchedScriptFile) {
            logger.debug('Script found, execution will be scheduled.');
            
            setTimeout(() => {
                logger.info (`Triggering execution of ${scriptName}`);

                const scriptProc = Util.execFile(`${this.applicationStatus.config.scriptsFolder}/${scriptName}`, args, this.applicationStatus.config.scriptsFolder);

                // organize logs in daily folders 
                const todayFolder = moment().format('YYYYMMDD')

                if (!fs.existsSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder)) {
                    fs.mkdirSync(this.applicationStatus.config.scriptsLogsFolder + todayFolder);
                }

                const timeStamp = moment().format('HHmmss');

                const fileLogName = this.applicationStatus.config.scriptsLogsFolder + todayFolder + '/' +
                    (logsName ? logsName + '-' + timeStamp : scriptName + timeStamp);

                Util.tailLogsToFile(fileLogName, scriptProc);
                
            }, this.applicationStatus.config.delayedExecution);
            
            return true;
        }

        logger.debug('No script found');
        return false;
    }
}