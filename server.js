//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var rss = require('node-rss');
var request = require('request');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));

router.get('/json_to_rss', function (req, res) {
  
  var termino = req.query.termino;
  var url = "https://api.import.io/store/connector/a54c4df2-e096-46ac-b522-19f9213509e5/_query?input=webpage/url:http%3A%2F%2Fwww.computrabajo.com.co%2Fofertas-de-trabajo%2F%3Fq%3D" + termino + "&&_apikey=333aef0ad29b4379aa452ff5a1fd2c761d945229d4b8a09db2f15db5a5acffa43e4c5136077a96af16ff02451082eb6076ebd28955de78c8bc879f9f61521bbb72fbfaa386171888dd4544f8d1bb89ad";
  request(url, function (error, response, body) {
     if (!error && response.statusCode == 200) {
     
        var results = JSON.parse(body).results;
        var feed = rss.createNewFeed(termino, '',  '',  '', '');
        
        results.forEach(function (blog) {
            feed.addNewItem(blog.title, blog.href, new Date(), blog.description, {});
        });
        
        var xmlString = rss.getFeedXML(feed);
      
        res.send(xmlString);
       
       
       
       
     }
   })
});

var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
