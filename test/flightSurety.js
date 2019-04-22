var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
var Web3 = require("web3")
contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);

  });

  let newAirline1 = accounts[3];
  let newAirline2 = accounts[4];
  let newAirline3 = accounts[5];
  let newAirline4 = accounts[6];
  let newAirline5 = accounts[7];
  
  var date = new Date();
  let flights = {
    'AA123': [date.getTime() + 1, newAirline1],
    'ND063': [date.getTime() + 1011, newAirline2]
  }

  let passenger1 = accounts[8];
  let passenger2 = accounts[9];

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");
  });

  it('Owner registers the first airline', async () => {
 
    // ACT
    await config.flightSuretyApp.registerAirline(newAirline1, {from: config.owner});
    let result = await config.flightSuretyApp.isAirline.call(newAirline1); 
    
    // ASSERT
    assert.equal(result, true, "Airline is registered");

  });

  it('First airline registers a second airline', async () => {

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline2, {from: newAirline1});
    let result = await config.flightSuretyApp.isAirline.call(newAirline2); 
    
    // ASSERT
    assert.equal(result, true, "Second airline is registered");
    
  });

  it('Total of four airlines are register in sequence', async () => {

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline3, {from: newAirline2});
    await config.flightSuretyApp.registerAirline(newAirline4, {from: newAirline3});
    let result = await config.flightSuretyApp.isAirline.call(newAirline4); 
    
    // ASSERT
    assert.equal(result, true, "Fourth airline is registered");
    
  });


  it('Fifth airline not added yet', async () => {

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline5, {from: newAirline1});
    let result = await config.flightSuretyApp.isAirline.call(newAirline5); 
    
    // ASSERT
    assert.equal(result, false, "Fifth airline not added yet");
    
  });

  it('Fifth airline added with enough votes', async () => {

    // ACT
    await config.flightSuretyApp.registerAirline(newAirline5, {from: newAirline2});
    let result = await config.flightSuretyApp.isAirline.call(newAirline5); 
    
    // ASSERT
    assert.equal(result, true, "Fifth airline added with enough votes");
    
  });

  it('Airline1 is not funded yet', async () => {

    // ACT
    let result = await config.flightSuretyApp.isAirlineFunded.call(newAirline1); 
    
    // ASSERT
    assert.equal(result, false, "Airline1 is not funded yet");
    
  });



  it('Funding of airline 1', async () => {

    // ACT
    await config.flightSuretyApp.fund({from: newAirline1, value: Web3.utils.toWei('10', 'ether')});
    let result = await config.flightSuretyApp.isAirlineFunded.call(newAirline1); 
    
    // ASSERT
    assert.equal(result, true, "Airline1 is funded yet");
    
  });
  
  it('Airline 1 register a flight and passenger 1 pays for insurance', async () => {

    let flightCode = 'AA123';
    let airline = flights[flightCode][1];
    let timestamp = flights[flightCode][0];

    await config.flightSuretyApp.registerFlight(airline, flightCode, timestamp, {from: airline});
    await config.flightSuretyApp.buy(airline, flightCode, timestamp,
                  {from: passenger1, value: Web3.utils.toWei('1', 'ether')});
    let amount = await config.flightSuretyData.boughtPassenger(passenger1, airline, flightCode, timestamp)
    
    let res = await Web3.utils.fromWei(amount.toString(), 'ether')
    assert.equal(res, 1, "Passenger has bought insurance");
  })

  it('Passengers are compensated for delayed flight', async () => {
    let statusCode = 20; // Flight is delayed
    let flightCode = 'AA123';
    let airline = flights[flightCode][1];
    let timestamp = flights[flightCode][0];

    // Add another passenger
    await config.flightSuretyApp.buy(airline, flightCode, timestamp,
      {from: passenger2, value: Web3.utils.toWei('0.5', 'ether')});
    
    await config.flightSuretyApp.processFlightStatus(airline, flightCode, timestamp, statusCode, {from: airline})
    // let passenger = await config.flightSuretyData.flightPassenger(airline, flightCode, timestamp, {from:passenger1});
    // assert.equal(passenger, passenger1, "Passenger");
    let payout1  = await config.flightSuretyData.payoutPassenger(passenger1);
    let res1 = await Web3.utils.fromWei(payout1.toString(), 'ether')
  
    let payout2  = await config.flightSuretyData.payoutPassenger(passenger2);
    let res2 = await Web3.utils.fromWei(payout2.toString(), 'ether')
    
    assert.equal(res1, 1.5, "Passenger has bought insurance");
    assert.equal(res2, .75, "Passenger has bought insurance");
  })
});