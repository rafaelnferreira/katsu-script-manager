import * as process from 'child_process';
import * as fs from 'fs';
import {logger} from './../app';
 
export class Util{
    /**
     * Executes the command passed and returns the result as a string
     * @param {string} command
     */
    static executeBashCommand(command): string {
        const result = process.execSync(command);
        return result.toString();
    }

    static spawn(command: string): process.ChildProcess {
       return process.spawn(command, {
            shell: true
        });
    }

    static spawnSync(command: string): process.SpawnSyncReturns<Buffer> {
        return process.spawnSync(command, {
             shell: true
         });
     }

     static execFile(fileName: string, args?: string[], executionFolder?: string): process.ChildProcess {
        logger.debug(`Running script: ${fileName}, with args: ${args}`)
        return process.execFile(fileName, args, {cwd: executionFolder});
     }

     static tailLogsToFile(fileName: string, process: process.ChildProcess ) {
        const fileLogName = fileName + '.log';
        const logStream = fs.createWriteStream(fileLogName, { flags: 'a' });
        process.stdout.pipe(logStream); //attaching the output of the child console to a file
        process.stderr.pipe(logStream)
     }


    static writeToFileAsync(file, data, successMsg) {
        fs.writeFile(file, data, (err) => {
            if (err) {
                logger.error(err);
            }
            logger.debug(successMsg);
        });
    }
}