/**
 * Runs everything that should be run before asking menu from server
 */
function init() {
    calculateCssVariables();
    fixDimensions();
}

/**
 * Calculates values for variables on a stylesheet where the value can't easily be set without the help of javasript.
 */
function calculateCssVariables() {
    editCssVariable('--contact-size-multiplier', window.devicePixelRatio * document.body.clientWidth / 2544 * 1.1  + 0.12);
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
 * Registers all event listeners expect key and mouse listeners.
 */
function registerEventListeners() {
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

    if (movement != undefined) {
        window.location.href = getNewPageByDifference(movement)
        return;
    }
    window.location.href = getNewPageByDayId(0);
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
 * Requests a JSON file from an url and runs callback with response.
 */
function getJSON(url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'json';

    request.onload = () => {
        let status = request.status;
        if (status == 200) {
            callback(null, request.response);
        } else {
            callback(status);
        }
    };

    request.send();
}

/**
 * Fetches menu of the week from www.sodexo.fi as a json.
 * Updates content of page to show menu of the day.
 */
function createMenu() {
    getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (error, data) => {
        if (error != null) {
            console.error(error);
            return;
        }

        // Getting many of the correct day
        var menu = data.mealdates[getDayId()];

        if (menu == undefined) {
            // The restaurant isn't open

            // The restaurant is open during most holidays, but the menu will still be shown,
            // becuase the website is telling the menu and not when there is school. 
            noSchool();
            return;
        }
        var courses = menu.courses;

        var meatCourse;
        var vegetarianCourse;

        if (courses[2] != undefined) {
            // 2 courses
            meatCourse = courses[1].title_fi;
            vegetarianCourse = courses[2].title_fi;
        } else {
            // Only vegetarian course
            meatCourse = undefined;
            vegetarianCourse = courses[1].title_fi;
        }

        update(meatCourse, vegetarianCourse);

    });
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
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista';
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
    const title = document.createElement('h1');
    title.textContent = 'Tänään ei ole koulua ):';
    title.className = 'info';
    document.getElementById('otsikko').parentElement.appendChild(title);

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

init();

var dayDiference = calculateDayDifference();

registerEventListeners();

initButtons();
createMenu();
