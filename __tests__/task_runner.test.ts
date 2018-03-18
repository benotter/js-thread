import { MessageTypes, Messages } from '../lib/task_runner_messages';
import { TaskRunner } from '../lib/task_runner';

test( "Task Runner Get Data Types", () =>
{
    let tr = new TaskRunner();

    expect( tr.getDataType( {} ) ).toMatchObject( { type: "Object" } );
    expect( tr.getDataType( [] ) ).toMatchObject( { type: "Array", length: 0 } );
    expect( tr.getDataType( "Test" ) ).toMatchObject( { type: "String", length: 4 } );
    expect( tr.getDataType( 50 ) ).toMatchObject( { type: "Number" } );
    expect( tr.getDataType( false ) ).toMatchObject( { type: "Boolean" } );

    tr.stop();
} );

test( "Task Runner Set / Get Data", () =>
{
    expect.assertions( 1 );

    let tr = new TaskRunner();

    return tr.setData( 'test', 'Test' )
        .then( ret => tr.getData( 'test' ) )
        .then( ( [ data ] ) => expect( data ).toBe( "Test" ) )
        .then( () => tr.stop() );
} );

test( "Task Runner Set / Get Multiple Data", () => 
{
    expect.assertions( 2 );

    let tr = new TaskRunner();

    return tr.setData( 'test1', "Test One" )
        .then( res => tr.setData( 'test2', "Test Two" ) )
        .then( res => tr.getData( [ 'test1', 'test2' ] ) )
        .then( ( [ res1, res2 ] ) =>
        {
            expect( res1 ).toBe( "Test One" );
            expect( res2 ).toBe( "Test Two" );
        } )
        .then( () => tr.stop() );
} );

test( "Task Runner Run Basic Task", () =>
{
    expect.assertions( 1 );

    let tr = new TaskRunner();

    return tr.setData( 'test', "Test" )
        .then( res => tr.runTask( 'test', ( dat ) => dat + " Is Good!" ) )
        .then( res => expect( res ).toBe( "Test Is Good!" ) )
        .then( () => tr.stop() );
} );


const ComplexDataTask = ( data: string[] ) =>
{
    return data.filter( e => !( e === void 0 || e === null ) ).map( ( e, i, a ) => `${ e }:${ i }` );
};

const GetBigArr = ( arrSize, arrElements = arrSize ) =>
{

    let arr = new Array( arrSize );

    for ( let i = 0; i < arrElements; i++ )
    {
        let id = ( ( ( Math.random() * arrSize ) ) | 0 );

        if ( !arr[ id ] )
            arr[ id ] = "Populated!";
        else
            i--;
    }

    return arr;
}

test( "Task Runner Run 'Complex' Task", () =>
{
    expect.assertions( 1 );

    let arrSize = 10000,
        arrElements = 1000;

    let arr = GetBigArr( arrSize, arrElements );

    let tr = new TaskRunner();

    return tr.setData( 'test', arr )
        .then( res => tr.runTask<string[]>( 'test', ComplexDataTask ) )
        .then( ret => expect( ret.length ).toBe( arrElements ) )
        .then( () => tr.stop() );
} );