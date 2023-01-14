var legal = 'Tämä sivu näyttää Kuninkaantien Lukion ruokalistan siinä muodossa kuin se on esitetty Sodexon verkkosivulla. Sivun ylläpito ei ole vastuussa virheellisestä tiedosta.';

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
 * Registers all event listeners.
 */
function registerEventListeners() {
    initButtons();

    addEventListener('resize', () => {
        calculateCssVariables();
        runAligment()
    });

    document.addEventListener('keyup', buttonPressed);
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
 * Returns true if the button to load current page should be hidden.
 */
function shouldHideTodayButton() {
    if (dayDiference % 7 == 0) return true; // Already viewing current day.

    var todayDayId = getTodayDayId();
    return todayDayId == 5 || todayDayId == -1; // Current day is Saturday or Sunday
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
    document.getElementById('ei-koulua').style.display = 'block';
    return;
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

/**
 * Displays information about the site.
 */
function displaySiteInfo() {
    displayMessage(legal, false);
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
    return moveDifferenceToCurrentWeek(difference);
}

/**
 * Returns difference to the day which is the same weekday in the same week than the current week
 * and which has the given difference to today's weekday.
 * 
 * @param {*} difference Difference from current day
 * @returns 
 */
function moveDifferenceToCurrentWeek(difference) {
    var tanaanPaivaId = getTodayDayId();
    if (tanaanPaivaId == -1) tanaanPaivaId = 6;

    var dayId = tanaanPaivaId + difference;
    if (dayId >= 7) difference -= 7;

    if (dayId < 0) difference += 7;
    return difference;
}

/**
 * Shows seka and kasvis elements. Hides no school message if it's visible.
 */
function restoreElements() {
    document.getElementById('seka').style.display = 'flex';
    document.getElementById('kasvis').style.display = 'flex';

    document.getElementById('ei-koulua').style.display = 'none';
}

/**
 * Loads menu for a day
 * 
 * @param {*} difference Diffence of days
 */
function load(difference) {
    difference = moveDifferenceToCurrentWeek(difference);
    if (dayDiference != null && difference == dayDiference) return; // No change

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

var dayDiference = calculateDayDifference();
main();
