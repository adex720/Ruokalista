

function init() {
    checkAccount();

    align();
    checkForMessage();

    addEventListeners();

    updateMenu();
}

function align() {
    var width = getElementWidth('otsikko_ka');
    document.getElementById('otsikko_sr').setAttribute('style', 'flex-basis:' + width + 'px');
}

/**
 * Adds event listeners outside cokies panel.
 */
function addEventListeners(force) {
    if (!hasAcceptedCookies && !force) {
        initCookieButtons();
        return;
    }

    initButtons();

    document.addEventListener('keyup', buttonPressed);
}

function initCookieButtons() {
    document.getElementById('read-more').addEventListener('click', displayCookiePolicy);
    document.getElementById('deny').addEventListener('click', onCookiesDenied);
    document.getElementById('accept').addEventListener('click', onCookiesAccepted);
}

/**
 * Adds mouse event listeners to buttons outside cookies panel.
 */
function initButtons() {
    hideUnneccessaryButtons();

    document.getElementById('edellinen').addEventListener('mouseup', e => movementButtonPressed(e.button, -1), false);
    document.getElementById('seuraava').addEventListener('mouseup', e => movementButtonPressed(e.button, +1), false);
    document.getElementById('tanaan').addEventListener('mouseup', e => movementButtonPressed(e.button, undefined), false);

    document.getElementById('koodi').addEventListener('click', toggleCode);
    document.getElementById('paivita').addEventListener('click', askNewSchedule);
    document.getElementById('poista').addEventListener('click', deleteUser);
}

/**
 * Checks if buttons which are not always visible should be visible and hides them if not.
 */
function hideUnneccessaryButtons() {
    if (shouldHideTodayButton()) {
        document.getElementById('tanaan').style.display = 'none';
    } else {
        document.getElementById('tanaan').style.display = 'block';
    }
}

/**
 * Returns true if the button to load current page should be hidden.
 */
function shouldHideTodayButton() {
    var todayDayId = getTodayDayId();
    if (dayId == todayDayId) return true; // Already viewing current day.

    return todayDayId == 5 || todayDayId == 6; // Current day is Saturday or Sunday
}

function buttonPressed(event) {
    switch (event.code) {
        case 'ArrowLeft': movementButtonPressed(0, -1); break;
        case 'ArrowRight': movementButtonPressed(0, +1); break;

        case 'ArrowDown': case 'ArrowUp': case 'Space':
            movementButtonPressed(0, undefined);
    }
}

/**
 * Loads new page when a movement button is pressed by the right mouse button.
 * The next page is the next day when movement is +1
 * and the last day when movement is -1.
 * Returns to current day if movement is undefined.
 * 
 * @param {*} mouseButton Id of the mouse button. Set value to 0 if activated otherwhere (keyboard).
 * @param {*} movement Pages to move, positive or negative
 */
function movementButtonPressed(mouseButton, movement) {
    if (mouseButton != 0) return; // Only moving on right click.


    if (movement == undefined) {
        dayId = getTodayDayId();
    } else {
        dayId += movement;
        if (dayId < 0) dayId += 7;
        if (dayId > 6) dayId -= 7;
    }

    updateMenu();
    hideUnneccessaryButtons();
}

var dayId = getPageDayId();

/**
 * Returs id of the week day today is.
 * Monday=0, Tuesday=1, ... Saturday=5, Sunday=6
 */
function getTodayDayId() {
    let id = new Date().getDay() - 1;
    if (id == -1) id == 6;
    return id;
}

/**
 * Get id of day from url params.
 * Defaults current day id.
 */
function getPageDayId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!queryString.includes('?') || !urlParams.has('paiva')) {
        // No url parameters exist or 'paiva' parameter doesn't exist
        return getTodayDayId();
    }

    var dayId = parseInt(urlParams.get('paiva'));

    if (dayId >= 7) dayId = dayId % 7;
    while (dayId < 0) dayId += 7;

    return dayId;
}


/**
 * Returns a Date object with the weekday matching dayId and it being on the current week.
 */
function getDateOnCurrentWeek() {
    let todayId = getTodayDayId();
    let date = new Date();
    if (dayId == todayId) return date;

    date.setDate(date.getDate() + dayId - todayId);
    return date;
}
/**
 * Returns the name of the day and date on the page on Finnish
 */
function nameOfDay() {
    var date = getDateOnCurrentWeek();

    var dateOfMonth = date.getDate();
    var month = date.getMonth() + 1;
    var dayOfWeekId = date.getDay();

    var dayOfWeek;
    switch (dayOfWeekId) {
        case 0: dayOfWeek = 'Su'; break;
        case 1: dayOfWeek = 'Ma'; break;
        case 2: dayOfWeek = 'Ti'; break;
        case 3: dayOfWeek = 'Ke'; break;
        case 4: dayOfWeek = 'To'; break;
        case 5: dayOfWeek = 'Pe'; break;
        case 6: dayOfWeek = 'La';
    }

    return dayOfWeek + ' ' + dateOfMonth + '.' + month + '.';
}

/**
 * Updates menu title, courses and display
 */
function updateMenu() {
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista';
    updateLunchTimes();
    getCourse(dayId, noSchool, update);
}

/**
 * Removes course elements and adds a new header informing no school.
 */
function noSchool() {
    // Updating date
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista';

    // Creating element informing no school
    displayNoSchoolMessage();

    // Removing course elements
    document.getElementById('seka').style.display = 'none';
    document.getElementById('kasvis').style.display = 'none';
}

function displayNoSchoolMessage() {
    document.getElementById('ei-koulua').style.display = 'block';
    return;
}

/**
 * Updates course names and display
 */
function update(meatCourse, vegetarianCourse) {
    document.getElementById('ei-koulua').style.display = 'none';

    document.getElementById('ruoka_ka').textContent = vegetarianCourse;
    document.getElementById('kasvis').style.display = 'flex';

    if (meatCourse != undefined) {
        // Set meat course name if it's server
        document.getElementById('ruoka_sr').textContent = meatCourse;
        document.getElementById('seka').style.display = 'flex';
    } else {
        // Hide meat course elements if only vegetarian course is served.
        document.getElementById('seka').style.display = 'none';
    }
}

/**
 * Returns the bounding client rectangle of an element.
 * 
 * @param {*} id Id of the element
 */
function getElementBounding(id) {
    return document.getElementById(id).getBoundingClientRect();
}

/**
 * Returns the width of the element.
 * 
 * @param {*} id  Id of the element
 */
function getElementWidth(id) {
    var bounding = getElementBounding(id);
    return bounding.right - bounding.left;
}

/**
 * Displays a message to the user.
 * Hides meals if set so.
 * 
 * @param {*} message Message to display
 * @param {*} hide    Hides courses if true
 */
function displayMessage(message, hide) {
    // Displaying message
    document.getElementById('viestikentta').style.display = 'block';
    document.getElementById('viesti').innerHTML = message;

    if (!hide) return;

    // Removing course elements
    document.getElementById('seka').style.display = 'none';
    document.getElementById('kasvis').style.display = 'none';

    // Removing close option since it doesn't make to sense close the message if the meals are not showing.
    document.getElementById('sulje').style.display = 'none';
}

/**
 * Hides the message box.
 */
function hideMessage() {
    document.getElementById('viestikentta').style.display = 'none';
}

var hasAcceptedCookies = false;
var hasAccount = false;

var accountCode;
var lunchTimes = [];
var classes = [];

const LUNCH_TIME_UNDEFINED = -1;
const LUNCH_TIME_FREE = 0;
const LUNCH_TIME_1 = 1;
const LUNCH_TIME_2 = 2;
const LUNCH_TIME_3 = 3;
const LUNCH_TIME_4 = 4;

const LUNCH_TIMES = {
    1: '11.05 - 11.50',
    2: '11.45 - 12.15',
    3: '12.05 - 12.35',
    4: '12.35 - 13.05'
}

/**
 * Checks account status and hides and shows correct elements
 */
function checkAccount() {
    if (localStorage.getItem('cookiesEnabled') != 'true') {
        hasAcceptedCookies = false;
        hasAccount = false;
        return;
    }

    hasAcceptedCookies = true;
    hideCookieElement();

    let accountCode = localStorage.getItem('code');
    if (accountCode === null) {
        hasAccount = false;
        return;
    }

    showAccountDetails();

    let account = true;
    updateLunchTimes();
}

const COOKIE_INFO = 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magni minima deserunt placeat et? At, laborum aspernatur! Repellendus cupiditate voluptate natus deleniti totam, omnis aliquam voluptates corporis eius culpa est. Harum.';

function displayCookiePolicy() {
    document.getElementById('cookies-info').innerHTML = COOKIE_INFO;
}

function onCookiesAccepted() {
    hasAcceptedCookies = true;
    localStorage.setItem('cookiesEnabled', 'true');
    document.getElementById('cookies').style.display = 'none';
    addEventListeners();
}

function onCookiesDenied() {
    document.getElementById('cookies').style.display = 'none';
    addEventListeners(true);
}

/**
 * Handles changes when locally saved account is deleted.
 */
function invalidAccountFound() {
    hasAccount = false;
    hideAccountElements();
    displayMessage('Käyttäjätunnusta ei löydy. Varmista että koodi on kirjoitettu oikein. Mikäli koodi on oikea, käyttäjäsi on poistettu toisella laitteella.', false);
}

function updateLunchTimes() {
    if (lunchTimes.length == 0) return;

    let message;
    let time = lunchTimes[dayId];
    let className = classes[dayId];
    if (time == LUNCH_TIME_UNDEFINED) {
        message = 'Ruokailu järjestetään poikkeuksellisesti.';
    } else {
        message = className + ': ruokailu: ' + time;
    }

    document.getElementById('vuoro-teksti').textContent = message;
}

/**
 * Shows account info related elements and hides account creation related elements
 */
function showAccountDetails() {
    document.getElementById('vuorot').style.display = 'block';
    document.getElementById('luo').style.display = 'none';
}

/**
 * Hides account info related elements and shows account creation related elements
 */
function hideAccountElements() {
    document.getElementById('vuorot').style.display = 'none';
    document.getElementById('luo').style.display = 'block';
}

function hideCookieElement() {
    document.getElementById('cookies').style.display = 'none';
}

/**
 * If code is hidden, shows code.
 * If code is shown, hides code.
 */
function toggleCode() {
    let current = document.getElementById('koodi-esilla').style.display;
    if (current == '' || current == 'none') showCode();
    else hideCode();
}

/**
 * Shows the code of the account
 */
function showCode() {
    document.getElementById('koodi-esilla').textContent = 'koodisi: ' + code;
    document.getElementById('koodi-esilla').style.display = 'block';

    document.getElementById('koodi').textContent = 'Piilota koodi';
}

/**
 * Hides the code of the account
 */
function hideCode() {
    document.getElementById('koodi-esilla').style.display = 'none';

    document.getElementById('koodi').textContent = 'Näytä koodi';
}

/**
 * Display elements asking for new schedule
 */
function askNewSchedule() {

}

/**
 * Update account schedule
 */
function updateSchedule() {

}

/**
 * First ask for confirmation.
 * Then permanently delete account
 */
function deleteUser() {
    if (confirm('Haluatko varmasti poistaa tietosi? Tätä ei voi peruuttaa.')) {
        deleteFromServer();
    }
}

function onAccountDeleted(status) {
    if (status != null) {
        alert('Yhteyden muodostus palvelimeen epäonnistui. Yritä uudelleen muutaman minuutin päästä.');
        return;
    }

    hasAccount = false;
    localStorage.removeItem('code');
    hideAccountElements();
}

const SERVER_URL = 'amauno.kapsi.fi/kunkkuruoka.online/server';

const ACTION_VALIDATE = {
    'action': 'validate'
};

const ACTION_GET_TIMES = {
    'action': 'get-times'
};

const ACTION_DELETE_ACCOUNT = {
    'action': 'delete'
};

const ACTION_UPLOAD_SCHEDULE = {
    'action': 'upload-schedule'
};

const ACTION_UPDATE_SCHEDULET = {
    'action': 'update-schedule'
};

/**
 * NOT SANITIZED!!!
 */
function makeServerRequest(params, callback, onNoUser) {
    if (!hasAccount) return;

    let request = SERVER_URL + '?code=' + code;
    for (let [key, value] of params) {
        request += '&' + key + '=' + value;
    }

    if (onNoUser == undefined || onNoUser == null) {
        getJSON(request, callback);
        return;
    }

    getJSON(request, (code, json) => {
        if (code != null) {
            callback(code);
            return;
        }

        let serverCode = json['status'];
        if (serverCode == 401) onNoUser(null, json);
        else callback(null, json);
    });
}

/**
 * Requests lunch times from server and updates page.
 */
function getLunchTimes() {
    makeServerRequest(ACTION_GET_TIMES, (code, json) => {
        if (code != null) {
            displayMessage('Ruokailuvuorojen lataaminen epäonnistui', false);
            return;
        }

        lunchTimes = parseTimes(json);
        classes = parseClasses(json);
        updateLunchTimes();
    }, invalidAccountFound);
}

function deleteFromServer() {
    makeServerRequest(ACTION_DELETE_ACCOUNT, onAccountDeleted);
}

function parseTimes(json) {
    return json['times'];
}

function parseClasses(json) {
    return json['classes'];
}

init();
