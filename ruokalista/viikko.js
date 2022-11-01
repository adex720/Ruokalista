function initButtons() {
    document.getElementById('takaisin').addEventListener('onclick', () => window.location.pathname += '../');
}

/**
 * Reads courses of the week from an array and dispalys them on the page.
 * 
 * @param {*} courses Courses as a 2d array.
 */
function loadCourses(courses) {
    for (var dayId = 0; dayId < 5; dayId++) {
        var menu = courses[dayId];

        if (menu == undefined) {
            hide(dayId);
            continue;
        }

        setMenu(dayId, menu[0], menu[1]);
    }
}

/**
 * Sets the menu for the day.
 * 
 * @param {*} dayId            Id of the day
 * @param {*} meatCourse       Name of the meat course, can be undefined
 * @param {*} vegetarianCourse Name of the vegetarian course
 */
function setMenu(dayId, meatCourse, vegetarianCourse) {
    var dayName = finnishNameOfDayShort(dayId);

    document.getElementById('ruoka_ka_' + dayName).textContent = vegetarianCourse;

    if (meatCourse != undefined) {
        // Set meat course name if it's server
        document.getElementById('ruoka_sr_' + dayName).textContent = meatCourse;
        return;
    }

    // Hide meat course elements if only vegetarian course is served.
    getDayElement(dayId).getElementsByClassName('seka')[0].style.display = 'none';
}

/**
 * Hides the day from the page.
 * 
 * @param {*} dayId Id of the day (0=Monday...)
 */
function hide(dayId) {
    getDayElement(dayId).style.display = 'none';
}

/**
 * Returns the div element of the day on the document.
 * 
 * @param {*} dayId If of the day
 */
function getDayElement(dayId) {
    return document.getElementById(finnishNameOfDay(dayId, false));
}

/**
 * Returns name of the weekday on Finnish.
 * 
 * @param {*} dayId      Id of the day (0=Monday...)
 * @param {*} capitalize Should the first letter be capital.
 */
function finnishNameOfDay(dayId, capitalize) {
    var name;
    switch (dayId) {
        case 0: name = 'maanantai'; break;
        case 1: name = 'tiistai'; break;
        case 2: name = 'keskiviikko'; break;
        case 3: name = 'torstai'; break;
        case 4: name = 'perjantai'; break;
        case 5: name = 'lauantai'; break;
        case 6: name = 'sunnuntai';
    }

    if (!capitalize) return name;

    return name[0].toUpperCase() + name.substring(1);
}

/**
 * Returns the first 2 letters of the finnish name of the day.
 * 
 * @param {*} dayId Id of the day (0=Monday...)
 */
function finnishNameOfDayShort(dayId) {
    switch (dayId) {
        case 0: return 'ma';
        case 1: return 'ti';
        case 2: return 'ke';
        case 3: return 'to';
        case 4: return 'pe';
        case 5: return 'la';
        case 6: return 'su';
    }
}

/**
 * Makes all course title elemnts have equal width.
 */
function fixAligment() {
     // Titles always exists because this method is called before making web request.
    var element = document.getElementById('otsikko_ka_ma');
    var width = element.getBoundingClientRect().width;

    var titles = document.getElementsByClassName('widthfix');
    for (var i = 0; i < titles.length; i++) {
        titles[i].setAttribute('style', 'flex-basis:' + width + 'px');
    }
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
 * Called when page is loaded.
 */
function main() {
    initButtons();
    fixAligment();

    getCourses(loadCourses);

}

main();
