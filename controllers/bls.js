/*
http://www.bls.gov/help/hlpforma.htm#su
http://api.bls.gov/publicAPI/v2/timeseries/data/SUUR0000SA0
http://inflationdata.com/inflation/Inflation_Articles/CalculateInflation.asp
*/

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    Promise = require('bluebird'),
    _ = require('lodash'),
    moment = require('moment'),
    request = require('request');

var c = require('../config').config;  // App configuration


/*
 * Request CPI data for each between the startYear and today. 
 */ 
exports.getCPIData = function(startYear) {
    var d = Promise.defer();
    
    var endYear = moment();
    // No inflation data for the first month of the year. 
    if (endYear.month() == 0) {
        endYear = endYear.subtract(1, 'year').year();
    } else {
        endYear = endYear.year();
    }

    // Build up the request URL and options. 
    var dataUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
    var options = { 
        uri: url.parse(dataUrl),
        method: 'POST',
        json: true,
        timeout: c.requestTimeout,
        body: {
            'seriesid' : ['SUUR0000SA0'],
            'startyear': startYear,
            'endyear' : endYear,
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
                
                d.resolve(data);
            } else {  // Problem with request. 
                throw error;
            }
        } catch (ex) {
            var errorMsg = 'ERROR retrieving CPI data. ' + ex;
            d.reject(error);
        } 
    });

    return d.promise;
}; 


/*
 * Determine the average inflation rate for each year in range. 
 */
function getAnnualAverage(data) {
    results = [];

    // Find the unique years in the data
    var uniqYears = _.uniqBy(data, 'year'); 
    var years = [];
    _.forEach(uniqYears, function(year) {
        years.push(year.year);
    });

    // Loop through the years, find the average inflation rate for each year. 
    _.forEach(years, function(year) {
        var currYear = _.filter(data, { 'year' : year }); 
        var avgRate = 0;

        // Add up the rate for each month of the year. 
        _.reduce(currYear, function(result, value, key) { 
            return avgRate += _.toNumber(value.value);
        }); 

        // Find the average for the current year. 
        avgRate = avgRate / (currYear.length); 

        // Add this year to the results. 
        results.push({ 'year' : year, 'value' : avgRate});
    });

    return results;
}

