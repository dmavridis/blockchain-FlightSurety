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
  
  

});