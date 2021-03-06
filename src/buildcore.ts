
//
// Copyright 2016-present by Pouya Kary <kary@gnu.org> All rights reserved
//

//
// ─── IMPORTS ────────────────────────────────────────────────────────────────────
//


    import themeX   = require( './themeX' )
    import check    = require( './checkcore' )
    import fs       = require( 'fs' )
    import path     = require( 'path' )
    import colors   = require( 'colors' )

//
// ─── BUILD ──────────────────────────────────────────────────────────────────────
//

    export = ( project: themeX.IBundle.base, address: string ): boolean => {
        if ( !check( project ) ) return false
        applyBuild( project, address )
    }

//
// ─── APPLY BUILD TO PROJECT ─────────────────────────────────────────────────────
//

    function applyBuild ( project: themeX.IBundle.base, address: string ) {
        // setting up the build directory
        setupBuildsDirectory( address )

        // running adaptors
        let adaptorDirectory = getAdaptorDirectoryLocation( );
        fs.readdir( adaptorDirectory, ( err, files ) => {
            files.forEach( adaptorDirectoryName => {
                if ( /.adaptorX$/.test( adaptorDirectoryName ) ) {
                    runAdaptor(
                        adaptorDirectory,
                        adaptorDirectoryName,
                        address,
                        project
                    )
                }
            })
        })
    }

//
// ─── RUN ADAPTOR ────────────────────────────────────────────────────────────────
//

    function runAdaptor ( adaptorDirectory: string,
        adaptorDirectoryName: string,
        address: string,
        project: themeX.IBundle.base ) {
        try {
            // Loading the core.
            const adaptorPath = path.join( adaptorDirectory, adaptorDirectoryName )
            const adaptor = <themeX.IAdaptor>require( adaptorPath )
            adaptor[ 'name' ] = adaptorDirectoryName
            adaptor[ 'adaptorPath' ] = adaptorPath


            // Setting up the environment.
            setupAdaptorEnvironment( adaptor, address )


            // Running the adaptor.
            themeX.print(
                `running adaptor ${adaptor.name.underline} (v${adaptor.version})` )
            adaptor.generate( project, address )


        } catch ( error ) {
            themeX.report( `Internal Error: "${ error }"` )
        }
    }

//
// ─── SETUP BUILD FOLDERS ────────────────────────────────────────────────────────
//

    function setupBuildsDirectory ( address: string ) {
        let dir = themeX.buildsDirectoryPath( address )
        if ( !fs.existsSync( dir ) )
            fs.mkdirSync( dir )
    }

//
// ─── SETUP ADAPTOR ENVIRONMENT ──────────────────────────────────────────────────
//

    function setupAdaptorEnvironment ( adaptor: themeX.IAdaptor, address: string ) {
        const projectDir =
            themeX.adaptorBuildDirectoryPath( adaptor, address )
        if ( !fs.existsSync( projectDir ) )
            fs.mkdirSync( projectDir )
    }

//
// ─── GET ALL THE ADAPTORS ───────────────────────────────────────────────────────
//

    function getAdaptorDirectoryLocation ( ): string {
        return path.join( __dirname, 'adaptors' )
    }

// ────────────────────────────────────────────────────────────────────────────────

