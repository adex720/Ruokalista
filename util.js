

/**
 * Edits a variable used on a stylesheet.
 * 
 * @param {*} variable Name of the variable
 * @param {*} value New value
 */
function editCssVariable(variable, value) {
    document.querySelector(':root').style.setProperty(variable, value);
}

function checkForMessage() {
    getJSON('message.json', analyze);
}

function analyze(error, json) {
    if (error != null) return;

    if (!json['m']) return;
    displayMessage(json['m'], json['h']);
}
    