var expect = require('expect.js'),
    moment = require('moment');

var bls = require('../controllers/bls');

// Test the BLS controller
describe('Bureau of Labor Statistics', function() {
    var response,
        startDate = moment().subtract(5, 'years'),
        monthCount = moment().diff(startDate, 'months');

    // Retreive data to power these tests. 
    before(function(finished) {
        this.timeout(10000);
        
        bls.getCPIData(startDate.format('YYYY'))  // Retrieve CPI data for date range. 
        .catch(function(ex) {
            console.log(ex);
        })
        .done(function(cpiData) { 
            response = cpiData;
            finished();
        }); 
    });

    it('should have real data', function() {
        expect(response).to.not.be.null;
    });

    it('should return around ' + monthCount + ' records', function() {
        expect(response.length).to.be.within(monthCount-1, monthCount+1);  // BLS may not have published current month when test is run. 
    });
});