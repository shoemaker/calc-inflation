var expect = require('expect.js'),
    moment = require('moment');

var bls = require('../controllers/bls');

// Test the BLS controller
describe('Bureau of Labor Statistics', function() {
    var response,
        startDate = moment().subtract(25, 'years').startOf('year'),
        monthCount = moment().diff(startDate, 'months');

    // Retreive data to power these tests. 
    before(function(finished) {
        this.timeout(10000);
        
        bls.getCPIData(startDate.format('YYYY'))  // Retrieve CPI data for date range. 
        .then(function(cpiData) { 
            response = cpiData;
            finished();
        })
        .catch(ex => console.log(ex));
    });

    it('should have real data', function() {
        expect(response).to.not.be.null;
    });

    it('should return around ' + monthCount + ' records', function() {
        expect(response.length).to.be.within(monthCount-1, monthCount+1);  // BLS may not have published current month when test is run. 
    });
});