export class Config {
    readonly scriptsFolder = process.env['SCRIPT_FOLDER'] || __dirname + '/../../config/scripts/';
    readonly scriptsLogsFolder = __dirname + '/../../../scripts-logs/';
}