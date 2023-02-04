const express = require('express')
const request = require('request')
const cheerio = require('cheerio')
const serverless = require('serverless-http')
const app = express()
const router = express.Router();

const url = "https://apmcamreli.com/rate.php";

// This resolve access control allow origin error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


router.get('/', (req, res) => {
    res.send({
        "Welcome to APMC Amreli API": "https://apmcamreli.com/rate.php",
        "API": "https://apmcamreli.com/.netlify/functions/api/apmc-amreli"

    })
})


router.get("/apmc-amreli", function (req, res) {
    request(url, function (error, response, html) {
        if (!error) {
            const $ = cheerio.load(html);

            let APMCdata = [];
            let productNames = [];
            let maxPrices = [];

            // get the value of current date in #hp element
            const date = $("#hp").val();

            APMCdata.push({ date: date, });

            // get value of productname class, list of all product names
            $(".productname").each(function (i, element) {
                const productName = $(this).text();
                productNames.push(productName);
            });

            // get vakue of maxprice class ==> it is mixing of min amd max value

            $(".maxprice").each(function (i, element) {
                const maxPrice = $(this).text();
                maxPrices.push(maxPrice);
            });

            // for loop to push data in array, it shows response data
            let j = 0;
            for (let i = 0; i < productNames.length; i++) {
                APMCdata.push({
                    product: productNames[i],
                });
                //set value of price in array
                APMCdata[i].minPrice = maxPrices[j];
                APMCdata[i].maxPrice = maxPrices[j + 1];
                j = j + 2;
            }

            // send data in json format
            res.send(JSON.stringify(APMCdata));

        }
    });
});

app.use('/', router)

module.exports.handler = serverless(app)