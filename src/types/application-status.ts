import {Config} from "./config";

export class ApplicationStatus {
    config: Config = new Config();
    scriptsNames: Array<string> = new Array<string>();
    acceptingRequests = true;
}