const querystring = require('querystring');
const fs = require('fs');
const mime = require('mime-types');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var messages = [];

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var statusCode;
  var headers = defaultCorsHeaders;
  var queryIndex = request.url.indexOf('?');
  var requestUrl = (queryIndex === -1) ? request.url : request.url.slice(0, queryIndex);

  if (requestUrl === '/classes/messages') {
    if (request.method === 'GET' || request.method === 'OPTIONS') {
      statusCode = 200;
    } else if (request.method === 'POST') {
      statusCode = 201;
      request.on('data', function(data) {
        var newMessage = querystring.parse(data.toString());
        newMessage.objectId = messages.length;
        messages.push(newMessage);
      });
    }
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    response.end(Buffer.from(JSON.stringify({ results: messages })));
  } else {
    const baseUrl = '../client/hrsf81-chatterbox-client/client';
    var fileUrl = (requestUrl === '/') ? baseUrl + '/index.html' : baseUrl + requestUrl;
    fs.readFile(fileUrl, (err, data) => {
      if (err) {
        statusCode = 404;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end();
      } else {
        statusCode = 200;
        headers['Content-Type'] = mime.lookup(fileUrl);
        response.writeHead(statusCode, headers);
        response.end(data);
      }
    });
  }
};

exports.requestHandler = requestHandler;
