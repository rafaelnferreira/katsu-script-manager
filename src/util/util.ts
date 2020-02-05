import * as process from 'child_process';

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

     static execFile(fileName: string, args?: string[]): process.ChildProcess {
        return process.execFile(fileName, args);
     }
}