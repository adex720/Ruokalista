

function init() {
    align();
    checkForMessage();

    addEventListeners();

    updateMenu();
}

function align() {
    var width = getElementWidth('otsikko_ka');
    document.getElementById('otsikko_sr').setAttribute('style', 'flex-basis:' + width + 'px');
}

function addEventListeners() {
    initButtons();

    document.addEventListener('keyup', buttonPressed);
}

/**
 * Adds mouse event listeners to movement buttons.
 */
function initButtons() {
    hideUnneccessaryButtons();

    document.getElementById('edellinen').addEventListener('mouseup', e => movementButtonPressed(e.button, -1), false);
    document.getElementById('seuraava').addEventListener('mouseup', e => movementButtonPressed(e.button, +1), false);
    document.getElementById('tanaan').addEventListener('mouseup', e => movementButtonPressed(e.button, undefined), false);

    document.getElementById('koodi').addEventListener('click', showCode);
    document.getElementById('paivita').addEventListener('click', askNewSchedule);
    document.getElementById('posita').addEventListener('click', deleteUser);
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

/**
 * Shows the code of the account
 */
function showCode() {
}

/**
 * Hides the code of the account
 */
function hideCode() {

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

}

init();