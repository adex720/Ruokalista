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
 * Gets the menu of a day and calls update with courses.
 * If the restaurant is closed, different funtion is called.
 * 
 * @param {*} dayId      Id of the day to fetch
 * @param {*} whenClosed Action to be executed when restaurant is closed
 * @param {*} update     Action to update menu
 */
function getCourse(dayId, whenClosed, update) {
    getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (error, data) => {
        if (error != null) {
            console.error(error);
            return;
        }

        // Getting many of the correct day
        var menu = data.mealdates[dayId];

        if (menu == undefined) {
            // The restaurant isn't open

            // The restaurant is open during most holidays, but the menu will still be shown,
            // becuase the website is telling the menu and not when there is school. 
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

    });
}