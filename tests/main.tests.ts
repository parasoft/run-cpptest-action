import * as assert from 'assert';
import * as sinon from 'sinon';

import * as core from "@actions/core";
import * as main from '../src/main';
import * as runner from '../src/runner';
import { messages } from '../src/messages';

suite('run-cpptest-action/main', function() {
	
    const sandbox = sinon.createSandbox();

    let coreSetFailed : sinon.SinonSpy;
    let coreInfo : sinon.SinonSpy;
    let coreError : sinon.SinonSpy;
    let coreSetOutput : sinon.SinonSpy;

    setup(function() {
        coreSetFailed = sandbox.fake();
        sandbox.replace(core, 'setFailed', coreSetFailed);
        coreInfo = sandbox.fake();
        sandbox.replace(core, 'info', coreInfo);
        coreError = sandbox.fake();
        sandbox.replace(core, 'error', coreError);
        coreSetOutput = sandbox.fake();
        sandbox.replace(core, 'setOutput', coreSetOutput);
    });

    teardown(function() {
        sandbox.restore();
	});

	test('Run with exit code 0', async function() {
        const runnerExitCode = 0;
        const runnerRun = sandbox.fake.resolves( { exitCode: runnerExitCode } );
        sandbox.replace(runner.AnalysisRunner.prototype, 'run', runnerRun);
        
        await main.run();

        assert(coreSetFailed.notCalled);
        assert(coreSetOutput.calledTwice);
        assert.strictEqual(coreSetOutput.args[0][0], 'exitCode');
        assert.strictEqual(coreSetOutput.args[0][1], `${runnerExitCode}`);
        assert.strictEqual(coreSetOutput.args[1][0], 'hasViolations');
        assert.strictEqual(coreSetOutput.args[1][1], 'false');
        assert(coreInfo.calledTwice);
        assert.strictEqual(coreInfo.args[1][0], messages.exit_code + `${runnerExitCode}`);
    });

    test('Run with exit code non-0', async function() {
        const runnerExitCode = 123;
        const runnerRun = sandbox.fake.resolves( { exitCode: runnerExitCode } );
        sandbox.replace(runner.AnalysisRunner.prototype, 'run', runnerRun);
        
        await main.run();

        assert(coreSetFailed.calledOnce);
        assert(coreSetOutput.calledTwice);
        assert.strictEqual(coreSetOutput.args[0][0], 'exitCode');
        assert.strictEqual(coreSetOutput.args[0][1], `${runnerExitCode}`);
        assert.strictEqual(coreSetOutput.args[1][0], 'hasViolations');
        assert.strictEqual(coreSetOutput.args[1][1], 'true');
        assert.strictEqual(coreSetFailed.args[0][0], messages.failed_run_non_zero + `${runnerExitCode}`);
    });

    test('Run with exit code non-0 and bit 2 not set', async function() {
        const runnerExitCode = 1;
        const runnerRun = sandbox.fake.resolves( { exitCode: runnerExitCode } );
        sandbox.replace(runner.AnalysisRunner.prototype, 'run', runnerRun);

        await main.run();

        assert(coreSetFailed.calledOnce);
        assert(coreSetOutput.calledTwice);
        assert.strictEqual(coreSetOutput.args[0][0], 'exitCode');
        assert.strictEqual(coreSetOutput.args[0][1], `${runnerExitCode}`);
        assert.strictEqual(coreSetOutput.args[1][0], 'hasViolations');
        assert.strictEqual(coreSetOutput.args[1][1], 'false');
        assert.strictEqual(coreSetFailed.args[0][0], messages.failed_run_non_zero + `${runnerExitCode}`);
    });

    test('Run with configuration problems', async function() {
        const errorMessage = 'error message from runner';
        const runnerRun = sandbox.fake.rejects(errorMessage);
        sandbox.replace(runner.AnalysisRunner.prototype, 'run', runnerRun);

        await main.run();

        assert(coreSetFailed.calledOnce);
        assert(coreError.calledTwice);
        assert.strictEqual(coreError.args[0][0], messages.run_failed);
        assert.strictEqual(coreSetFailed.args[0][0], errorMessage);
    });

    test('Run with runtime exceptions', async function() {
        const errorMessage = 'error message from runner';
        const runnerRun = sandbox.fake.throws(errorMessage)
        sandbox.replace(runner.AnalysisRunner.prototype, 'run', runnerRun);

        await main.run();

        assert(coreSetFailed.calledOnce);
        assert(coreError.calledTwice);
        assert.strictEqual(coreError.args[0][0], messages.run_failed);
        assert.strictEqual(coreSetFailed.args[0][0], errorMessage);
    });
});