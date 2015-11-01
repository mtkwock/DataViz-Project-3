window.onload = run;

var questionArray = [];

var byId = function(id){
    return document.getElementById(id);
};

function run(){
    console.log("Window Ready");
    for(prop in questions){
        questionArray.push({
            "name": prop,
            "question": questions[prop]
        });
    }
    d3.select("#q1")
        .selectAll("option")
        .data(questionArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d.name; })
        .text(function(d){ return d.question; });
    d3.select("#q2")
        .selectAll("option")
        .data(questionArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d.name; })
        .text(function(d){ return d.question; });

    d3.select("#q1").on("change", update);
    d3.select("#q2").on("change", update);
};

var update = function(){

    var continents = {
        "Africa": false,
        "Asia": false,
        "Americas": true,
        "Europe": false,
        "Middle-East": false
    };

    var q1 = d3.select("#q1").node().value;
    var q2 = d3.select("#q2").node().value;
    // Write REST call to /data?q1="q1"&q2="q2"&countries=Americas
    console.log()
    console.log([q1, q2]);
};
