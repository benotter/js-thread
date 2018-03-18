# @otter-co/js-thread

Run simple functions (without closures) against large-ish data-sets in a seperate thread.

Usage:

    import * as jsT from '@otter-co/js-thread';

    let data = [
        "Red",
        "Green",
        "Blue",
    ];

    let taskRunner = jsT.createTaskRunner( );

    // Setting data to use,
    // This is an overwrite, not diff or anything fancy.

    taskRunner.setData( 'colors', data )
        .then( ( ) => { /* do whatever */ } );
    
    // Getting data 
    // You can modify the stored data in a task, 
    // and grab it whenver you like.

    taskRunner.getData( 'colors' )
        .then( colors => console.log( colors ) );

    // Running a task
    // Make sure to NOT use closures or outside references!
    // Returned data is the result sent to promise,
    // But this is not required.

    taskRunner.runTask( 'colors', ( data ) => {
        return data.map( c => { name: c } );
    } ).then( ret => console.log( ret ) );


Works with any object, not just arrays, 