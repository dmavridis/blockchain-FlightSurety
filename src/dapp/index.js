
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {

    let result = null;
    let registeredAirlines = [];
    let authorizedAccounts = [];

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // Initialize accounts list
        authorizedAccounts.push(contract.owner);
        var optionsAccount = contract.airlines;
        updateSelectList('selectAirline', contract.airlines);
        updateSelectList('selectAccount', authorizedAccounts);  
    
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
        DOM.elid('populate-airline').addEventListener('click', () => {
            populateAirlines(contract.airlines, contract);
        });
    })
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

async function populateAirlines(array,contract) {
    for (const item of array) {
        await contract.isAirline(item, (error, result) => {
            if (result){
                console.log(contract.airlines[1])
                updateSelectList('populateAirlines', [item])
            }
        })
    }
}


