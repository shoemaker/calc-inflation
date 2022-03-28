/*
https://www.bls.gov/help/hlpforma.htm#CU
http://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0
http://inflationdata.com/inflation/Inflation_Articles/CalculateInflation.asp
*/

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    _ = require('lodash'),
    moment = require('moment'),
    request = require('request');
    async = require('async');

var c = require('../config').config;  // App configuration


/*
 * Request CPI data for each year between the startYear and today. 
 */ 
exports.getCPIData = function(startYear) {

    function addReq(dStart, dEnd) {  

        // The actual function to return. 
        return function(done) { 
            // Build up the request URL and options. 
            var dataUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
            var options = { 
                uri: url.parse(dataUrl),
                method: 'POST',
                json: true,
                timeout: c.requestTimeout,
                body: {
                    'seriesid' : ['CUUR0000SA0'],  // CPI, Urban Consumer: https://www.bls.gov/help/hlpforma.htm#CU
                    'startyear': dStart,
                    'endyear' : dEnd,
                    'registrationKey' : c.blsAPIKey
                }
            };

            // Request Chained-CPI data. 
            request(options, function (error, response, body) {
                try {
                    if (body.status == 'REQUEST_FAILED') {  // Problem with BLS API. 
                        throw JSON.stringify(body.message);
                    } else if (!error && response.statusCode == 200) {  // Good response, proceed. 
                        var data = body.Results.series[0].data;  // Grab the data we're interested in.                 
                        data = _.orderBy(data, ['year','period'], ['asc','asc']);  // Sort by year, then month. 
                        done(null, data);
                    } else {  // Problem with request. 
                        throw error;
                    }
                } catch (ex) {
                    var errorMsg = 'ERROR retrieving CPI data. ' + ex;
                    done(errorMsg, data);
                } 
            });
        }
    }  // END addReq().

    var reqQueue = [];  // Array of BLS API requests.
    var endYear = moment();
    // No inflation data for the first month of the year. 
    if (endYear.month() == 0) {
        endYear = endYear.subtract(1, 'year').year();
    } else {
        endYear = endYear.year();
    }
    
    startYear = parseInt(startYear);  // Make sure the start year is an int.
    const MAX_REQUEST_YEARS = 10;  // The maximum number of years of data to request at a time. 

    while (startYear <= (endYear)) { 
        if ((endYear - startYear) > MAX_REQUEST_YEARS) reqQueue.push(addReq(startYear, (startYear + MAX_REQUEST_YEARS)));
        else reqQueue.push(addReq(startYear, endYear));

        startYear += MAX_REQUEST_YEARS + 1;
    }

    return new Promise((resolve, reject) => {
        async.series(reqQueue, function(err, results) {
            if (err) {
                reject(err);
                return;
            }

            // Combine the results
            var final = [];
            _.forEach(results, function (result) {
                final = _.concat(final, result);
            });
    
            resolve(final);
        });
    });
}; 