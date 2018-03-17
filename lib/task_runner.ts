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
    public data: { [ dataName: string ]: DataType };

    public taskQueue: Map<string, TQTask> = new Map<string, TQTask>();

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

    private failTask( taskID, error )
    {
        let task = this.taskQueue.get(taskID);
        task.reject( error );
        this.taskQueue.delete( taskID );
    }

    private onMessage ( e )
    {

    }

    private onError ( e )
    {

    }



    public setData ( name: string, data: any[] | any | string | number | boolean ): Promise<any>
    {
        let datType = this.getDataType( data );

        return new Promise( ( res, rej ) =>
        {
            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskWorker.postMessage( {
                type: MessageTypes.Host_SetData,
                taskID: task.id,

                dataName: name,
                data,
            } as Mess.Host_SetData );
        } );
    }

    public getData<T = any>( name: string ): Promise<any>
    {
        if ( this.data[ name ] === void 0 )
            return null;

        return new Promise( ( res, rej ) =>
        {
            let task = {
                id: uuid.v4(),
                resolve: res,
                reject: rej,
            } as TQTask;

            this.taskWorker.postMessage( {
                type: MessageTypes.Host_GetData,
                taskID: task.id,

                dataName: name,
            } as Mess.Host_GetData );
        } );
    }



    private getDataType ( data )
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
}

interface DataType 
{
    type: "Array" | "Object" | "String" | "Number" | "Boolean",
    length?: number;
}