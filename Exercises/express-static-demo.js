var express = require('express');

var express = require('express');
var app = express();
var port = 5500;

app.listen(port, function() {
    console.log('Server listening on localhost:%s', port);
});
app.use(express.static(__dirname));