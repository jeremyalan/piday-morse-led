var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var SocketCollection = require('./lib/SocketCollection');

app.listen(15123);

function handler (req, res) {
   fs.readFile(__dirname + '/index.html',
      function (err, data) {
         if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
         }

         res.writeHead(200);
         res.end(data);
      });
}

var _servers = null;
var _clients = null;

var socketsCollectionByType = {
   'server': (_servers = new SocketCollection()),
   'client': (_clients = new SocketCollection())
};

_clients.on('message', function (msg) {
   _servers.send(msg);
});

function protocolError(socket, message) {
   socket.emit('error', { message: message })
   console.warn (message);
}

io.on('connection', function (socket) {
   socket.on('register', function (data) {
      if (!data.type) {
         protocolError(socket, 'Unable to register, no connection type specified.');
         return;
      }

      var collection = socketsCollectionByType[data.type];

      if (!collection) {
         protocolError(socket, 'Unable to register, connection type [${ data.type }] is invalid.');
         return;
      }

      collection.add(socket);
   });
});