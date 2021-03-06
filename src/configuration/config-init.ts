import * as fs from 'fs-extra';
import {ApplicationStatus} from "../types/application-status";

export class ConfigInit {

    constructor(private applicationStatus: ApplicationStatus) {
        this.init();
    }

    init(): void {
        // prepare the folder for the scripts logs
        if (!fs.existsSync(this.applicationStatus.config.scriptsLogsFolder)) {
            fs.mkdirSync(this.applicationStatus.config.scriptsLogsFolder);
        }

        this.applicationStatus.scriptsNames = this.findScripts();
    }

    public findScripts(): string[] {
        const files: string[] = fs.readdirSync(this.applicationStatus.config.scriptsFolder, 'utf8');
        const filteredFiles = files.filter(f => f.includes('.bash') || f.includes('.bat'));
        return filteredFiles;
    }
}