export class Config {
    readonly dockerComposeFolder = __dirname + '/../../../config/docker-compose/';
    readonly scriptsFolder = process.env['SCRIPT_FOLDER'] || __dirname + '/../../config/scripts/';
    readonly tempFolder = __dirname + '/../../../~tmp-docker/';
    readonly dockerLogsFolder = this.tempFolder + '/logs/';
    readonly scriptsLogsFolder = __dirname + '/../../../scripts-logs/';

    commandsList: Map<string, string>;
    environmentVariables: string;
}