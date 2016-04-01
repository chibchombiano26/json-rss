
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');
var rss = require('node-rss');
var request = require('request');


var router = express();
var server = http.createServer(router);


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


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  
});
