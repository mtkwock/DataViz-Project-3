var express = require('express');
var router = express.Router();
var fs = require('fs');
var parse = require('csv-parse');

var env = "prod";

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

americaStream.pipe(parse(
    parserOptions,
    function(err, data){
        mydata.Americas = data;
        console.log("Loaded Americas");
    }
));

// localhost:8000/data?q1=Q4&q2=Q8&countries=Americas
router.get('/', function(req, res, next) {
    var data = calculate(
        req.query.countries.split(","),
        req.query.q1,
        req.query.q2
    )
    console.log(data);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

function calculate(countries, q1, q2){
    console.log(countries,q1,q2);
    var answers = {}
    countries.forEach(function(key){
            console.log(key)
            for(var i = 0; i < mydata[key].length; i++){
                q1_answer = mydata[key][i][q1];
                q2_answer = mydata[key][i][q2];
                // console.log(q1_answer, q2_answer)
                if(q1_answer in answers){
                    if(q2_answer in answers[q1_answer]){
                        answers[q1_answer][q2_answer] += 1;
                    }
                    else{
                        answers[q1_answer][q2_answer] = 1;
                    }
                }
                else{
                    answers[q1_answer] = {};
                    answers[q1_answer][q2_answer] = 1;
                }
            }
    });
    return answers
}

module.exports = router;
