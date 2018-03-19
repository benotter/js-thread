import { sep } from 'path';
import { ChildProcess } from 'child_process';
import * as uuid from 'uuid';
import * as util from './util';
import taskRunnerFunc from './task_runner_worker';
import Mess, { MessageTypes } from './task_runner_messages';


export type TQTask = {
    id: string,
    resolve: ( ...data: any[] ) => any,
    reject: ( ...err: any[] ) => any,
};

export interface DataType 
{
    type: "Array" | "Object" | "String" | "Number" | "Boolean",
    length?: number;
}

export const enum TaskRunnerWorkerType
{
    WebWorker,
    ChildProcess,
}

export class TaskRunner
{

    public taskWorker: Worker | ChildProcess;
    public data: { [ dataName: string ]: DataType } = {};

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

    private taskQueue: Map<string, TQTask> = new Map<string, TQTask>();

    private workerType: TaskRunnerWorkerType;

    private _childScriptPath = `${ __dirname }${ sep }task_runner_child_proc`;

    constructor ()
    {
        this.initTaskWorker();
    }

    private initTaskWorker ()
    {
        this.stopTaskWorker();

        if ( global[ 'Worker' ] )
        {
            this.workerType = TaskRunnerWorkerType.WebWorker;

            this.taskWorker = new Worker( util.getFuncString<typeof taskRunnerFunc>( taskRunnerFunc ) );

            this.taskWorker.onmessage = ( e ) => this.onMessage( e );
            this.taskWorker.onerror = ( e ) => this.onError( e );
        }
        else
        {
            this.workerType = TaskRunnerWorkerType.ChildProcess;

            this.taskWorker = require( 'child_process' ).fork( this._childScriptPath );

            ( this.taskWorker as ChildProcess ).on( 'message', ( data ) => this.onMessage( data as MessageEvent ) );
            ( this.taskWorker as ChildProcess ).on( 'error', ( error ) => this.onError( { error } as ErrorEvent ) );

            process.on( 'SIGTERM', () => ( this.taskWorker as ChildProcess ).kill() );
            process.on( 'SIGINT', () => ( this.taskWorker as ChildProcess ).kill() );
        }
    }

    public stopTaskWorker ()
    {
        if ( !this.taskWorker )
            return;

        if ( this.workerType === TaskRunnerWorkerType.WebWorker )
            ( this.taskWorker as Worker ).terminate();
        else
            ( this.taskWorker as ChildProcess ).kill();

        this.taskWorker = null;
    }

    public sendData ( mess: Mess.Base )
    {
        if ( this.workerType === TaskRunnerWorkerType.WebWorker )
            ( this.taskWorker as Worker ).postMessage( mess );
        else
            ( this.taskWorker as ChildProcess ).send( mess );
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
        {
            console.log( error );
            throw new ReferenceError( `Task ID ${ taskID } not found ${ error }` );
        }


        task.reject( error );
        this.taskQueue.delete( taskID );
    }

    private onMessage ( e: MessageEvent )
    {
        let { type, taskID } = e.data as Mess.Base;

        if ( type === MessageTypes.Worker_TaskDone )
            this.completeTask( taskID, ( e.data as Mess.Worker_TaskDone ).returnData );
        else
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

    public setData ( dataName: string, data: any[] | any | string | number | boolean ): Promise<boolean>
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

            this.sendData( {
                type: MessageTypes.Host_SetData,
                taskID: task.id,
                dataName,
                data,
            } as Mess.Host_SetData );
        } );
    }

    public getData<T = any>( dataNames: string | string[] ): Promise<T[]>
    {
        if ( !Array.isArray( dataNames ) )
            dataNames = [ dataNames ];

        dataNames.forEach( dn =>
        {
            if ( this.data[ dn ] === void 0 )
                throw new ReferenceError( `Data with the name ${ dataNames } does not exist` );
        } );

        return new Promise( ( res, rej ) =>
        {
            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.sendData( {
                type: MessageTypes.Host_GetData,
                taskID: task.id,
                dataNames,
            } as Mess.Host_GetData );
        } );
    }

    public runTask<T>( dataNames: string | string[], taskFunc: ( ...data: any[] ) => any ): Promise<T>
    {
        if ( !Array.isArray( dataNames ) )
            dataNames = [ dataNames ];

        for ( let dN of dataNames )
            if ( this.data[ dN ] === void 0 )
                throw new ReferenceError( `Data with the name ${ dataNames } does not exist` );

        return new Promise( ( res, rej ) =>
        {
            let taskStr = util.getNoEditFuncString( taskFunc );

            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.sendData( {
                type: MessageTypes.Host_RunTask,
                taskID: task.id,
                dataNames,
                task: taskStr,
            } as Mess.Host_RunTask );
        } );
    }

    public runMapTask<T>( dataName: string, taskFunc: ( element: any, index: any, data: any ) => T ): Promise<T[]>
    {
        if ( this.data[ dataName ] === void 0 )
            throw new ReferenceError( `Data with the name ${ dataName } does not exist` );
        else if ( !( this.data[ dataName ].type === "Array" || this.data[ dataName ].type === "String" ) )
            throw new TypeError( `Data with name ${ dataName } is not an Array or a String!` );

        return new Promise( ( res, rej ) =>
        {
            let taskStr = util.getNoEditFuncString( taskFunc );

            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.sendData( {
                type: MessageTypes.Host_RunMapTask,
                taskID: task.id,
                dataName,
                task: taskStr,
            } as Mess.Host_RunMapTask );
        } );
    }

    public runDataTask<T>( data: any | any[], taskFunc: ( ...data: any[] ) => any ): Promise<T>
    {
        if ( !Array.isArray( data ) )
            data = [ data ];

        return new Promise( ( res, rej ) =>
        {
            let taskStr = util.getNoEditFuncString( taskFunc );

            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskQueue.set( task.id, task );

            this.sendData( {
                type: MessageTypes.Host_RunDataTask,
                taskID: task.id,
                data,
                task: taskStr,
            } as Mess.Host_RunDataTask );
        } );
    }
}

