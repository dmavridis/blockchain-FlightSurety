pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false

    uint32 cntAirlines = 0;                                     // tracks the number of registered airlines
    uint32 private constant AIRLINE_COUNT_THRESHOLD = 4;
    uint32 private constant AIRLINE_REGISTER_PCT_THRESHOLD = 50;  // 50%
    uint256 public constant AIRLINE_FUND_FEE = 10 ether;

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct Airline {
        bool isRegistered;
        bool isFunded;
    }

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        string flightCode;
        uint256 updatedTimestamp;        
        address airline;
    }  

    mapping(address => Airline) private airlines;
    mapping(address => bool) private authorized;
    mapping(bytes32 => bool) private addressVoted;
    mapping(address => uint256) private votes;
    mapping(bytes32 => Flight) private flights;
    mapping(bytes32 => uint256) private insureeFlightAmount;
    mapping(bytes32 => address[]) private flightInsurees;


    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }


    /**
    * @dev Get if address is authorized to perform certain operations
    *
    * 
    */    

    function isAuthorized
                    (
                        address caller
                    ) 
                        public 
                        view 
                        returns(bool) 
    {
        return authorized[caller];
    }


    /**
    * @dev Checks if airline is registered
    *
    * @return A bool 
    */

    function isAirline
                    (
                        address airline
                    ) 
                        public 
                        view 
                        returns(bool) 
    {
        return airlines[airline].isRegistered;
    }

   /**
    * @dev Checks if airline is funded
    *
    * @return A bool 
    */      

    function isAirlineFunded
                    (
                        address airline
                    ) 
                        public 
                        view 
                        returns(bool) 
    {
        return airlines[airline].isFunded;
    }


   /**
    * @dev Checks whether the airline to be added has consensus, 
    * according to the specifications
    *
    * @return A bool 
    */

    function consensusAirline                      
                    (
                        address airline,
                        address _sender
                    )
                        internal
                        returns(bool)
    {
        cntAirlines++;
        if (cntAirlines <= AIRLINE_COUNT_THRESHOLD){
            return true;
        }
        cntAirlines--;
        bytes32 votedKey = keccak256(abi.encodePacked(_sender, airline));

        // If a different airline is adding this one, increase the votes
        if (!addressVoted[votedKey]){
            addressVoted[votedKey] = true;
            votes[airline]++;
            if ((votes[airline].mul(100)).div(cntAirlines) >= AIRLINE_REGISTER_PCT_THRESHOLD){
                cntAirlines++;
                return true;
            }
        }
        return false;
    }

    function owner() external view returns (address){
        return contractOwner;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Authorizes the contract creator to create the first airline entry
    *
    */    
    function authorizeCaller
                    (
                        address caller
                    )
                        public
    {
        authorized[caller] = true;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            ( 
                                address airline,
                                address _sender
                            )
                            external
                            returns (bool)
    {
            require(!isAirline(airline), "Airline already registered");
            bool success = false;
            airlines[airline] =  Airline({
                                           isRegistered: false, 
                                           isFunded: false
                                       });

            if (consensusAirline(airline, _sender)){
                airlines[airline].isRegistered = true;     
                authorized[airline] = true;
                success = true;
            }
            return success;
    }


    function registerFlight
                            (
                                address airline,
                                string flightCode,
                                uint256 timestamp
                            )
                            external
    {
        require(isAirlineFunded(airline), "Only funded airlines can participate");
        bytes32 flightKey = getFlightKey(airline, flightCode, timestamp);
        require(!flights[flightKey].isRegistered, "Flight is already registered");

        flights[flightKey] = Flight({
                                        isRegistered: true,
                                        statusCode: STATUS_CODE_UNKNOWN,
                                        flightCode: flightCode,
                                        updatedTimestamp: timestamp,
                                        airline: airline
                                    });
    }


    function processFlightStatus
                                (
                                    address airline,
                                    string flightCode,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                external
    {
        bytes32 flightKey = getFlightKey(airline, flightCode, timestamp);
        flights[flightKey].statusCode = statusCode;
    }


   /**
    * @dev Buy insurance for a flight
    * Insuree pays the insurance amount which is stored in insureeFlightAmount mapping
    * Insurees address is added to a list that stores all the insurees for the specific flight
    */
    function buy
                            (
                                address insuree,
                                address airline,
                                string flight,
                                uint256 timestamp
                            )
                            external
                            payable
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        bytes32 insureeKey = keccak256(abi.encodePacked(insuree, flightKey));
        insureeFlightAmount[insureeKey] = msg.value;
        flightInsurees[flightKey].push(insuree);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address airline,
                                string flightCode,
                                uint256 timestamp                              
                            )
                            external
    {
        
        bytes32 flightKey = getFlightKey(airline, flightCode, timestamp);
        bytes32 insureeKey = keccak256(abi.encodePacked(msg.sender, flightKey));        
        uint256 refund = insureeFlightAmount[insureeKey].mul(3).div(2);
        contractOwner.transfer(refund);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (
                                address airline
                            )
                            public
                            payable
    {
        
        require(isAirline(airline), "Not a registered airline");
        require(msg.value == AIRLINE_FUND_FEE, "Please pay the exact amount");
        airlines[airline].isFunded = true;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
    }


}

