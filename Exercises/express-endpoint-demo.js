var express = require('express');

var express = require('express');
var app = express();
var fs = require('fs');
var port = 5500;

app.listen(port, function() {
    console.log('Server listening on localhost:%s', port);
});
app.use('/message', function(req, res) {
    console.log('User requested an endpoint!');
    res.send("<h2>Hello There! I am cool!</h2>");
});

app.use('/users', function(req, res) {
    fs.readFile('./data1.json', 'utf-8', function(err, data) {
        console.log(data);
        res.send(data);
    })
});