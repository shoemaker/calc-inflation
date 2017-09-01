# calc-inflation
Node.js console app to bulk calculate inflation-adjusted values, with data from the [Bureau of Labor Statistics](http://www.bls.gov/developers/home.htm).

## Configuration
1. Rename 'sample-config.js' to 'config.js' or obtain the decryption key for the Makefile. 
2. **Register for a BLS API Key**. API requests to the Bureau of Labor Statistics require an API key. [Create an API account](http://data.bls.gov/registrationEngine/) with the BLS to obtain an API key. 
3. Paste your new API key into the `blsAPIKey` property in 'config.js'. 
4. Populate 'input.json' with the dates and values you wish to find the current inflation-adjusted values. 

## Use It 
    $> npm install
    $> npm start
The console app will request CPI data from the BLS, calculate the inflation-adjusted values found in 'input.json', then write a CSV file. 

## Tests
Using [Mocha](http://mochajs.org/) and [Expect](https://github.com/LearnBoost/expect.js) to test the BLS API. 
    
    $> npm test
