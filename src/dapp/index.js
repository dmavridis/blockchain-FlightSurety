
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;


    let registeredAirlines = [];
    let authorizedAccounts = [];



    let contract = new Contract('localhost', () => {
        authorizedAccounts.push(contract.owner);

        /// Initialize accounts list

        var optionsAccount = contract.airlines;
        updateSelectList('selectAirline', contract.airlines);
        updateSelectList('selectAccount', authorizedAccounts);  


        // Read transaction
        contract.isOperational((error, result) => {

            display('Operational Status', 'Check if contract is operational', 
                [ { label: 'Operational Status', error: error, value: result} ]);
        });


        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })


        DOM.elid('submit-isAirline').addEventListener('click', () => {
            let airline = selectAirline.options[selectAirline.selectedIndex].value
//            let airline = DOM.elid('airline-address').value;
            // Write transaction
            contract.isAirline(airline, (error, result) => {
                console.log('Is Airline ' + airline +': ' + result); 
            });
        })



        DOM.elid('register-airline').addEventListener('click', () => {
//            let airline = DOM.elid('airline-address').value;
            let from = selectAccount.options[selectAccount.selectedIndex].value
            let airline = selectAirline.options[selectAirline.selectedIndex].value
            contract.registerAirline(airline, from, (error, result) => {
                console.log('Register Airline ' + airline +': ' + result); 
                    if (result){
                        registeredAirlines.push(airline)
                        authorizedAccounts.push(airline)
                        updateList('registeredAirline', [airline])
                        updateSelectList('selectAccount', [airline])
                }
            })
        });
    
    });
    

})();

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

function display_region(result, region) {

    let displayDiv = DOM.elid("display-wrapper-"+region);
    displayDiv.append(result + '\n\n,');
}

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


function updateList(listId, listItem){
    var registeredList = DOM.elid(listId);
    var el = document.createElement("li");
    el.textContent = listItem;
    registeredList.appendChild(el);
}