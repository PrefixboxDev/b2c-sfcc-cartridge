'use strict';

var guard = require('*/cartridge/scripts/guard');
var ISML = require('dw/template/ISML');
var persistence = require('*/cartridge/scripts/prefixbox/persistence/data');

function Show() {
    ISML.renderTemplate('prefixbox/prefixboxSearch', {
        prefixboxEnabled: persistence.getPreference('PrefixboxEnabled'),
        websiteTracker: persistence.getPreference('WebsiteTracker'),
    });
}

exports.Show = guard.ensure(['https'], Show);