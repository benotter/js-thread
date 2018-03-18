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
	    Worker_TaskDone = 3,
	    Worker_TaskError = 4,
	}
	export namespace Messages {
	    type Base = {
	        type: MessageTypes;
	        taskID: string;
	    };
	    type Host_RunTask = Base & {
	        dataName: string;
	        task: string;
	    };
	    type Host_SetData = Base & {
	        dataName: string;
	        data: any;
	    };
	    type Host_GetData = Base & {
	        dataName: string;
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
	 const _default: (self: any) => void;
	export default _default;

}
declare module '@otter-co/js-thread/lib/task_runner' {
	export type TQTask = {
	    id: string;
	    resolve: (...data: any[]) => any;
	    reject: (...err: any[]) => any;
	};
	export interface DataType {
	    type: "Array" | "Object" | "String" | "Number" | "Boolean";
	    length?: number;
	}
	export class TaskRunner {
	    taskWorker: Worker;
	    data: {
	        [dataName: string]: DataType;
	    };
	    private taskQueue;
	    getDataType(data: any): DataType;
	    constructor();
	    private completeTask(taskID, data);
	    private failTask(taskID, error);
	    private onMessage(e);
	    private onError(e);
	    setData(dataName: string, data: any[] | any | string | number | boolean): Promise<any>;
	    getData<T = any>(dataName: string): Promise<any>;
	    runTask<T>(dataName: string, taskFunc: (data: any) => any): Promise<T>;
	}

}
declare module '@otter-co/js-thread/index' {
	import { TaskRunner } from '@otter-co/js-thread/lib/task_runner';
	export function createTaskRunner(): TaskRunner;

}
