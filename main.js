function initButtons() {
    document.getElementById('edellinen').addEventListener('mouseup', (event) => { if (event.button == 0) window.location.href = getNewPage(-1); }, false)
    document.getElementById('seuraava').addEventListener('mouseup', () => { if (event.button == 0) window.location.href = getNewPage(+1); }, false)
}

/**
 * Refreshes the current page to a new date.
 * Day difference is determined with url parameters
 */
function getNewPage(delta) {
    var current = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!queryString.includes('?')) {
        // No url parameters exist
        return current + '?paiva=' + delta;
    }
    if (urlParams.has('paiva')) {
        // 'paiva' url parameter exists
        var paiva = parseInt(urlParams.get('paiva')) + delta;

        if (paiva >= 7) paiva = paiva % 7;
        while (paiva < 0) paiva += 7;

        urlParams.set('paiva', paiva);
        return window.location.pathname + '?' + urlParams.toString();
    }
    // Other url parameters exist
    return current + '&paiva=' + delta;
}

/**
 * Requests a JSON file from an url and runs callback with response.
 */
function getJSON(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = () => {
        let status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };

    xhr.send();
}

/**
 * Fetches menu of the week from www.sodexo.fi as a json.
 * Updates content of page to show menu of the day.
 */
function createMenu() {
    const response = getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (err, data) => {

        if (err != null) {
            console.error(err);
        } else {
            var menu = data.mealdates[getDayId()];

            if (menu == undefined) {
                // The restaurant isn't open
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
        }

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
 * Returs id of the current week day.
 * Monday=0, Tuesday=1, ... Saturday=5, Sunday=-1
 */
function getDayId() {
    return getDate().getDay() - 1;
}

/**
 * Returns the name of the current day and date on Finnish
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
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista:';
    document.getElementById('ruoka_ka').textContent = vegetarianCourse;

    if (meatCourse != undefined) {
        document.getElementById('ruoka_sr').textContent = meatCourse;
        return;
    }

    document.getElementById('seka').style.display = 'none'; // Hide meal course elements if only vegetarian course is server.
}

/**
 * Removes course elements and adds a new header informing no school.
 */
function noSchool() {
    // Updating date
    document.getElementById('otsikko').textContent = nameOfDay() + ' ruokalista:';

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

    // Parsing day difference (ex. 11->4, -1->6)
    var difference;
    if (day <= -7 || day >= 7) {
        day = day % 7;
    }

    if (day >= 0) difference = day;
    else difference = 7 + day;

    // Moving selected date to the same week as the current day is while remaining day of the week
    var tanaanPaivaId = new Date().getDay() - 1;
    if (tanaanPaivaId == -1) tanaanPaivaId = 6;

    var uusiPaivaId = tanaanPaivaId + difference;
    if (uusiPaivaId >= 7) uusiPaivaId -= 7;

    if (uusiPaivaId < tanaanPaivaId) difference -= 7;
    return difference;
}

var dayDiference = calculateDayDifference();

initButtons();
createMenu();