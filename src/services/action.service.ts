import * as fs from 'fs';
import {ApplicationStatus} from "../types/application-status";
import { Util } from '../util/util';
import {JobsInput} from '../types/jobs-input';
import jobsConfig from '../../config/jobs/jobs.config.json'; 
import moment from 'moment';
import {logger} from './../app';

export class ActionService {

    constructor(private applicationStatus: ApplicationStatus){}

    runScript(scriptName: string, args: string[], logsName?: string ): boolean {
        logger.debug('Trying to run script: ' + scriptName);

        const matchedScriptFile = this.applicationStatus.scriptsNames.find((s) => s === scriptName);

        if(matchedScriptFile) {
            logger.debug('Script found');
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

            return true;
        }

        logger.debug('No script found');
        return false;
    }

    executeJob(job: JobsInput) {
        logger.debug('Trying to execute job: ' + job.jobName + ' on branch: ' + job.branch);
        const applicableJobs = jobsConfig.filter(c => c.jobName === job.jobName && c.branch === job.branch);

        if(applicableJobs.length > 0) {
            logger.debug('Found jobs number: ' + applicableJobs.length);
            applicableJobs.forEach(job => this.runScript(job.scriptName, job.args, job.name));
        } else {
            logger.debug('No applicable jobs found');
        }
        
    }
}