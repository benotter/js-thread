import TaskRunnerWorker from './task_runner_worker';

const _self: { onmessage: ( e: MessageEvent ) => void, postMessage: ( data: any, nothing: void ) => void } = {
    onmessage: null,
    postMessage ( data, nothing: void )
    {
        process.send( { data } );
    }
};

TaskRunnerWorker( _self );

process.on( 'message', ( data ) =>
{
    _self.onmessage( { data } as MessageEvent );
} );