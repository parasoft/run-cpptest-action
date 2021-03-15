import * as core from "@actions/core";

import { messages } from './messages';
import * as runner from './runner';

export async function run() {
    try {
        
        const runOptions: runner.RunOptions = {
            installDir: core.getInput("installDir", { required: false }),
            workingDir: core.getInput("workingDir", { required: false }),
            compilerConfig: core.getInput("compilerConfig", { required: false }),
            testConfig: core.getInput("testConfig", { required: false }),
            reportDir: core.getInput("reportDir", { required: false }),
            reportFormat: core.getInput("reportFormat", { required: false }),
            input: core.getInput("input", { required: false }),
            additionalParams: core.getInput("additionalParams", { required: false }),
            commandLinePattern: core.getInput("commandLinePattern", { required: false }),
        };

        core.info(messages.run_started + runOptions.workingDir);

        const theRunner = new runner.AnalysisRunner();
        const outcome = await theRunner.run(runOptions);
        
        if (outcome.exitCode != 0) {
            core.setFailed(messages.failed_run_non_zero + outcome.exitCode);
        } else {
            core.info(messages.exit_code + outcome.exitCode);
        }

    } catch (error) {
        core.error(messages.run_failed);
        core.error(error);
        core.setFailed(error.message);
    }
}

if (require.main === module) {
    run();
}