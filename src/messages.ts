import * as fs from 'fs';
import * as pt from 'path';

interface ISerializable<T> {
    deserialize(jsonPath: string): T;
}

class Messages implements ISerializable<Messages>
{
    run_started!: string;
    run_failed!: string;
    exit_code!: string;
    failed_run_non_zero!: string;
    wrk_dir_not_exist!: string;
    cmd_cannot_be_empty!: string;

    deserialize(jsonPath: string) : Messages {
        const buf = fs.readFileSync(jsonPath);
        const json = JSON.parse(buf.toString('utf-8'));
        return json as Messages;
    }
}

const jsonPath = pt.join(__dirname, 'messages/messages.json');
export const messages = new Messages().deserialize(jsonPath);
