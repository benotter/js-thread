import * as jsT from '../index';
import { TaskRunner } from '../lib/task_runner';
import { MockWorker, MockURL } from './mock_classes';

if ( !global[ 'Worker' ] )
    global[ 'Worker' ] = MockWorker;

if ( !global[ 'URL' ] )
    global[ 'URL' ] = MockURL;
else if ( !URL[ 'createObjectURL' ] )
    URL[ 'createObjectURL' ] = MockURL.createObjectURL;

test( "Index Create TaskRunner", () =>
{
    let tr = jsT.createTaskRunner();

    expect( tr ).toBeInstanceOf( TaskRunner );
} );