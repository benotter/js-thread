export const enum MessageTypes 
{
    Host_SetData,
    Host_GetData,
    Host_RunTask,
    Host_RunMapTask,

    Worker_TaskDone,
    Worker_TaskError,
}

export namespace Messages
{
    export type Base = { type: MessageTypes, taskID: string, };

    export type Host_SetData = Base & { dataName: string, data: any };
    export type Host_GetData = Base & { dataNames: string[] };

    export type Host_RunTask = Base & { dataNames: string[], task: string };
    export type Host_RunMapTask = Base & { dataName: string, task: string };


    export type Worker_TaskDone = Base & { returnData: any };
    export type Worker_TaskError = Base & { error: string | Error };
}

export default Messages;