var express = require('express');
var router = express.Router();
var fs = require('fs');
var parse = require('csv-parse');
var env = "dev";

if(env === "dev"){
    var africaStream = fs.createReadStream("./data/africaSmall.csv")
}
if(env === "prod"){
    var africaStream = fs.createReadStream("./data/africa.csv"),
        americaStream = fs.createReadStream("./data/america.csv"),
        apacStream = fs.createReadStream("./data/apac.csv"),
        europeStream = fs.createReadStream("./data/europe.csv"),
        middleStream = fs.createReadStream("./data/middle.csv");
}

var mydata = {
    "Americas": "Not Loaded Yet",
    "Africa": "Not Loaded Yet",
    "Asia": "Not Loaded Yet",
    "Europe": "Not Loaded Yet",
    "Middle-East": "Not Loaded Yet",
};

var parserOptions = {
    "delimiter": ",",       // Separates cols by commas
    "rowDelimiter": "\n",   // Separates rows by new lines
    "auto_parse": true,     // Converts to local json objects
    "columns": true         // Uses first line as column names
};

//
var parserCallback = function(err, data){
    mydata.Africa = data;
    //console.log("Data Loaded: %d", mydata.length);
};

var parser = parse(parserOptions, parserCallback);

africaStream.pipe(parser);

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query)
    /*
        req.query.countries = []
        req.query.q1
        req.query.q2
    */
    var data = calculate(countries, q1, q2)
    res.render('index', { title: 'Express', data: data});
});

module.exports = router;
