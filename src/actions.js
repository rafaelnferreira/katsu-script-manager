const config = require('./config-init');
const fs = require('fs-extra');
const process = require('child_process');
const applicationStatus = require('./status').Status;
/**
 * Executes the command passed and returns the result as a string
 * @param {string} command 
 */
function executeBashCommand(command) {
    const result = process.execSync(command);
    return result.toString();
}

//@TODO move  runningImages and runningServicesProcesses to the status class
const runningImages = new Set();

const runningServicesProcesses = new Map();

function spinUpImages(actions) {
    const selectedActions = Array.isArray(Object.values(actions)[0]) ? Object.values(actions)[0] : Object.values(actions);

    const commandsToPerform = [];

    selectedActions.forEach(a => {
        commandsToPerform.push(config.commandsList.get(a));
    });

    commandsToPerform.forEach((c) => {
        const serviceName = c.slice(c.lastIndexOf(' ') + 1);
        const fileLogName = config.logsFolder + serviceName + '.log';
        const logStream = fs.createWriteStream(fileLogName, { flags: 'a' });

        const runningServiceProcess = process.spawn(c, {
            shell: true //otherwise crashes
        });

        runningServiceProcess.stdout.pipe(logStream); //attaching the output of the child console to a file

        //saving the process into a map, we can kill the process on altImages
        runningServicesProcesses.set(serviceName, runningServiceProcess);

        // we set the terminal id and the name of the running service associated with the terminal
        runningImages.add(serviceName);


    });

        // set the services to be active for the UI
        applicationStatus.commands.cmd.forEach(c => {
            runningImages.forEach((value) => {
                if (c.serviceName === value) {
                    c.active = true;
                }
            });
        });
        
}

function altImages(serviceName) {

    const fileLogName = config.logsFolder + serviceName + '.log';

    const runningInstance = runningServicesProcesses.get(serviceName);

    //bring down the service
    process.spawnSync('docker stop ' + serviceName, {
        shell: true
    });

    runningInstance.kill();
    // removing the running images
    runningImages.delete(serviceName);

    //removing the process from the map
    runningServicesProcesses.delete(serviceName);

    // setting the image to inactive
    const imageIdx = applicationStatus.commands.cmd.findIndex((c) => c.serviceName === serviceName);
    applicationStatus.commands.cmd[imageIdx].active = false;

    setTimeout(() => fs.appendFileSync(fileLogName, 'PROCESS TERMINATED'), 0);
}

exports.spinUpImages = spinUpImages;
exports.executeBashCommand = executeBashCommand;
exports.altImages = altImages;