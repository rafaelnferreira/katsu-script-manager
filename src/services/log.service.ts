import { Config } from "../types/config";
import * as fs from 'fs';
import path from 'path';
import { timingSafeEqual } from "crypto";


export class LogService {
    constructor(private config: Config) {

    }

    public getlogsFolderContent(folder?:string): string[] {
        const readFolder = folder ? this.config.scriptsLogsFolder + '/' + folder : this.config.scriptsLogsFolder;
       return fs.readdirSync(readFolder);
    }
}