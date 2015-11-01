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

var restRequest = function(restType, url, isAsync, body, callback){
    isAsync = isAsync !== null ? isAsync : true;

    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
        if ( typeof xmlhttp.overrideMimeType != 'undefined') {
            xmlhttp.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        console.error('Perhaps your browser does not support xmlhttprequests?');
        return;
    }

    xmlhttp.open(restType, url, isAsync);
    xmlhttp.send(body);

    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
            callback(null, xmlhttp.responseText);
        }
    };
}

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
    console.log([q1, q2]);
    var url = "http://localhost:8000/data?q1=" + q1 + "&q2=" + q2 + "&countries=Americas";

    restRequest('GET', url, true, null, function(err, data){
        if(err){
            console.error(err);
            return;
        }
        var dat = JSON.parse(data);
        graph(dat);
    });
};

var vizWidthFrac = 0.75;
var vizHeightFrac = 0.8;

var calcX = function(pos, total){
    var widthTotal = byId("viz").width.baseVal.value;
    var widthAvail = widthTotal * vizWidthFrac;
    var widthOffst = widthTotal - widthAvail;
    var frac = pos / total + 1/(2 * total);
    return widthOffst + widthAvail * frac;
};

var calcY = function(pos, total){
    var heightTotal = byId("viz").height.baseVal.value;
    var heightAvail = heightTotal * vizHeightFrac;
    // var heightOffst = heightTotal - heightAvail;
    var frac = pos / total + 1/(2 * total);
    console.log(heightTotal)
    return heightAvail * frac;
};

var curData = {};

var graph = function(data){
    console.log(data);
    var rows = Object.getOwnPropertyNames(data);
    var cols = rows.reduce(function(acc, rowName){
        Object.getOwnPropertyNames(data[rowName]).forEach(function(colName){
            if(acc.indexOf(colName) < 0){
                acc.push(colName);
            }
        })
        return acc;
    }, []);

    var datb = [];

    var rl = rows.length;
    var cl = cols.length;

    for(var i = 0; i < rl; i++){
        for(var j = 0; j < cl; j++){
            var dat = data[rows[i]][cols[j]];
            if(dat){
                datb.push({
                    val: dat,
                    row: rows[i],
                    col: cols[i],
                    x: calcX(i, rl),
                    y: calcY(j, cl)
                })
            }
            else{
                datb.push({
                    val: 0,
                    x: calcX(i, rl),
                    y: calcY(j, cl)
                });
            }
        }
    }

    var rowDat = rows.map(function(rowName, idx){
        return {
            idx: idx,
            val: rowName,
            x: calcX(idx-0.25, rl),
            y: calcY(rl + 0, rl) + Math.pow(-1, idx) * 20
        };
    });

    var colDat = cols.map(function(colName, idx){
        return {
            idx: idx,
            val: colName,
            x: calcX(0, rl) / 2,
            y: calcY(idx, cl)
        }
    })

    console.log(rows);
    console.log(cols);

    curData = datb;

    d3.select("#viz").selectAll(".datas").remove().data(datb)
        .enter()
        .append("text")
        .attr("class", "datas")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .text(function(d){ return d.val; })

    d3.select("#viz").selectAll(".rows").remove().data(rowDat)
        .enter()
        .append("text")
        .attr("class", "rows")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .text(function(d){ return d.val; })

    d3.select("#viz").selectAll(".cols").remove().data(colDat)
        .enter()
        .append("text")
        .attr("class", "cols")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .text(function(d){ return d.val; })

};
