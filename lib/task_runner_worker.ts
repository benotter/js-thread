import { MessageTypes, Messages } from './task_runner_messages';

export default () => 
{
    self.onmessage = function TaskRunnerOnMessage ( e: MessageEvent ) { handleMessage( e.data ); };

    const dataStore: { [ dataName: string ]: any } = Object.create( null );

    function reply ( data: any )
    {
        self.postMessage( data, void 0 );
    }

    function getFuncFromStr( funcStr: string ): Function 
    {
        return Function()
    }

    function handleMessage ( mess: Messages.Base ) 
    {
        switch ( mess.type )
        {
            case MessageTypes.Host_SetData:
                setDataMessage( mess as Messages.Host_SetData );
                break;

            case MessageTypes.Host_GetData:
                getDataMessage( mess as Messages.Host_GetData );
                break;

            case MessageTypes.Host_RunTask:
                runTaskMessage( mess as Messages.Host_RunTask );
                break;
        }
    }

    function setDataMessage ( mess: Messages.Host_SetData ) 
    {

    }

    function getDataMessage ( mess: Messages.Host_GetData ) 
    {

    }

    function runTaskMessage ( mess: Messages.Host_RunTask ) 
    {

    }
};