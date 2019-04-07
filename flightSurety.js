var Test = require('../config/testConfig.js');
var web3 = require('../node_modules/web3')
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
//    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {
    let first = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();

    assert.equal(status, true, "Incorrect initial operating status value");

    });

//   it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

//       // Ensure that access is denied for non-Contract Owner account
//       let accessDenied = false;
//       try 
//       {
//           await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
//       }
//       catch(e) {
//           accessDenied = true;
//       }
//       assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
//     });

//   it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

//       // Ensure that access is allowed for Contract Owner account
//       let accessDenied = false;
//       try 
//       {
//           await config.flightSuretyData.setOperatingStatus(false);
//       }
//       catch(e) {
//           accessDenied = true;
//       }
//       assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
//      });

//   it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

//       await config.flightSuretyData.setOperatingStatus(false);

//       let reverted = false;
//       try 
//       {
//           await config.flightSurety.setTestingMode(true);
//       }
//       catch(e) {
//           reverted = true;
//       }
//       assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

//       // Set it back for other tests to work
//       await config.flightSuretyData.setOperatingStatus(true);

//     });

  // it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
  //   // ARRANGE
  //   let newAirline = accounts[2];
  //   let result = true;
  //   // ACT
  //   try{
  //     await config.flightSuretyApp.registerAirline(newAirline,'TwoAir', {from: config.owner});
  //   }
  //   catch(e){
  //     result = false
  //   }
  //   // ASSERT
  //   assert.equal(result, false, "Airline should not be registered from unauthorized address");

  // });

  
  it('(airline) register one airline', async () => {
    
    // ARRANGE
    let newAirline1 = accounts[3];
   
    // ACT
    await config.flightSuretyApp.registerAirline(newAirline1, {from: config.owner});
    let result = await config.flightSuretyApp.isAirline.call(newAirline1); 
    
    // ASSERT
    assert.equal(result, true, "Airline is registered");

  });

  // it('(airline) register four airlines', async () => {
    
  //   // ARRANGE
  //   let newAirline1 = accounts[3];
  //   let newAirline2 = accounts[4];
  //   let newAirline3 = accounts[5];
  //   let newAirline4 = accounts[6];
  //   await config.flightSuretyData.authorizeCaller(config.owner)
    
  //   // ACT
  //   await config.flightSuretyData.registerAirline(newAirline1, 'AirOne', {from: config.owner});
  //   await config.flightSuretyData.registerAirline(newAirline2, 'AirTwo', {from: newAirline1});
  //   await config.flightSuretyData.registerAirline(newAirline3, 'AirThree', {from: newAirline2});
  //   await config.flightSuretyData.registerAirline(newAirline4, 'AirFour', {from: newAirline3});
  //   let res1 = await config.flightSuretyData.isAirline.call(newAirline1); 
  //   let res2 = await config.flightSuretyData.isAirline.call(newAirline2); 
  //   let res3 = await config.flightSuretyData.isAirline.call(newAirline3); 
  //   let res4 = await config.flightSuretyData.isAirline.call(newAirline4); 

  //   let result = res1 && res2 && res3 && res4;
  //   // ASSERT
  //   assert.equal(result, true, "Four airlines are registered");

  // });

  // it('(airline) registering fifth airlines fails, not enough votes', async () => {
    
  //   // ARRANGE
  //   let newAirline1 = accounts[3];
  //   let newAirline2 = accounts[4];
  //   let newAirline3 = accounts[5];
  //   let newAirline4 = accounts[6];
  //   let newAirline5 = accounts[7];
  //   await config.flightSuretyData.authorizeCaller(config.owner)
    
  //   // ACT
  //   await config.flightSuretyData.registerAirline(newAirline1, 'AirOne', {from: config.owner});
  //   await config.flightSuretyData.registerAirline(newAirline2, 'AirTwo', {from: newAirline1});
  //   await config.flightSuretyData.registerAirline(newAirline3, 'AirThree', {from: newAirline2});
  //   await config.flightSuretyData.registerAirline(newAirline4, 'AirFour', {from: newAirline3});
  //   await config.flightSuretyData.registerAirline(newAirline5, 'AirFive', {from: newAirline1});

  //   let res1 = await config.flightSuretyData.isAirline.call(newAirline1); 
  //   let res2 = await config.flightSuretyData.isAirline.call(newAirline2); 
  //   let res3 = await config.flightSuretyData.isAirline.call(newAirline3); 
  //   let res4 = await config.flightSuretyData.isAirline.call(newAirline4); 
  //   let res5 = await config.flightSuretyData.isAirline.call(newAirline5); 
  //   let res = res1 && res2 && res3 && res4;
  //   // ASSERT
  //   // assert.equal(res, true, "Four airlines are registered");
  //   assert.equal(res5, false, "Fifth airline not registered yet");

  // });

//   it('(airline) registering fifth airlines succeeds, when consensus is achieved', async () => {
    
//     // ARRANGE
//     let newAirline1 = accounts[3];
//     let newAirline2 = accounts[4];
//     let newAirline3 = accounts[5];
//     let newAirline4 = accounts[6];
//     let newAirline5 = accounts[7];
//     await config.flightSuretyData.authorizeCaller(config.owner)
    
//     // ACT
//     await config.flightSuretyData.registerAirline(newAirline1, 'AirOne', {from: config.owner});
//     await config.flightSuretyData.registerAirline(newAirline2, 'AirTwo', {from: newAirline1});
//     await config.flightSuretyData.registerAirline(newAirline3, 'AirThree', {from: newAirline2});
//     await config.flightSuretyData.registerAirline(newAirline4, 'AirFour', {from: newAirline3});
//     await config.flightSuretyData.registerAirline(newAirline5, 'AirFive', {from: newAirline1});
//     await config.flightSuretyData.registerAirline(newAirline5, 'AirFive', {from: newAirline2});
//    // await config.flightSuretyData.registerAirline(newAirline5, 'AirFive', {from: newAirline3});

   
//     let res5 = await config.flightSuretyData.isAirline.call(newAirline5); 
//     // ASSERT
//     // assert.equal(res, true, "Four airlines are registered");
//     assert.equal(res5, true, "Fifth airline not registered yet");

//   });

//   it('(airline) pays the required funding fee', async () => {
    
//     // ARRANGE
//     let newAirline1 = accounts[3];

//     await config.flightSuretyData.authorizeCaller(config.owner)
    
//     // ACT
// //    await config.flightSuretyData.registerAirline(newAirline1, 'AirOne', {from: config.owner});
//     await config.flightSuretyData.fund({from: newAirline1, value: web3.utils.toWei('10', 'ether')});
   
//     let res = await config.flightSuretyData.isAirlineFunded.call(newAirline1); 
//     // ASSERT
//     // assert.equal(res, true, "Four airlines are registered");
//     assert.equal(res, true, "Airline is funded");

//   });

});