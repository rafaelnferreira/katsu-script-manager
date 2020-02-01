import {Config} from "./config";

export class ApplicationStatus {
    config: Config;
    commands: {
        cmd: [{serviceName: string, active: boolean}]
    };
    runningServicesProcesses;
    runningImages;

    constructor(config: Config){
        this.config = config;
    }
}