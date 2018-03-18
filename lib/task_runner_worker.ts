import { MessageTypes, Messages } from './task_runner_messages';

export default ( self ) => 
{
    const dataStore: { [ dataName: string ]: any } = Object.create( null );

    function getFuncFromStr<T>( funcStr: string ): T & Function
    {
        return new Function( `return ( ${ funcStr } )` )();
    }

    self.onmessage = function TaskRunnerWorkerOnMessage ( e: MessageEvent ) 
    {
        reply( handleMessage( e.data ) );
    };

    function reply ( messPromise: Promise<[ string, any ]> )
    {
        messPromise
            .then( mess => self.postMessage( {
                type: MessageTypes.Worker_TaskDone,
                taskID: mess[ 0 ],
                returnData: mess[ 1 ],
            } as Messages.Worker_TaskDone, void 0 ) )

            .catch( err => self.postMessage( {
                type: MessageTypes.Worker_TaskError,
                error: err
            } as Messages.Worker_TaskError, void 0
            ) );
    }

    function handleMessage ( mess: Messages.Base ): Promise<[ string, any ]>
    {
        switch ( mess.type )
        {
            case MessageTypes.Host_SetData:
                return setDataMessage( mess as Messages.Host_SetData );

            case MessageTypes.Host_GetData:
                return getDataMessage( mess as Messages.Host_GetData );

            case MessageTypes.Host_RunTask:
                return runTaskMessage( mess as Messages.Host_RunTask );

            default:
                return Promise.reject( "Unknown Message Type" );
        }
    }

    function setDataMessage ( mess: Messages.Host_SetData ): Promise<[ string, any ]>
    {
        let { dataName, data, taskID } = mess;

        return new Promise( ( res, rej ) =>
        {
            dataStore[ dataName ] = data;

            res( [ taskID, true ] );
        } );
    }

    function getDataMessage<T>( mess: Messages.Host_GetData ): Promise<[ string, T[] ]>
    {
        let { dataNames, taskID } = mess;

        return new Promise( ( res, rej ) =>
        {
            let ret: T[] = [];

            for ( let dN of dataNames )
                if ( dataStore[ dN ] === void 0 )
                    return rej( new ReferenceError( `No data with ${ dataNames } exists` ) );
                else
                    ret.push( dataStore[ dN ] );

            return res( [ taskID, ret ] );
        } );
    }

    function runTaskMessage ( mess: Messages.Host_RunTask ): Promise<[ string, any ]>
    {
        let { dataNames, task, taskID } = mess;

        return new Promise( ( res, rej ) =>
        {
            let taskFunc = getFuncFromStr( task );

            let args = [];

            for ( let dN of dataNames )
                if ( dataStore[ dN ] === void 0 )
                    return rej( new ReferenceError( `No data with ${ dataNames } exists` ) );
                else
                    args.push( dataStore[ dN ] );

            return res( [ taskID, taskFunc( ...args ) ] );
        } );
    }
}