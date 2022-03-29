var fs = require('fs'), 
    moment = require('moment'),
    _ = require('lodash');

var c = require('../config').config,  // App configuration
    bls = require('./bls');


/*
 * 1) Load input dates and values. 
 * 2) Retrieve BLS inflation data. 
 * 3) Calculate the inflation adjusted values. 
 * 4) Return the result.
*/
exports.calcInflationFromFile = function(filename, callback) {
    var inputs;

    loadInputFile(filename)  // Load the dates/values to calculate. 
    .then(function (inputValues) {
        inputs = inputValues;
        return findFirstYear(inputValues);  // Find the earliest year to search. 
    })
    .then(function (firstDate) {
        var startYear = firstDate.year();
        return bls.getCPIData(startYear);  // Retrieve CPI data for date range. 
    })
    .then(function(cpiData) { 
        return calculateInflation(inputs, cpiData);  // Calculate inflation
    })
    .then(function(summary) { 
        callback(null, summary);
    })
    .catch(function(ex) { 
        callback(ex);
    }); 
}

/*
 * Load the input file with dates/values to be adjusted for inflation.
 */
function loadInputFile(filename) {
    return new Promise((resolve, reject) => {
        // Load the config file. 
        fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                reject(err);
                return;
            } else {
                data = JSON.parse(data);
                resolve(data);
            }
        });
    });
}


/*
 * From a list of dates/years, determine the earliest year. 
 */
function findFirstYear(inputValues) {
    var firstDate = moment();
    
    return new Promise((resolve, reject) => {
        // Loop through all the values, look for earliest date. 
        _.forEach(inputValues, function(value, key) {
            var newDate = moment(value.date, 'MM/DD/YYYY');
            if (newDate.isBefore(firstDate)) { firstDate = newDate; }
        });

        resolve(firstDate);
    });
}

/*
 * Update the input data with a new inflation-adjusted current value. 
 */
function calculateInflation(inputValues, cpiData) { 
    return new Promise((resolve, reject) => {
        try {
            // Find the last inflation value
            var lastCpi = _.last(cpiData).value;

            _.forEach(inputValues, function(dataPoint) {
                var theDate = moment(dataPoint.date, 'MM/DD/YYYY');

                try {
                    var cpi = _.find(cpiData, function(o) { return (o.year == theDate.year() && o.periodName == theDate.format('MMMM')); }).value;  // Exact month 
                } catch (ex) {
                    cpi = lastCpi;  // If date is too recent, no CPI data. 
                }

                // Calculate the inflation-adjusted value
                var adj = ((lastCpi - cpi)/cpi) + 1; 
                dataPoint.currValue = dataPoint.value * adj;

                // Round it. 
                dataPoint.currValue = _.round(dataPoint.currValue, 2);
            });

            resolve(inputValues);
        } catch (ex) {
            reject(ex)
        }
    });
}