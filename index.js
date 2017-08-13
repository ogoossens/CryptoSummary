// Supports
// See Github for more info

// Modules
let express = require('express');
let request = require('request');

// Favicon middleware
let favicon = require('serve-favicon');
let app = express();

// Cached Kraken data
let krakenData = {
    XBTEUR: "",
    ETHEUR: "",
    XRPEUR: "",
    LTCEUR: "",
    BCHEUR: "",
    XLMEUR: "",
    DASHEUR: "",
    EOSEUR: "",
    ETCEUR: ""
};

// Port specified
let port = process.env.PORT || 80;

// This allows loading anything that has / assets
// from the "public folder"
app.use(express.static('public'));

// Well use EJS for out templating
app.set('view engine', 'ejs');

// Return the favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// Main function for /
app.use("/", function (req, res) {

    // First check if there is at least one parameter in the URL
    if (Object.keys(req.query).length > 0) {
        // There is at least one parameter, so - lets build arrays to check
        // Wanted to use object.values but its support on this Node version .. meh
        // With this we get an array of values of the object
        let temp = Object.keys(req.query).map((k) => req.query[k]);

        // Statistic data
        let investedValue = 0;
        let currentValue = 0;

        // Lets divide this array into an array of objects
        let toParse = [];
        for (let i = 0; i < temp.length; i++) {
            // Now go through the object and fill in the data
            toParse[i] = {
                pair: temp[i].split("*")[0],
                amountBought: temp[i].split("*")[1],
                boughtFor: temp[i].split("*")[2],
                invested: temp[i].split("*")[1] * temp[i].split("*")[2],
                currentValueOfOne: krakenData[temp[i].split("*")[0]],
                currentValueOfAll: krakenData[temp[i].split("*")[0]] * temp[i].split("*")[1],
                thisDifference: ""
            };

            // Calculate the difference
            toParse[i].thisDifference = toParse[i].currentValueOfAll - toParse[i].invested;

            // Count all the results together
            investedValue = investedValue + toParse[i].invested;
            currentValue = currentValue + toParse[i].currentValueOfAll;

            // Round up the values (after we counted them in)
            toParse[i].invested = roundNumber(toParse[i].invested);
            toParse[i].currentValueOfAll = roundNumber(toParse[i].currentValueOfAll);
            toParse[i].thisDifference = roundNumber(toParse[i].thisDifference);
        }

        // Round the values
        investedValue = roundNumber(investedValue);
        currentValue = roundNumber(currentValue);

        // Count the difference between the day you got them and now
        let differenceValue = currentValue - investedValue;
        differenceValue = roundNumber(differenceValue);


        // Ok the info was parsed, time to let EJS take over
        res.render('index', {
            differenceValue: differenceValue,
            currentValue: currentValue,
            investedValue: investedValue,
            toParse: toParse
        });
    } else res.render('error');
});

// Update the coins for the first time
updateAllCoins();

// Schedule update for every 55 seconds
setInterval(function () {
    updateAllCoins();
}, 55000);

// Start listening for requests
app.listen(port);

// Function to parse Kraken API for current values
// Use async to collect results
function getCurrentValueFor(pairName) {

    let resultPairName = "";

    switch (pairName) {

        case "XBTEUR":
            // BTC / EUR
            resultPairName = "XXBTZEUR";
            break;
        case "ETHEUR":
            // ETH / EUR
            resultPairName = "XETHZEUR";
            break;
        case "XRPEUR":
            // XRP / EUR
            resultPairName = "XXRPZEUR";
            break;
        case "LTCEUR":
            // LTC / EUR
            resultPairName = "XLTCZEUR";
            break;
        case "BCHEUR":
            // BCH / EUR
            resultPairName = "BCHEUR";
            break;
        case "XLMEUR":
            // BCH / EUR
            resultPairName = "XXLMZEUR";
            break;
        case "DASHEUR":
            // BCH / EUR
            resultPairName = "DASHEUR";
            break;
        case "EOSEUR":
            // BCH / EUR
            resultPairName = "EOSEUR";
            break;
        case "ETCEUR":
            // BCH / EUR
            resultPairName = "XETCZEUR";
            break;
    }

    // Now we know the pairName and the resultPair name
    // No idea why Kraken keeps that separate?
    request('https://api.kraken.com/0/public/Ticker?pair=' + pairName, function (error, response, body) {
        if (error) {
            console.log('Error:' + error);
        }
        if (!(response.body.toString('utf-8').charAt(0) == "<")) {
            krakenData[pairName] = JSON.parse(response.body.toString('utf-8')).result[resultPairName].c[0];
        } else {
            console.log('Error: KRAKEN RETURNING HTML, offline?');
        }
    });
}

function updateAllCoins() {
    console.log("Updating all coins");
    for (let i = 0; i < Object.keys(krakenData).length; i++) {
        getCurrentValueFor(Object.keys(krakenData)[i]);
    }
}

function roundNumber(num) {
    let scale = 2;
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        let arr = ("" + num).split("e");
        let sig = "";
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}