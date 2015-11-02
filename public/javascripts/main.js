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
            "question": prop + ": " + questions[prop]
        });
    }
    d3.select("#q1")
        .selectAll("option")
        .data(questionArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d.name; })
        .text(function(d){ return d.question; })
        .property("selected", function(d, idx){
            return idx === 3;
        });
    d3.select("#q2")
        .selectAll("option")
        .data(questionArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d.name; })
        .text(function(d){ return d.question; })
        .property("selected", function(d, idx){
            return idx === 5;
        });

    d3.select("#q1").on("change", update);
    d3.select("#q2").on("change", update);
    update();
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

var vizFrac = {
    width: 0.75,
    height: 0.65,
    titleHeight: 0.15
}

var vizW = function(){
    return byId("viz").width.baseVal.value;
};

var vizH = function(){
    return byId("viz").height.baseVal.value;
};

var calcX = function(pos, total){
    var widthTotal = vizW();
    var widthAvail = widthTotal * vizFrac.width;
    var widthOffst = widthTotal - widthAvail;
    var frac = (pos + 0.5) / total;
    return widthOffst + widthAvail * frac;
};

var calcY = function(pos, total){
    var heightTotal = vizH();
    var heightAvail = heightTotal * vizFrac.height;
    var heightOffst = heightTotal * vizFrac.titleHeight;
    var frac = (pos + 0.5) / total;
    return heightAvail * frac + heightOffst;
};

var curData = {};

var graph = function(data){
    var q1 = d3.select("#q1").node().value;
    var q2 = d3.select("#q2").node().value;
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
    var maxVal = 1;
    var rl = rows.length;
    var cl = cols.length;
    for(var i = 0; i < rl; i++){
        for(var j = 0; j < cl; j++){
            var dat = data[rows[i]][cols[j]];          
            if(dat){
                maxVal = Math.max(maxVal, dat);
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
    var maxDia = Math.min(vizW()*vizFrac.width/rl, vizH()*vizFrac.height/cl);
    console.log(maxDia, maxVal);

    var rowDat = rows.map(function(rowName, idx){
        return {
            idx: idx,
            val: rowName,
            x: calcX(idx, rl),
            y: calcY(rl, rl) + Math.pow(-1, idx) * 20
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

    d3.selectAll("#viz > *").remove();

    d3.select("#viz").selectAll("circle").data(datb)
        .enter()
        .append("circle")
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
        .attr("text-anchor", "middle")
        .attr("fill", "#F9F9F9")
        .attr("r", function(d){ return Math.sqrt(d.val/maxVal) * maxDia/2; })
        

    d3.select("#viz").selectAll(".datas").data(datb)
        .enter()
        .append("text")
        .attr("class", "datas")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .text(function(d){

            return d.val;
        })
    var tiprect = d3.select("#viz").append("rect")
        .style("fill", "#000000")
        .attr("rx", 5)
    var tooltip = d3.select("#viz").append("text")
        .attr("class","tooltip")
        .style("opacity",0)
        .style("background-color", "#FFFFFF")
        .text("tooltip")

    var movetooltip = function(d){
        tooltip.attr("x", d.x)
        .attr("y", d.y)
        .style("opacity", 1)
        .text(d.val)

        var bbox = tooltip.node().getBBox()
        var padding = 3
        tiprect.attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + (padding*2))
        .attr("height", bbox.height + (padding*2))
    }

    


    d3.select("#viz").selectAll(".rows").data(rowDat)
        .enter()
        .append("text")
        .attr("class", "rows")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .text(function(d){
            if(d.val === " " || d.val === "undefined"){
                return "N/A";
            }
            var d3el = d3.select("#viz")
                .selectAll(".dummy")
                .data(" ")
                .enter()
                .append("text")
                .attr("class", "cols")
                .attr("id", "dummy")
                .text(d.val);

            var maxWidth = vizFrac.width * vizW() * 2 / rl;

            if(d3el[0][0].clientWidth > maxWidth){
                d3el.remove();
                return d.val.substring(0,4) + "...";
            }
            d3el.remove();
            return d.val;
        }).on("mouseover", movetooltip)

    d3.select("#viz").selectAll(".cols").data(colDat)
        .enter()
        .append("text")
        .attr("class", "cols")
        .attr("x", function(d){ return d.x; })
        .attr("y", function(d){ return d.y; })
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .text(function(d){
            if(d.val === " " || d.val === "undefined"){
                return "N/A";
            }
            var d3el = d3.select("#viz")
                .selectAll(".dummy")
                .data(" ")
                .enter()
                .append("text")
                .attr("class", "rows")
                .attr("id", "dummy")
                .text(d.val);

            console.log(d3el[0][0].clientWidth + " " + d.val);

            if (d3el[0][0].clientWidth > (1-vizFrac.width) * vizW()){
                d3el.remove();
                return d.val.substring(0,7) + "...";
            }

            d3el.remove();
            return d.val;
        }).on("mouseover", movetooltip)

    d3.select("#viz").selectAll(".titleage").data([
            q1 + " vs. " + q2
        ]).enter()
        .append("text")
        .attr("class", "titleage")
        .attr("x", vizW() / 2)
        .attr("y", vizFrac.titleHeight * vizH()/2)
        .attr("dy", "0em")
        .attr("text-anchor", "middle")
        .text(function(d){ return d; })
};
