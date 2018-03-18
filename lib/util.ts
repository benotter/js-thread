export type FuncString<T = () => void> = string;
export function getFuncString<T>( arrowFunc: (...any:any[]) => void ): FuncString<T>
{
    let funcString = arrowFunc.toString();

    funcString = funcString.substring(
        funcString.indexOf( '{' ) + 1,
        funcString.lastIndexOf( '}' ),
    );

    return URL.createObjectURL(
        new Blob(
            [ funcString ],
            {
                type: "application/javascript",
            }
        )
    );
}

export function getNoEditFuncString<T>( arrowFunc: ( ...data: any[] ) => any ): FuncString<T>
{
    return arrowFunc.toString();
}
