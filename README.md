# @otter-co/js-thread
![Build Status](https://otter-co.visualstudio.com/_apis/public/build/definitions/5e420c24-636a-4715-b04b-91461c36d403/3/badge)

Run simple functions (without closures) against large-ish data-sets in a seperate thread.

Usage:
````javascript
const jsT = require( '@otter-co/js-thread' );

let Colors = [
    "Red",
    "Green",
    "Blue",
];

let LutraNames = [
    "WaterDog",
    "RiverRat",
    "CrackFerret",
];

let taskRunner = jsT.createTaskRunner();

// Setting data to use,

// This is an overwrite, not diff or anything fancy.

taskRunner.setData( 'colors', Colors )

    // Getting data 

    // You can modify the stored data in a task, 
    // and grab it whenver you like.
    .then( () => taskRunner.getData( 'colors' ) )
    // Then we can log it!
    .then( ( [ colors ] ) => console.log( "Get Colors: ", colors ) )


    // You can also get more then one data object back at once,

    // ( Lets set some extra data )
    .then( () => taskRunner.setData( 'lutra-names', LutraNames ) )
    // Now we grab the values via an array of data names,
    .then( () => taskRunner.getData( [ 'colors', 'lutra-names' ] ) )
    // Then Log the output!
    .then( ( [ c, ln ] ) => console.log( "Get Colors, LutraNames: ", c, ln ) )

    // Running a task

    // Make sure to NOT use closures or outside references!
    // Returned data is the result sent to promise,
    // But this is not required.
    .then( () => taskRunner.runTask( 'colors', ( data ) =>
    {
        return data.map( c => ( { name: c } ) );
    } ) )
    .then( ret => console.log( "Map Colors: ", ret ) )


    // Tasks also support multiple input data
    .then( () => taskRunner.runTask( [ 'colors', 'lutra-names' ], ( colors, lutNames ) =>
    {
        return [ ...colors, ...lutNames ];
    } ) )
    .then( ret => console.log( "Combine Colors and LutraNames: ", ret ) )

    // And finally, we stop our thread when were done with it,
    // ( Under node, the script will hang until you do! )
    .then( () => taskRunner.stop() );
````

Works with any object, not just arrays, 