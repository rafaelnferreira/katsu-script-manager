import * as fs from 'fs';
import {ChildProcess, spawn, spawnSync} from 'child_process';

import {ApplicationStatus} from "../models/application-status";


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
            const fileLogName = this.applicationStatus.config.logsFolder + serviceName + '.log';
            const logStream = fs.createWriteStream(fileLogName, { flags: 'a' });

            const runningServiceProcess = spawn(c, {
                shell: true //otherwise crashes
            });

            runningServiceProcess.stdout.pipe(logStream); //attaching the output of the child console to a file

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

    altImages(serviceName) {

        const fileLogName = this.applicationStatus.config.logsFolder + serviceName + '.log';

        const runningInstance = this.applicationStatus.runningServicesProcesses.get(serviceName);

        //bring down the service
        spawnSync('docker stop ' + serviceName, {
            shell: true
        });

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
}