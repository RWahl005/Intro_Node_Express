var o = getData();
var data;
try{
    data = `https:\\\\api.weather.gov/points/${o[0][1]},${o[1][1]}`;
}
catch(err){
    location.href = "/weather";
}

fetch(`https:\\\\api.weather.gov/points/${o[0][1]},${o[1][1]}`).then(e => {
    return e.json();
}).then(r =>{
    console.log(r);
    getCounty(r);
    document.getElementById("city").innerHTML = r.properties.relativeLocation.properties.city + ", " + r.properties.relativeLocation.properties.state;
}).catch(error => {
    document.getElementById("city").innerHTML = "Error: City not found!";
    document.getElementById("county").innerHTML = "Is the requested area within the United States?";
    document.getElementsByTagName("main")[0].innerHTML = 
    `<p id="error"><a href="index.html">Back</a></p>`;
})

function getCounty(r){
    fetch(r.properties.county).then(e => {
        return e.json();
    }).then(r =>{
        document.getElementById("county").innerHTML = r.properties.name + " County";
    }).catch(error => {
        document.getElementById("city").innerHTML = "Error: City not found!";
    document.getElementById("county").innerHTML = "Is the requested area within the United States?";
    document.getElementsByTagName("main")[0].innerHTML = 
    `<p id="error"><a href="index.html">Back</a></p>`;
    });
}

// function displayToday(){
//     fetch(data).then(e =>{
//         return e.json();
//     }).then(r => {
//         fetch(r.properties.forecast).then(e =>{return e.json();}).then(r => {
//             document.querySelector("#today > h3").innerHTML = new Date().toDateString();
//             for(var i = 0; i < 3; i++){
//                 document.getElementById("t" + (i + 1)).innerHTML = r.properties.periods[i].name;
//                 document.getElementById("t" + (i + 1) + "symbol").innerHTML = getSymbol(r.properties.periods[i].shortForecast);
//                 document.getElementById("t" +  (i + 1) + "forecast").innerHTML = r.properties.periods[i].shortForecast;
//                 document.getElementById("t" + (i + 1) + "temp").innerHTML = "Temperature: " + r.properties.periods[i].temperature + r.properties.periods[i].temperatureUnit;
//                 document.getElementById("t" + (i + 1) + "wind").innerHTML = "Wind: " + r.properties.periods[i].windSpeed  + " " + r.properties.periods[i].windDirection;
//                 document.getElementById("t" + (i + 1) + "desc").innerHTML = r.properties.periods[i].detailedForecast;
//                 console.log(i);
//             }
//         });
//     });
// }

function displayToday(){
    fetch(data).then(e =>{
        return e.json();
    }).then(r => {
        fetch(r.properties.forecast).then(e =>{return e.json();}).then(r => {
            document.getElementById("info").innerHTML = "";
            var sec = document.createElement("section");
            sec.id = "today";
            var html = `<h2>Today</h2><h3>${new Date().toDateString()}</h3>`;
            for(var i = 0; i < 3; i++){
                html += `<section id="t${i}">`
                html += `<h4 id="t${i}">${r.properties.periods[i].name}</h4>`;
                html += `<p class="symbol" id="t${i}symbol"> ${getSymbol(r.properties.periods[i].shortForecast)}</p>`;
                html += `<p id="t${i}forecast">${r.properties.periods[i].shortForecast}</p>`;
                html += `<ul><li id="t${i}temp">Temperature: ${r.properties.periods[i].temperature + r.properties.periods[i].temperatureUnit} </li> 
                <li id="t${i}wind">Wind: ${r.properties.periods[i].windSpeed  + " " + r.properties.periods[i].windDirection}</li></ul>`;
                html += `<h5>Detailed Description:</h5> <p id="t${i}desc">${r.properties.periods[i].detailedForecast}</p>`;
                html += `</section>`
            }
            sec.innerHTML = html;
            document.getElementById("info").appendChild(sec);
        }).catch(error => {
            document.getElementById("city").innerHTML = "Error: City not found!";
            document.getElementById("county").innerHTML = "Is the requested area within the United States?";
            document.getElementsByTagName("main")[0].innerHTML = `<p id="error"><a href="index.html">Back</a></p>`;
            return;
        });
    }).catch(error => {
        document.getElementById("city").innerHTML = "Error: City not found!";
    document.getElementById("county").innerHTML = "Is the requested area within the United States?";
    document.getElementsByTagName("main")[0].innerHTML = `<p id="error"><a href="index.html">Back</a></p>`;
        return;
    })
}


function getSymbol(shortForecast){
    if(shortForecast.toLowerCase().includes("thunderstorm")) return "&#x26C8;&#xFE0E;";
    if(shortForecast.toLowerCase().includes("showers")&& shortForecast.toLowerCase().includes("chance")) return "🌦&#xFE0E;";
    if(shortForecast.toLowerCase().includes("showers")) return "🌧";
    if(shortForecast.toLowerCase().includes("cloudy") && shortForecast.toLowerCase().includes("partly")) return "⛅";
    if(shortForecast.toLowerCase().includes("cloudy")) return "☁";

    return "☀";

}

function clickToday(){
    document.getElementById("info").style.display = "block";
    document.getElementById("hourly").style.display = "none";
    document.getElementById("weekly").style.display = "none";
    displayToday();
}

function clickWeekly(){
    document.getElementById("info").style.display = "none";
    document.getElementById("hourly").style.display = "none";
    document.getElementById("weekly").style.display = "block";
    displayWeekly();
}

function displayWeekly(){
    fetch(data).then(e =>{
        return e.json();
    }).then(r => {
        fetch(r.properties.forecast).then(e =>{return e.json();}).then(r => {
            var html = `<h2>Weekly</h2> <table id="weeklyTable"> <tr>`;
            var periods = r.properties.periods;
            for(var i = 0; i < periods.length; i++){
                if(periods[i].name.includes("Night")) continue;
                html += `<th>${periods[i].name}</th>`;
            }
            html += "</tr><tr>";
            for(var i = 0; i < periods.length; i++){
                if(periods[i].name.includes("Night")) continue;
                html += `<td>${getSymbol(periods[i].shortForecast)}</td>`;
            }
            html +="</tr><tr>";
            for(var i = 0; i < periods.length; i++){
                if(periods[i].name.includes("Night")) continue;
                html += `<td>${periods[i].temperature + periods[i].temperatureUnit}</td>`;
            }
            html +="</tr></table>";
            document.getElementById("weekly").innerHTML = html;
        });
    });
}

function getData(){
    var b = window.location.search.replace("?", "").split("&");
    var c = [];
    for(var i in b){
        var d = b[i].split("=");
        c.push([d[0], d[1]]);
    }
    return c;
}

function convertTime(date){
    var hours = date.getHours();
    hours = hours > 12 ? (hours - 12) + " PM" : hours + " AM";
    return hours;
}

function clickHour(){
    document.getElementById("info").style.display = "none";
    document.getElementById("hourly").style.display = "block";
    document.getElementById("weekly").style.display = "none";
    displayHourly();
}

function displayHourly(){
    fetch(data).then(e =>{
        return e.json();
    }).then(r => {
        fetch(r.properties.forecastHourly).then(e =>{return e.json();}).then(r => {
            var html = `<h2>Hourly</h2> <table id="hourlyTable"> <tr>`;
            var periods = r.properties.periods;
            for(var i = 0; i < 9; i++){
                html += `<th>${convertTime(new Date(periods[i].startTime))}</th>`;
            }
            html += "</tr><tr>";
            for(var i = 0; i < 9; i++){
                html += `<td>${getSymbol(periods[i].shortForecast)}</td>`;
            }
            html +="</tr><tr>";
            for(var i = 0; i < 9; i++){
                html += `<td>${periods[i].temperature + periods[i].temperatureUnit}</td>`;
            }
            html +="</tr></table>";
            document.getElementById("hourly").innerHTML = html;
        });
    });
}

function buttonClick(name){
    if (name == "today"){
        window.location.href = "/weather/today" + location.search;
    }
    if (name === "hourly"){
        window.location.href =  "/weather/hourly" + location.search;
    }
    if (name === "weekly"){
        window.location.href =  "/weather/weekly" + location.search;
    }
}