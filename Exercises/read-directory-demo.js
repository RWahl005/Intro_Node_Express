var fs = require('fs');
fs.readdir('../', function(err, data) {
    console.log(data);
});