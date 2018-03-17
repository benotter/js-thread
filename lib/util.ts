export function getFuncString<T>( arrowFunc: ()=>void ): FuncString<T>
{
    let funcString = arrowFunc.toString();

    funcString = funcString.substring(
        funcString.indexOf('{') + 1,
        funcString.lastIndexOf('}'),
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

export type FuncString<T = ()=>void> = string;
