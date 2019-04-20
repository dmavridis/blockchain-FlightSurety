
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';



(async() => {

    var date = new Date();

    let result = null;
    let registeredAirlines = [];
    let authorizedAccounts = [];



    let contract = new Contract('localhost', () => {
        /*******************************************************
         * 
         *      Initialition part
         * 
         * **************************************************** */    



        let flights = {
            'AA123': [date.getTime(), contract.airlines[0]] ,
            'ND063': [date.getTime()+1011, contract.airlines[1]],
            'CX878':[date.getTime()+3022, contract.airlines[2]]
        }


        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // Initialize accounts list
        authorizedAccounts.push(contract.owner);
        var optionsAccount = contract.airlines;
        updateSelectList('selectAirline', contract.airlines);
        updateSelectList('selectAccount', authorizedAccounts);
        updateSelectList('populateFlights', Object.keys(flights));

        let flightID = populateFlights.options[populateFlights.selectedIndex].value;
        const flightTime = document.querySelector('.flight-time');
        const flightAirline = document.querySelector('.flight-airline');
        flightTime.textContent = "Flight Time: " + flights[flightID][0];
        flightAirline.textContent = "Airline: " + flights[flightID][1];
        updateSelectList('passengerList', contract.passengers);
        updateSelectList('passengerList2', contract.passengers);

        
        /******************************************************************
         *
         *  Element behaviours
         * 
         ******************************************************************/

        DOM.elid('register-airline').addEventListener('click', () => {
            let from = selectAccount.options[selectAccount.selectedIndex].value
            let airline = selectAirline.options[selectAirline.selectedIndex].value
            contract.registerAirline(airline, from, (error, result) => {
                console.log('Register Airline ' + airline +': ' + result); 
                console.log(error)
                if (result){
                    registeredAirlines.push(airline)
                    authorizedAccounts.push(airline)
                    updateList('registeredAirline', [airline])
                    updateSelectList('selectAccount', [airline])
                }
            })
        });

        // Update the registered airlines list from the blockchain
        // In the webapp informatin is lost after refreshing
        DOM.elid('populate-registered').addEventListener('click', () => {
            populateRegistered(contract.airlines, contract);
        });

        DOM.elid('fund-airline').addEventListener('click', () => {
            const registered = DOM.elid('populateRegistered');
            let airline = registered.options[registered.selectedIndex].value
            console.log(airline)
            contract.fund(airline, (error, result) => {
                // console.log(error)
                console.log(result)
            })
        })

        DOM.elid('populate-registered').addEventListener('click', () => {
            populateRegistered(contract.airlines, contract);
        });

        DOM.elid('populate-funded').addEventListener('click', () => {
            populateFunded(contract.airlines, contract);
        });       

        DOM.elid('populateFlights').addEventListener('change', () => {
            let flightID = populateFlights.options[populateFlights.selectedIndex].value;
            const flightTime = document.querySelector('.flight-time');
            const flightAirline = document.querySelector('.flight-airline');
            flightTime.textContent = "Flight Time: " + flights[flightID][0];
            flightAirline.textContent = "Airline: " + flights[flightID][1];
        });


        DOM.elid('register-flight').addEventListener('click', () => {
            let flightCode = populateFlights.options[populateFlights.selectedIndex].value;
            let airline = flights[flightCode][1]
            let timestamp = flights[flightCode][0]
            contract.registerFlight(airline, flightCode, timestamp, (error,result) => {
                console.log(error)
            })
        });

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flightCode = populateFlights.options[populateFlights.selectedIndex].value;
            let airline = flights[flightCode][1];
            let timestamp = flights[flightCode][0];
            let passenger = passengerList.options[passengerList.selectedIndex].value;
            contract.buy(passenger, airline, flightCode, timestamp, (error,result) => {
                console.log(error)
            })
        });

        // User-submitted transaction
        DOM.elid('submit-oracles').addEventListener('click', () => {
            let flightCode = populateFlights.options[populateFlights.selectedIndex].value;
            let airline = flights[flightCode][1];
            let timestamp = flights[flightCode][0];
            // Write transaction
            contract.fetchFlightStatus(airline, flightCode, timestamp, (error, result) => {
                console.log(error)
                console.log(result)
                // display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('check-balance').addEventListener('click', async() => {
            let acc = passengerList2.options[passengerList2.selectedIndex].value;
            let balance = await contract.accountBalance(acc);
            let displayDiv = DOM.elid("display-balance");
            let section = DOM.section();
            section.appendChild(DOM.h5('Balance of passenger ' + acc + ' : ' + balance + ' ETH'));
            displayDiv.append(section)     
        });

    })
})();

/**********************************************************************
 *  Helper Functions
 * 
 * 
 *********************************************************************/

 // Displays information in label fields
function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

// Updates select list elements
function updateSelectList(selectId, listElements){
    var selectList = DOM.elid(selectId);
    for(var i = 0; i < listElements.length; i++) {
        var opt = listElements[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectList.appendChild(el);
    }  
}

// Updates list elements
function updateList(listId, listItem){
    var registeredList = DOM.elid(listId);
    var el = document.createElement("li");
    el.textContent = listItem;
    registeredList.appendChild(el);
}

// Reads registered airlines from the blockchain
async function populateRegistered(array,contract) {
    for (const item of array) {
        await contract.isAirline(item, (error, result) => {
            if (result){
                updateSelectList('populateRegistered', [item])
            }
        })
    }
}


// Reads funded airlines from the blockchain
async function populateFunded(array,contract) {
    for (const item of array) {
        await contract.isAirlineFunded(item, (error, result) => {
            if (result){
                updateSelectList('populateFunded', [item])
            }
        })
    }
}

