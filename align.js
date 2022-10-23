/**
 * Makes more significant changes to the display of the page
 * to improve looks on smaller screens.
 */


/**
 * Reduces page height by reducing marginals and moving contact icons if the screen height is small.
 */
function runAligment() {
    resetRealigment();
    // All values are in pixels.

    // Realigment will be run if the space between 'seuraava'-button and contact icons is less than this value.
    var minSpaceBetweenButtonsAndContacts = 5;

    if (!shouldRealign(minSpaceBetweenButtonsAndContacts)) {
        return;
    }

    editCssVariable('--between_margin', '1rem');

    if (!shouldRealign(minSpaceBetweenButtonsAndContacts)) {
        return;
    }

    document.getElementById('contact-filler').style.display = 'block';

    // TODO: add contacts to navbar when even smaller screen

}

/**
 * Resets the page to default
 */
function resetRealigment() {
    editCssVariable('--between_margin', '2rem');
    document.getElementById('contact-filler').style.display = 'none';
}

/**
 * Returns true if contact icons are too close to the movement buttons.
 * 
 * @param {*} min Minimum amount of pixels allowed between contacts and the buttons.
 */
function shouldRealign(min) {
    var contactsStart = getElementY('contacts');
    var contentEnd = getElementBottomY('navigointi');
    return contactsStart - contentEnd < min;
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
 * Returns the bounding client rectangle of an element.
 * 
 * @param {*} id Id of the element
 */
function getElementBounding(id) {
    return document.getElementById(id).getBoundingClientRect();
}

/**
 * Returns the X coordinate of the element.
 * 
 * @param {*} id Id of the element
 */
function getElementX(id) {
    return getElementBounding(id).left;
}

/**
 * Returns the X coordinate of the right most point of the element.
 * 
 * @param {*} id Id of the element
 */
function getElementRightX(id) {
    return getElementBounding(id).right;
}

/**
 * Returns the Y coordinate of the element.
 * 
 * @param {*} id Id of the element
 */
function getElementY(id) {
    return getElementBounding(id).top;
}

/**
 * Returns the Y coordinate of the bottom most point of the element.
 * 
 * @param {*} id Id of the element
 */
function getElementBottomY(id) {
    return getElementBounding(id).bottom;
}

/**
 * Returns the height of the element.
 * 
 * @param {*} id  Id of the element
 */
function getElementHeight(id) {
    var bounding = getElementBounding(id);
    return bounding.bottom - bounding.top;
}

/**
 * Returns the height of the element with margins.
 * 
 * @param {*} id  Id of the element
 */
function getElementHeightWithMargin(id) {
    var element = document.getElementById(id);
    var bounding = element.getBoundingClientRect();
    return bounding.bottom - bounding.top + element.style.marginTop + element.style.marginBottom;
}
