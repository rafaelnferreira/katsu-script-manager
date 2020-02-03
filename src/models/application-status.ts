import {Config} from "./config";
import { ActiveService } from "./active-service";

export class ApplicationStatus {
    config: Config;
    commands: {cmd: ActiveService[]};
    runningServicesProcesses: Map<string, any>;
    runningImages: Set<string>;

    constructor(config: Config){
        this.config = config;
    }
}