import * as assert from 'assert';
import * as sinon from 'sinon';

import * as core from "@actions/core";
import * as cp from 'child_process';
import * as fs from 'fs';
import * as runner from '../src/runner';
import { messages } from '../src/messages';

suite('run-cpptest-action/runner', function() {

    const sandbox = sinon.createSandbox();

    teardown(function() {
        sandbox.restore();
	});

    test('Run - working dir does not exist', async function() {
        const fsExistsSync = sandbox.fake.returns(false);
        sandbox.replace(fs, 'existsSync', fsExistsSync);

        let runnerError : string | undefined;
        const incorrectWorkindDir = '/incorrect/working/dir';
        
        try {
            const theRunner = new runner.AnalysisRunner()
            await theRunner.run({ workingDir : incorrectWorkindDir} as runner.RunOptions);
        } catch (error) {
            runnerError = error;
        }

        assert.strictEqual(runnerError, messages.wrk_dir_not_exist + incorrectWorkindDir);
    });

    test('Run - command line is empty', async function() {
        const fsExistsSync = sandbox.fake.returns(true);
        sandbox.replace(fs, 'existsSync', fsExistsSync);

        let runnerError : string | undefined;
        
        try {
            const theRunner = new runner.AnalysisRunner()
            await theRunner.run({ commandLinePattern : ''} as runner.RunOptions);
        } catch (error) {
            runnerError = error;
        }

        assert.strictEqual(runnerError, messages.cmd_cannot_be_empty);
    });

    test('Run - launch cpptestcli', async function() {
        const fsExistsSync = sandbox.fake.returns(true);
        sandbox.replace(fs, 'existsSync', fsExistsSync);
        const coreInfo = sandbox.fake();
        sandbox.replace(core, 'info', coreInfo);
        const cpSpawn = sandbox.fake.returns( {
            stdout: undefined,
            stderr: undefined,
            on: function(_event: string, action : any) {
                action();
            }
        });
        sandbox.replace(cp, 'spawn', cpSpawn);
        
        const expectedCommandLine = '"/opt/parasoft/cpptest/cpptestcli" -compiler "gcc_9-64" -config "builtin://Recommended Rules" -property report.format=xml -report "reportDir" -module . -input "cpptest.bdf" -property key=value';
        const theRunner = new runner.AnalysisRunner()
        await theRunner.run(
            {
                installDir: '/opt/parasoft/cpptest',
                compilerConfig: 'gcc_9-64',
                testConfig: 'builtin://Recommended Rules',
                reportDir: 'reportDir',
                reportFormat: 'xml',
                input: 'cpptest.bdf',
                additionalParams: '-property key=value',
                commandLinePattern: '${cpptestcli} -compiler "${compilerConfig}" -config "${testConfig}" -property report.format=${reportFormat} -report "${reportDir}" -module . -input "${input}" ${additionalParams}'
            } as runner.RunOptions);

        assert.strictEqual(cpSpawn.args[0][0], expectedCommandLine);
        assert.strictEqual(coreInfo.args[0][0], expectedCommandLine);
    });

});