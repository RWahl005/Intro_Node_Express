var express = require('express');

var express = require('express');
var app = express();
var fs = require('fs');
var port = 5500;
app.listen(port, function() {
    console.log('Server listening on localhost:%s', port);
});


app.use('/test', function(req, res, next) {
    res.send("Test");
    next();
});

app.get("/example", function(req, res){
    res.sendFile(__dirname + '/test.html')
})