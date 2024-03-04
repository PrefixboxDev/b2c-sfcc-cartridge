'use strict';

var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var prefixboxConstants = require('*/cartridge/scripts/prefixbox/lib/constants');

/**
 * @description Get current site depending on request parameter
 * @returns {dw.system.Site} current site
 */
function getCurrentSite() {
    return Site.getCurrent();
}

var currentSite = getCurrentSite();

/**
 * @description Set preference for integration
 * @param {string} id name of preference
 * @param {string} value to save
 * @returns {void}
 */
function setPreference(id, value) {
    Transaction.wrap(function () {
        currentSite.setCustomPreferenceValue(prefixboxConstants.PREFIXBOX_APP_NAME_PREFIX + id, value);
    });
}

/**
 * @description Getting preference for integration
 * @param {string} id name of preference
 * @returns {*} value of preference
 */
function getPreference(id) {
    var value = currentSite.getCustomPreferenceValue(prefixboxConstants.PREFIXBOX_APP_NAME_PREFIX + id);
    
    return value === null ? '' : value;
}

module.exports = {
    getPreference: getPreference,
    setPreference: setPreference,
    getCurrentSite: getCurrentSite
};
