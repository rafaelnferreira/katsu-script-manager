export class Config {
    readonly dockerComposeFolder = __dirname + '/../../config/docker-compose/';
    readonly scriptsFolder = __dirname + '/../../config/scripts/';
    readonly tempFolder = __dirname + '/../../~tmp/';
    readonly logsFolder = this.tempFolder + '/logs/';
    commandsList: Map<string, string>;
    environmentVariables: string;
}