/**
 * Runs everything that should be run before asking menu from server
 */
function init() {
    calculateCssVariables();
    fixDimensions();

    registerEventListeners();

    runAligment();
}

/**
 * Calculates values for variables on a stylesheet where the value can't easily be set without the help of javasript.
 */
function calculateCssVariables() {
    editCssVariable('--contact-size-multiplier', window.devicePixelRatio * document.body.clientWidth / 2544 * 1.1 + 0.12);
}

/**
 * Edits a variable used on a stylesheet.
 * 
 * @param {*} variable Name of the variable
 * @param {*} value New value
 */
function editCssVariable(variable, value) {
    document.querySelector(':root').style.setProperty(variable, value);
}

/**
 * Registers all event listeners.
 */
function registerEventListeners() {
    initButtons();

    addEventListener('resize', () => {
        calculateCssVariables();
        runAligment()
    });
}

/**
 * Adds mouse event listeners to movement buttons.
 */
function initButtons() {
    hideUnneccessaryButtons();

    document.getElementById('edellinen').addEventListener('mouseup', e => movementButtonPressed(e.button, -1), false);
    document.getElementById('seuraava').addEventListener('mouseup', e => movementButtonPressed(e.button, +1), false);
    document.getElementById('tanaan').addEventListener('mouseup', e => movementButtonPressed(e.button, undefined), false);
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
 * Returns true if te button to load current page should be hidden.
 */
function shouldHideTodayButton() {
    if (dayDiference % 7 == 0) return true; // Already viewing current day.

    var todayDayId = getTodayDayId();
    return todayDayId == 6 || todayDayId == -1; // Current day is Saturday or Sunday
}

/**
 * Loads new page when a movement button is pressed by the right mouse button.
 * The next page is the next day when movement is +1
 * and the last day when movement is -1.
 * Returns to current day if movement is undefined.
 * 
 * @param {*} mouseButton Id of the mouse button
 * @param {*} movement Pages to move, positive or negative
 */
function movementButtonPressed(mouseButton, movement) {
    if (mouseButton != 0) return; // Only moving on right click.

    if (movement != undefined) load(dayDiference + movement);
    else load(0);
    hideUnneccessaryButtons();
}

/**
 * Refreshes the current page to a new date by the difference of days.
 * Day difference is determined with url parameters
 */
function getNewPageByDifference(delta) {
    var current = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!queryString.includes('?')) {
        // No url parameters exist
        return current + '?paiva=' + delta;
    }

    var dayId;
    if (urlParams.has('paiva')) {
        // 'paiva' url parameter exists
        dayId = parseInt(urlParams.get('paiva')) + delta;

        if (dayId >= 7) dayId = dayId % 7;
        while (dayId < 0) dayId += 7;
    } else {
        dayId = delta;
    }

    return getNewPageByDayId(dayId);
}

/**
 * Refreshes the current page to a new date by day id.
 * Day id is determined with url parameters
 */
function getNewPageByDayId(dayId) {
    var current = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('paiva')) {
        urlParams.set('paiva', dayId);
        return window.location.pathname + '?' + urlParams.toString();
    }
    // Other url parameters exist
    return current + '&paiva=' + dayId;
}

/**
 * Fetches menu of the week from www.sodexo.fi as a json.
 * Updates content of page to show menu of the day.
 */
function createMenu() {
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista';
    getCourse(getDayId(), noSchool, update);
}

/**
 * Returns Date object with correct day difference.
 */
function getDate() {
    var date = new Date();
    var newDay = date.getDate() + dayDiference;
    date.setDate(newDay);
    return date;
}

/**
 * Returs id of the week day today is.
 * Monday=0, Tuesday=1, ... Saturday=5, Sunday=-1
 */
function getTodayDayId() {
    return new Date().getDay() - 1;
}

/**
 * Returs id of the week day on the page.
 * Monday=0, Tuesday=1, ... Saturday=5, Sunday=-1
 */
function getDayId() {
    return getDate().getDay() - 1;
}

/**
 * Returns the name of the day and date on the page on Finnish
 */
function nameOfDay() {
    var date = getDate();

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
 * Updates html elements to contain course names.
 */
function update(meatCourse, vegetarianCourse) {
    document.getElementById('ruoka_ka').textContent = vegetarianCourse;

    if (meatCourse != undefined) {
        // Set meat course name if it's server
        document.getElementById('ruoka_sr').textContent = meatCourse;
    } else {
        // Hide meat course elements if only vegetarian course is served.
        document.getElementById('seka').style.display = 'none';
    }

    runAligment();
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

    runAligment();
}

function displayNoSchoolMessage() {
    const element = document.getElementById('ei-koulua');
    if (element != null) {
        element.style.display = 'block';
        return;
    }

    const title = document.createElement('h1');
    title.textContent = 'Tänään ei ole koulua ):';
    title.className = 'info';
    title.id = 'ei-koulua';
    document.getElementById('otsikko').parentElement.appendChild(title);
}

/**
 * Hides course elements and displays a message to the user.
 * 
 * @param {*} message Message to display
 * @param {*} hide    Hides courses if true
 */
function displayMessage(message, hide) {
    // Displaying error
    var field = document.getElementById('viestikentta');
    field.style.display = 'block';
    field.textContent = message;

    if (!hide) return;

    // Removing course elements
    document.getElementById('seka').style.display = 'none';
    document.getElementById('kasvis').style.display = 'none';
}

function calculateDayDifference() {
    // Getting 'paiva' url param
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var day = urlParams.get('paiva');
    if (day == undefined) return 0;
    day = parseInt(day);

    // Parsing day difference (ex. 11 -> 4, -1 -> 6)
    var difference;
    if (day <= -7 || day >= 7) {
        day = day % 7;
    }

    if (day >= 0) difference = day;
    else difference = 7 + day;

    // Moving selected date to the same week as the current day is while remaining day of the week
    var tanaanPaivaId = getTodayDayId();
    if (tanaanPaivaId == -1) tanaanPaivaId = 6;

    var uusiPaivaId = tanaanPaivaId + difference;
    if (uusiPaivaId >= 7) uusiPaivaId -= 7;

    if (uusiPaivaId < tanaanPaivaId) difference -= 7;
    return difference;
}

/**
 * Shows seka and kasvis elements. Hides no school message if it's visible.
 */
function restoreElements() {
    document.getElementById('seka').style.display = 'flex';
    document.getElementById('kasvis').style.display = 'flex';

    var element = document.getElementById('ei-koulua');
    if (element != null) element.style.display = 'none';
}

/**
 * Loads menu for a day
 * 
 * @param {*} difference Diffence of days
 */
function load(difference) {
    restoreElements();

    if (difference == null) dayDiference = calculateDayDifference();
    else dayDiference = difference;

    createMenu();
}

function main() {
    init();

    load();
    checkForMessage();
}

var dayDiference;
main();
