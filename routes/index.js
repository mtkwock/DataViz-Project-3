var express = require('express');
var router = express.Router();
var fs = require('fs');
var parse = require('csv-parse');

var africaStream = fs.createReadStream("./data/africaSmall.csv")
/*
    americaStream = fs.createReadStream("./data/america.csv"),
    apacStream = fs.createReadStream("./data/apac.csv"),
    europeStream = fs.createReadStream("./data/europe.csv"),
    middleStream = fs.createReadStream("./data/middle.csv");
*/

var mydata = [];

var parserOptions = {
    "delimiter": ",",       // Separates cols by commas
    "rowDelimiter": "\n",   // Separates rows by new lines
    "auto_parse": true,     // Converts to local json objects
    "columns": true         // Uses first line as column names
};

//
var parserCallback = function(err, data){
    mydata = data;
    //console.log("Data Loaded: %d", mydata.length);
};

var parser = parse(parserOptions, parserCallback);

africaStream.pipe(parser);

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    res.render('index', { title: 'Express', data: mydata});
});

module.exports = router;
