import {Config} from "./config";

export class ApplicationStatus {
    constructor(public config: Config){ 
        this.config = config;
    }

    scriptsNames: Array<string> = new Array<string>();
    acceptingRequests = true;
}