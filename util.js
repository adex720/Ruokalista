
function checkForMessage() {
    getJSON('message.json', analyze);
}

function analyze(error, json) {
    if (error != null) return;

    if (!json['m']) return;
    displayMessage(json['m'], json['h']);
}
    