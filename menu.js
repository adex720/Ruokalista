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

// Stores menu json so it is requested from the server only once.
var cached = undefined;

/**
 * Gets the menu of a day and calls update with courses.
 * If the restaurant is closed, different funtion is called.
 * 
 * @param {*} dayId      Id of the day to fetch
 * @param {*} whenClosed Action to be executed when restaurant is closed
 * @param {*} update     Action to update menu
 */
function getCourse(dayId, whenClosed, update) {
    if (cached != undefined) {
        parseCourse(cached, dayId, whenClosed, update);
        return;
    }

    getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (error, data) => {
        if (error != null) {
            console.error(error);
            displayMessage('Ruokalistan hakeminen Sodexon palvelimelta epäonnistui. Ongelma on Sodexon päässä. Yleensä tilanne korjaantuu 15 minuutissa.', true);
            return;
        }

        cached = data;

        try {
            return parseCourse(data, dayId, whenClosed, update);
        } catch (e) {
            console.error(e);
            displayMessage('Palvelimelta saadun datan lukeminen epäonnistui. Mikäli tilanne ei ole korjaantunut 15 minuutin päästä, voit pyytää minua etsimään syytä. Jos en ole lähistöllä, voit jodlata.', true);
            return;
        }
    });
}

/**
 * Returns courses of the week as a 2d-array.
 * Calls update with all the courses.
 */
function getCourses(update) {
    if (cached != undefined) {
        parseCourse(cached, update);
        return;
    }

    getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (error, data) => {
        if (error != null) {
            console.error(error);
            displayMessage('Ruokalistan hakeminen Sodexon palvelimelta epäonnistui. Ongelma on Sodexon päässä. Yleensä tilanne korjaantuu 15 minuutissa.', true);
            return;
        }

        cached = data;

        try {
            parseCourses(data, update);
        } catch (e) {
            console.error(e);
            displayMessage('Palvelimelta saadun datan lukeminen epäonnistui. Mikäli tilanne ei ole korjaantunut 15 minuutin päästä, voit pyytää minua etsimään syytä. Jos en ole lähistöllä, voit jodlata.', true);
            return;
        }
    });
}

/**
 * Fixes the day id when the restaurant is closed on some day of the week.
 * Returns -1 if closed.
 */
function getDayIndex(dayId, data) {
    var name = nameOfDayById(dayId);
    if (name == undefined) return -1;
    var dayNameStart = name.substring(0, 2).toLowerCase();

    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        var current = obj.date.substring(0, 2).toLowerCase();

        if (current == dayNameStart) {
            return i;
        }
    }

    return -1;
}

/**
 * Parses json to get meal and vegetarian meal names for the day.
 * Calls update with meal names.
 * 
 * @param {*} data       Json
 * @param {*} dayId      Id of day
 * @param {*} whenClosed Called when restaurant is closed
 * @param {*} update     Called when restaurant is open
 */
function parseCourse(data, dayId, whenClosed, update) {
    // Getting many of the correct day
    dayId = getDayIndex(dayId, data.mealdates);

    if (dayId == -1) {
        // The restaurant isn't open

        // The restaurant is open during most holidays, but the menu will still be shown,
        // becuase the website is telling the menu and not when there is school. 
        whenClosed();
        return;
    }
    var menu = data.mealdates[dayId];

    if (menu == undefined) {
        whenClosed();
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

/**
 * Parses courses json to array of course names and calls update.
 * 
 * @param {*} data   Json
 * @param {*} update Data updating
 */
function parseCourses(data, update) {
    var menus = data.mealdates;
    var courses = []; // names

    if (menus.length != 5) {
        courses = parseCoursesOnSpecialWeek(data);
        update(courses);
        return;
    }

    // Looping Mon-Fri
    for (var i = 0; i < 5; i++) {
        var menu = menus[i];

        if (menu == undefined) {
            // Closed this day
            courses[i] = undefined;
            continue;
        }

        // Courses of the day as json
        var coursesJson = menu.courses;
        var course = coursesToObject(coursesJson);

        // Add courses to array
        courses[i] = course;
    }

    update(courses);
}

/**
 * Parses courses json to array of course names and calls update.
 * Used when the open days are different than mon-fri.
 * 
 * @param {*} data   Json
 * @param {*} update Data updating
 */
function parseCoursesOnSpecialWeek(data) {
    var menus = data.mealdates;
    var courses = [];
    for (var i = 0; i < menus.length; i++) {
        var course = data[i];

        courses[getDayId('ma')] = 2;
    }

    return courses;
}

/**
 * Parses courses of one day from json to an object.
 */
function coursesToObject(coursesJson) {
    // Courses of the day as strings
    var meatCourse;
    var vegetarianCourse;

    // Add correct valuese
    if (coursesJson[2] != undefined) {
        // 2 courses
        meatCourse = coursesJson[1].title_fi;
        vegetarianCourse = coursesJson[2].title_fi;
    } else {
        // Only vegetarian course
        meatCourse = undefined;
        vegetarianCourse = coursesJson[1].title_fi;
    }

    return [meatCourse, vegetarianCourse];
}

