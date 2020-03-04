export class Config {
    readonly scriptsFolder = process.env['SCRIPT_FOLDER'] || __dirname + '/../../config/scripts/';
    readonly scriptsLogsFolder = __dirname + '/../../scripts-logs/';
    readonly delayedExecution = +process.env['DELAYED_EXECUTION'] || 1000;
}