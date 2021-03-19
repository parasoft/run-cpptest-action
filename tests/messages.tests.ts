import * as assert from 'assert';
import { messages } from '../src/messages'

suite('run-cpptest-action/messages', function() {

	test('Test messages', function() {
        assert.strictEqual(messages.exit_code, 'C/C++test run finished with code ');
        assert.strictEqual(messages.run_started, 'Running C/C++test in ');
        assert.strictEqual(messages.run_failed, 'Failed to run C/C++test');
        assert.strictEqual(messages.failed_run_non_zero, 'C/C++test run failed with a non-zero exit code: ');
        assert.strictEqual(messages.wrk_dir_not_exist, 'Working directory does not exist: ');
        assert.strictEqual(messages.cmd_cannot_be_empty, 'Command line cannot be empty.');
    });

});