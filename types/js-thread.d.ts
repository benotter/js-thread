declare module '@otter-co/js-thread/lib/util' {
	export type FuncString<T = () => void> = string;
	export function getFuncString<T>(arrowFunc: (...any: any[]) => void): FuncString<T>;
	export function getNoEditFuncString<T>(arrowFunc: (...data: any[]) => any): FuncString<T>;

}
declare module '@otter-co/js-thread/lib/task_runner_messages' {
	export const enum MessageTypes {
	    Host_SetData = 0,
	    Host_GetData = 1,
	    Host_RunTask = 2,
	    Host_RunMapTask = 3,
	    Host_RunDataTask = 4,
	    Worker_TaskDone = 5,
	    Worker_TaskError = 6,
	}
	export namespace Messages {
	    type Base = {
	        type: MessageTypes;
	        taskID: string;
	    };
	    type Host_SetData = Base & {
	        dataName: string;
	        data: any;
	    };
	    type Host_GetData = Base & {
	        dataNames: string[];
	    };
	    type Host_RunTask = Base & {
	        dataNames: string[];
	        task: string;
	    };
	    type Host_RunMapTask = Base & {
	        dataName: string;
	        task: string;
	    };
	    type Host_RunDataTask = Base & {
	        data: any[];
	        task: string;
	    };
	    type Worker_TaskDone = Base & {
	        returnData: any;
	    };
	    type Worker_TaskError = Base & {
	        error: string | Error;
	    };
	}
	export default Messages;

}
declare module '@otter-co/js-thread/lib/task_runner_worker' {
	 const _default: (self?: Window) => void;
	export default _default;

}
declare module '@otter-co/js-thread/lib/task_runner' {
	/// <reference types="node" />
	import { ChildProcess } from 'child_process';
	import Mess from '@otter-co/js-thread/lib/task_runner_messages';
	export type TQTask = {
	    id: string;
	    resolve: (...data: any[]) => any;
	    reject: (...err: any[]) => any;
	};
	export interface DataType {
	    type: "Array" | "Object" | "String" | "Number" | "Boolean";
	    length?: number;
	}
	export const enum TaskRunnerWorkerType {
	    WebWorker = 0,
	    ChildProcess = 1,
	}
	export class TaskRunner {
	    taskWorker: Worker | ChildProcess;
	    data: {
	        [dataName: string]: DataType;
	    };
	    getDataType(data: any): DataType;
	    private taskQueue;
	    private workerType;
	    private _childScriptPath;
	    constructor();
	    private initTaskWorker();
	    stopTaskWorker(): void;
	    sendData(mess: Mess.Base): void;
	    private completeTask(taskID, data);
	    private failTask(taskID, error);
	    private onMessage(e);
	    private onError(e);
	    setData(dataName: string, data: any[] | any | string | number | boolean): Promise<boolean>;
	    getData<T = any>(dataNames: string | string[]): Promise<T[]>;
	    runTask<T>(dataNames: string | string[], taskFunc: (...data: any[]) => any): Promise<T>;
	    runMapTask<T>(dataName: string, taskFunc: (element: any, index: any, data: any) => T): Promise<T[]>;
	    runDataTask<T>(data: any | any[], taskFunc: (...data: any[]) => any): Promise<T>;
	}

}
declare module '@otter-co/js-thread' {
	import { TaskRunner } from '@otter-co/js-thread/lib/task_runner';
	export function createTaskRunner(): TaskRunner;
}
