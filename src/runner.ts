import * as cp from 'child_process';
import * as fs from 'fs';
import * as pt from 'path';
import * as core from "@actions/core";

import { messages } from './messages'

export interface RunDetails
{
	exitCode : number
} 

export interface RunOptions
{
    /* Path to working directory. */
    workingDir: string;

    /* Path to folder containing cpptestcli executable. */
    installDir: string;

    /* Command line arguments for cpptestcli executable. */
    cliArgs: string;
}

export class AnalysisRunner
{

    async run(runOptions : RunOptions) : Promise<RunDetails>
    {
        if (!fs.existsSync(runOptions.workingDir)) {
            return Promise.reject(messages.wrk_dir_not_exist + runOptions.workingDir);
        }
        const commandLine = this.createCommandLine(runOptions).trim();
        if (commandLine.length === 0) {
            return Promise.reject(messages.cmd_cannot_be_empty);
        }

        core.info(messages.wrk_dir_label + runOptions.workingDir);
        core.info(messages.cmd_label + commandLine);

        const runPromise = new Promise<RunDetails>((resolve, reject) =>
        {
            const cliEnv = this.createEnvironment();
            const cliProcess = cp.spawn(`${commandLine}`, { cwd: runOptions.workingDir, env: cliEnv, shell: true, windowsHide: true });

            cliProcess.stdout?.on('data', (data) => { core.info(`${data}`.replace(/\s+$/g, '')); });
            cliProcess.stderr?.on('data', (data) => { core.info(`${data}`.replace(/\s+$/g, '')); });
            cliProcess.on('close', (code) => {
                const result : RunDetails = {
                    exitCode : code,
                };
                core.info(messages.exit_code + code.toString());
                resolve(result);
            });
            cliProcess.on("error", (err) => { reject(err); });
        });

        return runPromise;
    }

    private createCommandLine(runOptions : RunOptions) : string
    {
        let cpptestcli = 'cpptestcli';
        if (runOptions.installDir) {
            cpptestcli = '"' + pt.join(runOptions.installDir, cpptestcli) + '"';
        }
        return `${cpptestcli} ${runOptions.cliArgs}`;
    }

    private createEnvironment() : NodeJS.ProcessEnv
    {
        const environment: NodeJS.ProcessEnv = {};
        let isEncodingVariableDefined = false;
        for (const varName in process.env) {
            if (Object.prototype.hasOwnProperty.call(process.env, varName)) {
                environment[varName] = process.env[varName];
                if (varName.toLowerCase() === 'parasoft_console_encoding') {
                    isEncodingVariableDefined = true;
                }
            }
        }
        if (!isEncodingVariableDefined) {
            environment['PARASOFT_CONSOLE_ENCODING'] = 'utf-8';
        }
        return environment;
    }

}