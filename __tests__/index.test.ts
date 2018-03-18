import * as jsT from '../index';
import { TaskRunner } from '../lib/task_runner';

test( "Index Create TaskRunner", () =>
{
    let tr = jsT.createTaskRunner();

    expect( tr ).toBeInstanceOf( TaskRunner );

    tr.stopTaskWorker();
} );