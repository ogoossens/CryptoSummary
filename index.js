// See Github for more info

// Modules
let express = require('express');
let request = require('request');

// Favicon middleware
let favicon = require('serve-favicon');
let app = express();

// Cached Exchange data
let exchangeData = [];
let urlBuilderData = [];

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

        // Log the request for analysis
        console.log("New REQUEST: " + temp + " BY: " + req.connection.remoteAddress);

        // Request data
        let currency = temp[0];

        if (!(currency == "EUR" || currency == "USD")) {
            res.render('error', {
                fromURL: true,
                urlBuilderData: urlBuilderData
            });
            return;
        }

        // We got the currency, lets delete the first element
        temp.shift();

        // Statistic data
        let investedValue = 0;
        let currentValue = 0;
        let totalPercentageDifference = 0;

        // Lets divide this array into an array of objects
        let toParse = [];
        for (let i = 0; i < temp.length; i++) {
            // Split the string
            let onePart = temp[i].split("*");

            // Now go through the object and fill in the data
            toParse[i] = {
                coinSymbol: onePart[0],
                currency: currency,
                pair: onePart[0] + currency,
                amountBought: onePart[1],
                boughtFor: onePart[2],
                invested: onePart[1] * onePart[2],
                currentValueOfOne: "",
                currentValueOfAll: "",
                thisDifference: "",
                percentageDifference: ""
            };

            // Calculate the values
            toParse[i].currentValueOfOne = getCurrentValueFor(toParse[i].coinSymbol, toParse[i].currency);
            toParse[i].currentValueOfAll = toParse[i].currentValueOfOne * toParse[i].amountBought;

            // Calculate the difference
            toParse[i].thisDifference = toParse[i].currentValueOfAll - toParse[i].invested;

            // Calculate the percentage of this one trade
            toParse[i].percentageDifference = percentageString(toParse[i].currentValueOfAll, toParse[i].invested);

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

        // Count the total percentage difference of your portfolio
        totalPercentageDifference = percentageString(currentValue, investedValue);

        // Round the difference value
        differenceValue = roundNumber(differenceValue);

        // Ok the info was parsed, time to let EJS take over
        res.render('index', {
            differenceValue: differenceValue,
            currentValue: currentValue,
            investedValue: investedValue,
            toParse: toParse,
            currency: currency,
            totalPercentageDifference: totalPercentageDifference
        });
    } else res.render('error', {
        fromURL: false,
        urlBuilderData: urlBuilderData
    });
});

// Update the coins for the first time
updateAllCoins();

// Schedule update for every 55 seconds
setInterval(function () {
    updateAllCoins();
}, 55000);

// Start listening for requests
app.listen(port);

// Use async to collect results
function getCurrentValueFor(coinSymbol, currency) {
    for (let i = 0; i < exchangeData.length; i++) {
        if (coinSymbol == exchangeData[i].symbol) {
            return exchangeData[i][currency];
        }
    }
}

function updateAllCoins() {
    console.log("COIN UPDATE: started");

    // Coinbase source
    let tempArray = [];

    request('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=250', function (error, response, body) {
        if (error) {
            console.log('Error:' + error);
        }
        if (response.body.toString('utf-8').charAt(0) == "[") {
            tempArray = JSON.parse(response.body.toString('utf-8'));

            exchangeData = [];
            urlBuilderData = [];

            for (let i = 0; i < tempArray.length; i++) {
                exchangeData.push({
                    name: tempArray[i].name,
                    symbol: tempArray[i].symbol,
                    USD: tempArray[i].price_usd,
                    EUR: tempArray[i].price_eur
                });
                if (i < 50) {
                    urlBuilderData.push({
                        name: tempArray[i].name,
                        symbol: tempArray[i].symbol,
                    })
                }
            }
            console.log("COIN UPDATE: done");

        } else {
            console.log('Error: SOMETHING DIFFERENT RETURNED');
        }
    });
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

function percentageString(newValue, oldValue) {
    if (oldValue === 0) {
        return "0.0%";
    }
    if (newValue >= oldValue) {
        return "+" + roundNumber((newValue - oldValue) / oldValue * 100) + "%";
    } else {
        return "-" + roundNumber((oldValue - newValue) / oldValue * 100) + "%";
    }
}
