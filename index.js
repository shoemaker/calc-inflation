var path = require('path'),
    fs = require('fs'),
    Handlebars = require('handlebars');

var inflation = require('./controllers/inflation'),
    c = require('./config').config;  // App configuration

// Find the path to the input file. 
var filePath = path.join(__dirname, c.inputFile);

// Calculate the inflation-adjusted values from input file. 
inflation.calcInflationFromFile(filePath, function(error, data) {
    try {
        if (error) { throw ex; }  // Check for a problem. 
        writeOutputFile(data);  // Write the file
    } catch (ex) {
        console.log(ex);
    }
});


/* 
 * Combine the data with a template, write the file. 
 */ 
function writeOutputFile(data) {
    // Read the template. 
    fs.readFile(process.cwd() + '/views/csv.hbs', 'utf8', function(err, template) {
        template = Handlebars.compile(template);
        var result = template(data);    

        // Write the file. 
        fs.writeFile(c.outputFile, result, 'utf8', function() {
            console.log(result);
            console.log('Output file written to', c.outputFile); 
        });
    });
}