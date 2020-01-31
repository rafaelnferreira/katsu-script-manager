
const fs = require('fs-extra');

const applicationStatus = require('./status').Status;

const actions = require('./actions');
const dockerComposeFolder = __dirname + '/../config/docker-compose/';
const tempFolder = __dirname + '/../~tmp/';
const logsFolder = tempFolder + 'logs/';



/**
 * reads the variables from the env file and adds dynamic ones too
 */
function buildConfigVariables() {
    const env = require('dotenv').config().parsed;
    env['HOSTNAME'] = actions.executeBashCommand('hostname').replace('\n', '');
    env['LOCAL_DOCKER_HOST'] = actions.executeBashCommand('hostname -I | awk \'{print $1}\'').replace('\n', '');
    return env;
}

const environmentVariables = buildConfigVariables();
createTempDockerFiles();
const commandsList = createDockerCommand();




function createTempDockerFiles() {
    
        // prepare the temp folder for the new yml files
        if (fs.existsSync(tempFolder)) {
            fs.removeSync(tempFolder);
        }
    
        fs.mkdirSync(tempFolder);
        setTimeout(() => fs.mkdirSync(logsFolder), 0); //creating the logs folder
    
        const files = fs.readdirSync(dockerComposeFolder);
    
        files.forEach((file) => {
            let contents = fs.readFileSync(dockerComposeFolder + file, 'utf8');
    
            // filtering the good part of the file to be used 
            contents = contents.split('\n');
            contents = contents
                .filter(c => !c.includes('#'));
    
            const envArray = Object.entries(environmentVariables);
            envArray.forEach(a => {
                contents = contents.map(line => line.replace('${' + a[0] + '}', a[1])) //formatting the yaml file
                
                fs.writeFileSync(tempFolder + file, contents.join('\n'), (err) => {
                    if (err) throw err;
                 });
            });
        });
    }


function createDockerCommand() {
    const commandListSet = new Set();
    const commandList = new Map();
    const files = fs.readdirSync(tempFolder);

    files.forEach((file) => {
        let contents = fs.readFileSync(tempFolder + file, 'utf8');

        // extracting the names from the docker compose file and creating the command
        contents = contents.split("\n");
        contents = contents
            .filter(c => c.includes('container_name'))
            .map(c => c.slice(c.search(':') + 1, c.length).replace('"', '').trim())
            .map(c => 'docker-compose -f ' + __dirname + '/../~tmp/' + file + ' up ' + c);

        // delete duplicates
        contents.forEach((c) => commandListSet.add(c));

        // create a map with key the name of the command and value the command itself
        commandListSet.forEach(c => commandList.set(c.slice(c.lastIndexOf(' ') + 1), c));
    });
    console.log(commandList);
    // pushing the commands list to the status class
    commandList.forEach((value, key) => applicationStatus.commands.cmd.push({serviceName: key, active: false}));

    return commandList;
}

exports.logsFolder = logsFolder;
exports.commandsList= commandsList;