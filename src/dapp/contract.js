import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';

import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.FlightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.oracles = []

    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];
            let counter = 1;
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }
            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            callback();
        });
    }

/*********************************************
 * 
 *  Utilitiy Functions
 * 
 ********************************************/

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    isAirline(airline, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .isAirline(airline)
             .call({ from: self.owner}, callback);
     }

     isAirlineFunded(airline, callback) {
        let self = this;
        self.flightSuretyApp.methods
             .isAirlineFunded(airline)
             .call({ from: self.owner}, callback);
     }


/*********************************************
 * 
 *  Smart Contract Functions
 * 
 ********************************************/

    registerAirline(airline,fromAccount, callback){
        let self = this;
        console.log('caller: ' + fromAccount);
        self.flightSuretyApp.methods
        .registerAirline(airline)
        .send({ from: fromAccount, "gas": 4712388,"gasPrice": 100000000000}, callback);
    }

    fund(airline, callback){
        let self = this;
        self.flightSuretyApp.methods
        .fund()
        .send({ from: airline, value: this.web3.utils.toWei("10", "ether") , 
                "gas": 4712388,"gasPrice": 100000000000}, callback);
    }

    buy(passenger, airline, flight, timestamp, callback){
        let self = this;
        self.flightSuretyApp.methods
        .buy(airline, flight, timestamp)
        .send({from: passenger, value: this.web3.utils.toWei("1", "ether") , 
                "gas": 4712388,"gasPrice": 100000000000}, callback);

    }

    registerFlight(airline, flightCode, timestamp, callback){
        let self = this
        self.flightSuretyApp.methods
        .registerFlight(airline, flightCode, timestamp)
        .send({from: airline, "gas": 4712388,"gasPrice": 100000000000}, callback);
     }

    fetchFlightStatus(airline, flightCode, timestamp, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .fetchFlightStatus(airline, flightCode, timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    async accountBalance(account) {
        let balance = await this.web3.eth.getBalance(account)
        return await this.web3.utils.fromWei(balance);
    }

    checkCredit(account, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .checkCredit()
            .call({ from: account,"gas": 4712388,"gasPrice": 100000000000},
            callback)
    }  

    passengerPaid(passenger,airline, flightCode, timestamp, callback) {
        let self = this;
        self.FlightSuretyData.methods
            .boughtPassenger(passenger, airline, flightCode, timestamp)
            .call({ from: passenger,"gas": 4712388,"gasPrice": 10000000000},callback)
    }

    pay(passenger,airline, flightCode, timestamp, callback){
        let self = this;
        self.flightSuretyApp.methods
            .pay(passenger,airline, flightCode, timestamp)
            .send({from: passenger}, callback)

    }

}