import * as uuid from 'uuid';
import * as util from './util';
import taskRunnerFunc from './task_runner_worker';
import Mess, { MessageTypes } from './task_runner_messages';

export type TQTask = {
    id: string,
    resolve: ( ...data: any[] ) => any,
    reject: ( ...err: any[] ) => any,
};

export class TaskRunner
{
    public taskWorker: Worker;
    public data: { [ dataName: string ]: DataType } = {};

    private taskQueue: Map<string, TQTask> = new Map<string, TQTask>();

    public getDataType ( data )
    {
        let localDat: DataType = {
            type: "Object"
        };

        if ( Array.isArray( data ) )
        {
            localDat.type = "Array";
            localDat.length = data.length;
        }
        else 
        {
            switch ( typeof data )
            {
                case 'string':
                    localDat.type = "String";
                    localDat.length = data.length;
                    break;
                case 'number':
                    localDat.type = "Number";
                    break;
                case 'boolean':
                    localDat.type = "Boolean";
                    break;
            }
        }

        return localDat;
    }

    constructor ()
    {
        this.taskWorker = new Worker( util.getFuncString<typeof taskRunnerFunc>( taskRunnerFunc ) );

        this.taskWorker.onmessage = ( e ) => this.onMessage( e );
        this.taskWorker.onerror = ( e ) => this.onError( e );
    }

    private completeTask ( taskID, data )
    {
        let task = this.taskQueue.get( taskID );
        task.resolve( data );
        this.taskQueue.delete( taskID );
    }

    private failTask ( taskID, error )
    {
        let task = this.taskQueue.get( taskID );

        if ( !task )
            throw new ReferenceError( `Task ID ${ taskID } not found` );

        task.reject( error );
        this.taskQueue.delete( taskID );
    }

    private onMessage ( e: MessageEvent )
    {
        let { type, taskID } = e.data as Mess.Base;

        if ( type === MessageTypes.Worker_TaskDone )
            this.completeTask( taskID, ( e.data as Mess.Worker_TaskDone ).returnData );
        else if ( type === MessageTypes.Worker_TaskError )
            this.failTask( taskID, ( e.data as Mess.Worker_TaskError ).error );
    }

    private onError ( e: ErrorEvent )
    {
        let { taskID, error } = e.error as Mess.Worker_TaskError;

        if ( taskID )
            this.failTask( taskID, error );
        else
            console.log( error, e, );
    }

    public setData ( dataName: string, data: any[] | any | string | number | boolean ): Promise<any>
    {
        return new Promise( ( res, rej ) =>
        {
            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.data[ dataName ] = this.getDataType( data );
            this.taskQueue.set( task.id, task );

            this.taskWorker.postMessage( {
                type: MessageTypes.Host_SetData,
                taskID: task.id,
                dataName,
                data,
            } as Mess.Host_SetData );
        } );
    }

    public getData<T = any>( dataName: string ): Promise<any>
    {
        if ( this.data[ dataName ] === void 0 )
            throw new ReferenceError( `Data with the name ${ dataName } does not exist` );

        return new Promise( ( res, rej ) =>
        {
            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.taskWorker.postMessage( {
                type: MessageTypes.Host_GetData,
                taskID: task.id,
                dataName,
            } as Mess.Host_GetData );
        } );
    }

    public runTask<T>( dataName: string, taskFunc: ( data: any ) => any ): Promise<T>
    {
        if ( this.data[ dataName ] === void 0 )
            throw new ReferenceError( `Data with the name ${ dataName } does not exist` );

        return new Promise( ( res, rej ) =>
        {
            let taskStr = util.getNoEditFuncString( taskFunc );

            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.taskWorker.postMessage( {
                type: MessageTypes.Host_RunTask,
                taskID: task.id,
                dataName,
                task: taskStr,
            } );
        } );
    }
}

interface DataType 
{
    type: "Array" | "Object" | "String" | "Number" | "Boolean",
    length?: number;
}