
var express = require('express');
var app = express();
var fs = require('fs');
var port = 5500;
const fetch = require("node-fetch");

app.use(express.static(__dirname + '/public'));

app.listen(port, function () {
    console.log('Server listening on localhost:%s', port);
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get("*/weather", (req, res) => {
    var pth = req.path.split('/');
    fetch('https://api.weather.gov/points/' + pth[1] + ',' + pth[2]).then(res => res.json()).then(data => {
        var cityName = data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state;
        res.send(`
            <h1>${cityName}</h1>
            <h3>View the Weather for the following:</h3>
            <ul>
            <li><a href="./today">Today</a></li>
            <li><a href="./hourly">Hourly</a></li>
            <li><a href="./weekly">Weekly</a></li>
            </ul>
        `);
    }).catch(err => {
        res.send(`
            <h1>Error: Cannot locate request area!</h1>
            <h2>Is the requested area inside of the United States?</h2>
        `);
    });
});

app.get("*/weather/today", function (req, res) {
    var pth = req.path.split('/');
    fetch('https://api.weather.gov/points/' + pth[1] + ',' + pth[2]).then(res => res.json()).then(data => {
        var cityName = data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state;
        fetch(data.properties.forecast).then(res => res.json()).then(data => {
            let html = `<link rel="stylesheet" href="../../../weather/weathera.css">`;
            html += `<h1 id='city'>${cityName}</h1>`
            html += `<section id='info'><h2>Today</h2><h3>${new Date().toDateString()}</h3>`;
            for (var i = 0; i < 3; i++) {
                html += `<section id="t${i}">`
                html += `<h4 id="t${i}">${data.properties.periods[i].name}</h4>`;
                html += `<p class="symbol" id="t${i}symbol"> ${getSymbol(data.properties.periods[i].shortForecast)}</p>`;
                html += `<p id="t${i}forecast">${data.properties.periods[i].shortForecast}</p>`;
                html += `<ul><li id="t${i}temp">Temperature: ${data.properties.periods[i].temperature + data.properties.periods[i].temperatureUnit} </li> 
                <li id="t${i}wind">Wind: ${data.properties.periods[i].windSpeed + " " + data.properties.periods[i].windDirection}</li></ul>`;
                html += `<h5>Detailed Description:</h5> <p id="t${i}desc">${data.properties.periods[i].detailedForecast}</p>`;
                html += `</section>`
            }
            html += '</section>'
            res.send(html);
        }).catch(e => { res.send(e); });

    }).catch(e => { res.redirect('./') });
    // res.sendFile(__dirname + "/today.html");
});

app.get("/weather/hourly", function (req, res) {
    res.sendFile(__dirname + "/hourly.html");
});

app.get("/weather/weekly", function (req, res) {
    res.sendFile(__dirname + "/weekly.html");
})

app.get("/about", function (req, res) {
    var html;
    fetch('https://api.weather.gov/gridpoints/LWX/95,70/forecast').then(e => { return e.json(); }).then(r => {
        html += `<h2>Today</h2><h3>${new Date().toDateString()}</h3>`;
        for (var i = 0; i < 3; i++) {
            html += `<section id="t${i}">`
            html += `<h4 id="t${i}">${r.properties.periods[i].name}</h4>`;
            html += `<p class="symbol" id="t${i}symbol"> ${getSymbol(r.properties.periods[i].shortForecast)}</p>`;
            html += `<p id="t${i}forecast">${r.properties.periods[i].shortForecast}</p>`;
            html += `<ul><li id="t${i}temp">Temperature: ${r.properties.periods[i].temperature + r.properties.periods[i].temperatureUnit} </li> 
            <li id="t${i}wind">Wind: ${r.properties.periods[i].windSpeed + " " + r.properties.periods[i].windDirection}</li></ul>`;
            html += `<h5>Detailed Description:</h5> <p id="t${i}desc">${r.properties.periods[i].detailedForecast}</p>`;
            html += `</section>`
        }
        res.send(`<h1>Example Weather API Usage</h1>
            <h3>Weather for Washington, D.C.:</h3>
            <section id="weather">${html}</section>`);
    });
});

app.get("/weather", function (req, res) {
    res.send("Please specify a location to get the weather for. <a href='/'>Back</a>");
})

function getSymbol(shortForecast) {
    if (shortForecast.toLowerCase().includes("thunderstorm")) return "&#x26C8;&#xFE0E;";
    if (shortForecast.toLowerCase().includes("showers") && shortForecast.toLowerCase().includes("chance")) return "🌦&#xFE0E;";
    if (shortForecast.toLowerCase().includes("showers")) return "🌧";
    if (shortForecast.toLowerCase().includes("cloudy") && shortForecast.toLowerCase().includes("partly")) return "⛅";
    if (shortForecast.toLowerCase().includes("cloudy")) return "☁";

    return "☀";

}