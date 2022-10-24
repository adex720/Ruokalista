/**
 * Makes more significant changes to the display of the page
 * to improve looks on smaller screens.
 */


/**
 * Fixes element dimesnions which are based on other elements.
 */
function fixDimensions() {
    var width = getElementWidth('otsikko_ka');
    document.getElementById('otsikko_sr').setAttribute('style', 'flex-basis:' + width + 'px');

    width = getElementWidthWithSurroundings('seuraava');
    document.getElementById('contact-filler').setAttribute('style', 'width:' + width + 'px');
}

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


    if (!shouldMoveContacts()) {
        document.getElementById('contact-filler').style.display = 'block';
        return;
    }

    moveContactsToNavbar();
}

/**
 * Resets the page to default
 */
function resetRealigment() {
    editCssVariable('--between_margin', '2rem');
    document.getElementById('contact-filler').style.display = 'none';
    moveContactsToBottom();
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
 * Returns true if the contact icons should be relocated to navbar.
 * This is the case when otherwise the icons would be at least partly above the navbar.
 */
function shouldMoveContacts() {
    var contactsEnd = getElementBottomY('contacts');
    var buttonEnd = getElementBottomY('edellinen');
    return contactsEnd < buttonEnd;
}

/**
 * Moves the contacts to the bottom of the page
 */
function moveContactsToBottom() {
    var contacts = document.getElementById('contacts');
    var parent = contacts.parentElement;

    if (parent.id !== 'cf-placeholder-bottom') {
        parent.removeChild(contacts);

        var placeholder = document.getElementById('cf-placeholder-bottom');
        placeholder.appendChild(contacts);

        var navbarPlaceholder = document.getElementById('cf-placeholder-navbar');
        navbarPlaceholder.style.position = 'absolute';
    }
}

/**
 * Moves the contacts to the navbar
 */
function moveContactsToNavbar() {
    document.getElementById('contact-filler').style.display = 'none';

    var contacts = document.getElementById('contacts');
    var parent = contacts.parentElement;

    if (parent.id !== 'cf-placeholder-navbar') {
        parent.removeChild(contacts);

        var placeholder = document.getElementById('cf-placeholder-navbar');
        placeholder.appendChild(contacts);

        placeholder.style.position = 'relative';
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
 * Returns the height of the element with margin and padding.
 * 
 * @param {*} id  Id of the element
 */
function getElementHeightWithSurroundings(id) {
    var element = document.getElementById(id);
    var bounding = element.getBoundingClientRect();
    return bounding.bottom - bounding.top + element.style.marginTop + element.style.marginBottom + element.style.paddingTop + element.style.paddingBottom;
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
 * Returns the width of the element with margin and padding.
 * 
 * @param {*} id  Id of the element
 */
function getElementWidthWithSurroundings(id) {
    var element = document.getElementById(id);
    var bounding = element.getBoundingClientRect();
    return bounding.right - bounding.left + element.style.marginLeft + element.style.marginRight + element.style.paddingLeft + element.style.paddingRight;
}
