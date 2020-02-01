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
}