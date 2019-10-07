
var express = require('express');
var app = express();
var fs = require('fs');
var port = 5500;
const fetch = require("node-fetch");
const hbs = require('express-handlebars')({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: {
      static(path) {
        return path;
      },
      escapeJSString(str) {
        if (! str) {
          return null;
        }
        return jsesc(str, {
          // escape everything to \xFF hex sequences so we don't have to worry about script tags and whatnot
          escapeEverything: true, 
          // wrap output with single quotes
          wrap: true 
        });
      }
    }
  });

app.engine('hbs', hbs);
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));

app.listen(port, function () {
    console.log('Server listening on localhost:%s', port);
});

/**
 * The Main Page
 */
app.get("/", function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    res.render("index", {date: new Date().toDateString()});
});

/**
 * The redirect to the proper weather page.
 */
app.get("/getweather", (req, res) => {
    console.log(req.query.lat);
    res.redirect(`./${req.query.lat}/${req.query.long}/weather`);
});

/**
 * The weather data.
 */
app.get("*/weather", (req, res) => {
    var pth = req.path.split('/');
    fetch('https://api.weather.gov/points/' + pth[1] + ',' + pth[2]).then(res => res.json()).then(data => {
        var cityName = data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state;
        res.send(`
            <link rel="stylesheet" href="/weather.css">
            <h1>${cityName}</h1>
            <h3>View the Weather for the following:</h3>
            <section>
            <ul>
            <li><a href="./today">Today</a></li>
            <li><a href="./hourly">Hourly</a></li>
            <li><a href="./weekly">Weekly</a></li>
            </ul>
            </section>
            <p><a href="/">Back</a></p>
        `);
    }).catch(err => {
        res.send(`
            <h1>Error: Cannot locate request area!</h1>
            <h2>Is the requested area inside of the United States?</h2>
        `);
    });
});

/**
 * Display the today day.
 */
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
            html += `<p id="error"><a href="./">Back</a></p>`;
            res.send(html);
        }).catch(e => { res.redirect('./') });

    }).catch(e => {res.redirect('./') });
});

app.get("*/weather/hourly", function (req, res) {
    var pth = req.path.split('/');
    fetch('https://api.weather.gov/points/' + pth[1] + ',' + pth[2]).then(res =>res.json()).then(data => {
        var cityName = data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state;
        fetch(data.properties.forecastHourly).then(res =>res.json()).then(data => {
            let html = `<link rel="stylesheet" href="../../../weather/weathera.css">`;
            html += `<h1 id='city'>${cityName}</h1>`;
            html += `<section id="hourly"><h2>Hourly</h2> <table id="hourlyTable"> <tr>`;
            var periods = data.properties.periods;
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
            html +="</tr></table></section>";
            html += `<p id="error"><a href="./">Back</a></p>`;
            res.send(html);
        });
    });
});

app.get("*/weather/weekly", function (req, res) {
    var pth = req.path.split('/');
    fetch('https://api.weather.gov/points/' + pth[1] + ',' + pth[2]).then(response => response.json()).then(data => {
        var cityName = data.properties.relativeLocation.properties.city + ", " + data.properties.relativeLocation.properties.state;
        fetch(data.properties.forecast).then(res =>{return res.json();}).then(data => {
            let html = `<link rel="stylesheet" href="../../../weather/weathera.css">`;
            html += `<h1 id='city'>${cityName}</h1>`
            html += "<section id='weekly'>"
            html += `<h2>Weekly</h2> <table id="weeklyTable"> <tr>`;
            var periods = data.properties.periods;
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
            html +="</tr></table></section>";
            html += `<p id="error"><a href="./">Back</a></p>`
            res.send(html);
        });
    });
})

app.get("/about", function (req, res) {
    res.render("about");
});

function getSymbol(shortForecast) {
    if (shortForecast.toLowerCase().includes("thunderstorm")) return "&#x26C8;&#xFE0E;";
    if (shortForecast.toLowerCase().includes("showers") && shortForecast.toLowerCase().includes("chance")) return "🌦&#xFE0E;";
    if (shortForecast.toLowerCase().includes("showers")) return "🌧";
    if (shortForecast.toLowerCase().includes("cloudy") && shortForecast.toLowerCase().includes("partly")) return "⛅";
    if (shortForecast.toLowerCase().includes("cloudy")) return "☁";

    return "☀";

}

function convertTime(date){
    var hours = date.getHours();
    hours = hours > 12 ? (hours - 12) + " PM" : hours + " AM";
    return hours;
}