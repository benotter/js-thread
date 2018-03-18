import TaskRunnerWorker from '../lib/task_runner_worker';

export class MockWorker
{
    private _self: { onmessage: ( e: MessageEvent ) => void, postMessage: ( data: any, nothing: void ) => void } = {
        onmessage: null,
        postMessage: ( data, nothin ) => { this.onmessage( { data } as MessageEvent ) },
    };

    public onmessage: ( e: MessageEvent ) => any;
    public onerror: ( e: ErrorEvent ) => any;


    constructor ()
    {
        TaskRunnerWorker( this._self );
    }

    public postMessage ( data: any, nothin: void )
    {
        if ( this._self.onmessage )
            this._self.onmessage( { data } as MessageEvent );
    }

    public terminate () { }
    public addEventListener () { }
    public removeEventListener () { }
    public dispatchEvent (): boolean { return true; }
};

export namespace MockURL 
{
    export function createObjectURL ( object: any, options: ObjectURLOptions = null ): string
    {
        return '';
    }
}