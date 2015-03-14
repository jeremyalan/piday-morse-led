var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

function SocketCollection() {
   this._sockets = [];
   EventEmitter.call(this);
}

_.extend(SocketCollection.prototype, EventEmitter.prototype, {
   add: function (socket) {
      var self = this;

      this._sockets.push(socket);

      socket.on('disconnect', function() {
         self._sockets = _.without(self._sockets, socket);
      });

      socket.on('message', function(msg) {
         console.log('Message received: [' + msg + ']');

         self.emit('message', msg);
      });
   },

   send: function (msg) {
      var self = this;

      _.each(self._sockets, function(target) {
         target.send('message', msg);
      });
   }
});

module.exports = SocketCollection;