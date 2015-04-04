
// {{{ prepare color hash
var fs = require('fs');
var file = fs.readFileSync('colors.json', 'utf8').replace(/,}/g, '}');
var d_colors = JSON.parse(file);
var colors = {};
for (var key in d_colors) {
    var c = d_colors[key];
    colors[c.name.toLowerCase()] = c;
}

// }}}

var hue = require("node-hue-api"),
    lightState = hue.lightState;

var host = "192.168.1.2",
    username = "newdeveloper",
    hueApi = new hue.HueApi(host, username);

var handleLightCommand = function(command) {
    var state = lightState.create();

    if (command.match(/(turn.*on|on)/)) {
        state = state.on();
    } else if (command.match(/(turn.*off|off)/)) {
        state = state.off().transition(0);
    }

    if (command.match(/brightness/)) {
        if (command.match(/full|up|max|raise/)) {
            state = state.brightness(100);
        } else if (command.match(/half|down|lower/)) {
            state = state.brightness(50);
        }
    }

    if (command.match(/color|colored/)) {
        for (var c in colors) {
            if (command.indexOf(c) !== -1) {
                state = state.rgb(colors[c].rgb);
            }
        }
    }

    setLightState(state);
};

var setLightState = function(state) {
    for (var i = 1; i <= 3; i++) {
        hueApi.setLightState(i, state, function(err, lights) {
            if (err) {
                console.log(err);
            }
        });
    }
};


var express = require('express');
var app = express();

app.get('/command', function(req, res) {
    var command = req.query.command;
    console.log("New Command: " + command);

    if (command.match(/light|lights/)) {
        handleLightCommand(command);
    }

    res.status(200).end();
});

console.log('Starting on port 8001');
app.listen(8001);
