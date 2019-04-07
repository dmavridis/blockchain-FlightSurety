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
    mapping(address => bool) private airlineExists;
    mapping(address => bool) private authorized;
    mapping(address => uint256) private registeredAirline;
    mapping(bytes32 => bool) private addressVoted;
    mapping(address => uint256) private votes;
    mapping(bytes32 => Flight) private flights;  

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/




    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
      //                              address firstAddress
                                ) 
                                public

    {
 //       authorized[firstAddress] = true;
 //       authorizeCaller(firstAddress);
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

    /**
    * @dev Modifier that requires the caller to be a registered airline
    */
    modifier requireIsCallerAuthorized()
    {
        require(authorized[msg.sender], "Caller is not authorized");
        _;
    }

    /**
    * @dev Modifier that requires the caller to be a funded airline
    */
    modifier requireIsCallerFunded()
    {
        require(isAirlineFunded(msg.sender), "Caller is not funded");
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
    function isOperational
                    (

                    ) 
                        public 
                        view 
                        returns(bool) 
    {
        return operational;
    }

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
    * @dev Checks if airline is register
    *
    * @return A bool that is the current operating status
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

    function owner() external view returns (address){
        return contractOwner;
    }




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


    function consensusAirline                      
                    (
                        address airline
                    )
                        internal
                        returns(bool)
    {
        return true;
        cntAirlines++;
        if (cntAirlines <= AIRLINE_COUNT_THRESHOLD){
            return true;
        }
        cntAirlines--;
        bytes32 votedKey = keccak256(abi.encodePacked(msg.sender, airline));

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

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                    (
                        address airline
  //                      string name
                    )
                    external
                    requireIsOperational
                    returns (bool)
    {
            require(isAirline(airline) == false, "Airline already registered");

            bool success = false;
            airlines[airline] =  Airline({
                                           isRegistered: false, 
                                           isFunded: false
                                       });

            if (consensusAirline(airline)){
                airlines[airline].isRegistered = true;     
                authorized[airline] = true;
                airlineExists[airline] = true;
                success = true;
            }
            return success;
    }


    function registerFlight
                    (
                        string flightCode,
                        uint256 timestamp,    
                        address airline
                    )
                    external
                    returns (bool)
    {
            bool success = true;
            // requires sender = airline
            bytes32 flightKey = getFlightKey(flightCode, timestamp, airline);
            flights[flightKey] = Flight({
                                        isRegistered: true,
                                        statusCode: STATUS_CODE_UNKNOWN,
                                        flightCode: flightCode,
                                        updatedTimestamp: timestamp,
                                        airline: airline
                                    });
            return success;

    }


    function processFlightStatus
                        (
                        address airline,
                        string  flight,
                        uint256 timestamp,
                        uint8 statusCode
                        )
                    external
                    returns (bool)
    {
        bytes32 flightKey = getFlightKey(flight, timestamp, airline);
        flights[flightKey].statusCode = statusCode;
        bool success = false;
        return success;

    }


   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
        require(isAirline(msg.sender), "Not a registered airline");
        require(msg.value >= AIRLINE_FUND_FEE, "Please pay the required amount");
        address(this).transfer(AIRLINE_FUND_FEE);
        airlines[msg.sender].isFunded = true;
        if (msg.value > AIRLINE_FUND_FEE){
            msg.sender.transfer(msg.value - AIRLINE_FUND_FEE);
        }
    }

    function getFlightKey
                        (
                            string memory flight,
                            uint256 timestamp,
                            address airline
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
        fund();
    }

}