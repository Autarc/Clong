/**
 *  localServer
 *  ===========
 *
 *  A standalone version of a server, hosting the specified current directory
 */

// Modules

var http = require('http'),
    url  = require('url'),
    path = require('path'),
    fs   = require('fs');


// Content Type

var mimeTypes = {

  md  : 'text/plain'      ,

  html: 'text/html'       ,
  js  : 'text/javascript' ,
  css : 'text/css'        ,

  json: 'application/json',
  xml : 'application/xml' ,

  jpeg: 'image/jpeg'      ,
  jpg : 'image/jpg'       ,
  png : 'image/png'       ,
  gif : 'image/gif'       ,
  svg : 'image/svg+xml'
};


// Code

function init ( root, port ) {

  return http.createServer( function ( req, res ) {

    var uri      = url.parse( req.url ).pathname,

        filename = path.join( root, unescape(uri) );


    if ( uri === '/favicon.ico' ) {

      res.writeHead( 200, { 'Content-Type': 'image/x-icon' });
      res.write('');
      res.end();
      return;
    }

    //
    if ( uri.charAt( uri.length - 1 ) !== '/' ) uri += '/';


    fs.stat( filename, function ( err, stats ) {

      if ( err ) return showError( err );

      if ( stats.isFile() ) {

        var type = path.extname( filename ).substr(1);

        res.writeHead( 200, { 'Content-Type': mimeTypes[type] });

        fs.createReadStream( filename ).pipe( res );

        return;
      }


      if ( stats.isDirectory() ) {

        fs.readdir( filename, function ( err, files ) {

          if ( err ) throw err;

          res.writeHead( 200, { 'Content-Type': 'text/html' });


          /** serve index file **/
          if ( files.indexOf('index.html') >= 0 ) {

            return fs.createReadStream( filename + 'index.html' ).pipe( res );
          }


          /** provide a overview list **/

          var list = files.map( function ( file ) {

            return '<li><a href="' + uri + file + '">'+ file +'</a></li>';

          }).join('<br>');

          res.write( '<ul>' + list + '</ul>' );

          res.end();
        });
      }

    });


    /**  Error - File not found **/
    function showError ( err ) {

      res.writeHead( 404, { 'Content-Type': 'text/html' });
      res.write('<h2>File not found !</h2>');
      res.end();

      console.log('\n[MISSING] Path: "' + err.path + '"' );
    }


  }).listen( port, function(){

    console.log('[open] running a local server => http://localhost:' + port );
  });

}

module.exports = { init: init };
