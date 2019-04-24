# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder



## Project Specifications

In the following paragraphs, the sections of the specifications are presented as well as the approach to meet them.  

### Separation of Concerns, Operational Control and “Fail Fast”

| CRITERIA                                               | SPECIFICATIONS                                               |
| ------------------------------------------------------ | :----------------------------------------------------------- |
| Smart Contract Seperation                              | Smart Contract code is separated into multiple contracts:1) FlightSuretyData.sol for data persistence 2) FlightSuretyApp.sol for app logic and oracles code |
| Dapp Created and Used for Contract Calls               | A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at [http://localhost:8000](http://localhost:8000/). Specific contract calls:1) Passenger can purchase insurance for flight 2) Trigger contract to request flight status update |
| Oracle Server Application                              | A server app has been created for simulating oracle behavior. Server can be launched with “npm run server” |
| Operational status control is implemented in contracts | Students has implemented operational status control.         |
| Fail Fast Contract                                     | Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body |

The smart contract is separated into two contracts, `FlightSuretyData.sol` for data persistence `FlightSuretyApp.sol` for app logic and oracles code.

Passenger is using the service through a Dapp client and is able to purchase insurance and request flight status update.

An elementary server app has been applied that is triggered when the user flight status update is requested and provides information on the status of the flight. If a delay has occurred, the passengers are automatically compensated. 

Operational status control has been implemented. 

Several `require` statements have been added for the contracts to fail fast if a violation occurs. 



## Airlines

| CRITERIA                        | MEETS SPECIFICATIONS                                         |
| :------------------------------ | :----------------------------------------------------------- |
| Airline Contract Initialization | First airline is registered when contract is deployed.       |
| Multiparty Consensus            | Only existing airline may register a new airline until there are at least four airlines registered. Demonstrated either with Truffle test or by making call from client Dapp |
| Multiparty Consensus            | Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlinesDemonstrated either with Truffle test or by making call from client Dapp |
| Airline Ante                    | Airline can be registered, but does not participate in contract until it submits funding of 10 ether. Demonstrated either with Truffle test or by making call from client Dapp |

During initialization, an authorized user is hardwired to the contract. This user can add the first airline. This is a small modification from the request but the concept is the same. 

The first four airlines are adder by an existing airline or by the authorized user. The fifth and beyond need multiparty consensus of at least 50%. This is demonstrated in both a Truffle test and the Dapp. In the Dapp I am using events, and this seems to have a bug, as when clicking the button to register an airline, more than one of the same events are written to the block. This can be fixed though.

An airline needs to be funded with 10 ether. When this happens, it can participate in the contract, by registering a flight.



## Passengers



| CRITERIA                 | MEETS SPECIFICATIONS                                         |
| :----------------------- | :----------------------------------------------------------- |
| Passenger Airline Choice | Passengers can choose from a fixed list of flight numbers and departure that are defined in the Dapp client |
| Passenger Payment        | Passengers may pay up to 1 ether for purchasing flight insurance. |
| Passenger Repayment      | If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid |
| Passenger Withdraw       | Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout |
| Insurance Payouts        | Insurance payouts are not sent directly to passenger’s wallet |

Flight are registered and hardwired to the Dapp. A passenger can buy insurance of up ot 1 ETH.

When a flight is delayed due to airlines fault, passenger is credited 1.5x the insured amount

Passengers can withdraw funds, and funds are not directly send to their wallet.

This is demonstrated in Truffle, and is also implemented in the Dapp, but at the moment it seems to have a bug.



## Oracles (Server App)



| CRITERIA              | MEETS SPECIFICATIONS                                         |
| :-------------------- | :----------------------------------------------------------- |
| Functioning Oracle    | Oracle functionality is implemented in the server app.       |
| Oracle Initialization | Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory |
| Oracle Updates        | Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code) |
| Oracle Functionality  | Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50) |

The server app is implemented providing some basic functionality. Due to my current lack of experience with javascript, this code has been copied from the reference code of one of the mentors, provided in this link [ps://github.com/jungleBadger/udacity_flight-surety/blob/master/src/server/server.js](https://github.com/jungleBadger/udacity_flight-surety/blob/master/src/server/server.js). There have been some small modifications. The code is interacting with the contract and the oracles are giving delayed status code and credit is insured to the passengers. 

## Dapp description

A total of four terminals are required to run the Dapp. 

To setup the local blockchain in ganache, the following command is used:

```ganache-cli -p 8545 -m 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat' -a 40```

In the second terminal, the contacts are migrated running: `truffle migrate`

In the third terminal, run `npm run dapp` and in the fourth `npm run server`.



The Dapp itself consists of five sections that are interrelated

###  Section 0 - Airline Registration

In the first part, five airline addresses are hardwired to the Dapp that will need to be registered from an authorized party. For the first airline, the only authorized party is the contract owner, that had the permission to register airlines. Then every registered airline is added to the `authorized` list. Up to the fourth airline, they can be registered by an authorized account,. for the fifth airline and beyond, a consensus of 50% of registered airlines is required. 

The airline registration works fine in test. In the Dapp the approach is to use event capturing. While this still works it is causing some bugs to the interface that needs to be fixed.

### Section 1 - Airline Funding

As soon as some airlines are registered, they need to deposit 10 ether funding in order to be able to interact with the functions of the contract. 

In the Dapp, the user should first click the `Populate registered Airlines` button. This button is necessary for the Dapp testing, because due to code updates the dapp is reset and the lists of registered airlines are empty. However, the airlines are still registered in the blockchain. Therefore, the airlines are recovered from the blockchain, this time. Then, the next step, the funding takes place and similarly a `Populate funded airlines` button retrieves the ones that are funded. The amount of 10 ether is currently hardwired in the Dapp.

### Section 2 - Buy Flight insurance

A list of flights hardwired to the Dapp are provided and need to be registered by the airline that runs the flights. Then, a passenger from a list of five accounts, is able to buy insurance for the chosen flight of an amount up to 1 ether. Passenger can buy more times the insurance as long as the total amount does not exceed the limit. 

### Section 3- Submit flight to Oracles

The flight that is chosen from the list in the previous section is submitted to the oracles, that have already been initialized in the served side. The server simulates and generates a response. In this case, since the timestamp of the submitted flight is already in the past, the oracles are returning `STATUS_CODE_LATE_AIRLINE` and are triggering the refund process. 

### Section 4 - Withdraw credits

In this section, the passengers can check their balance and if they have any credits. 

After the flight update has completed, some credits are available to the passengers of the flight. Then the plan is to move the available funds to the passengers account. 

The testing of this process is successful, however in the Dapp there are still some issues that are related to the response of the oracles and the amount it credit the passengers. 



## Points to improve

The tests are verifying the functionality of the contracts.. However, there is potential for improvement in the functionality of the Dapp. 


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)

## References
- https://medium.com/daox/three-methods-to-transfer-funds-in-ethereum-by-means-of-solidity-5719944ed6e9

- Various topics in the student hub page. 

