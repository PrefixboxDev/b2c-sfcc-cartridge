'use strict';

var server = require('server');
var persistence = require('*/cartridge/scripts/prefixbox/persistence/data');

server.get('Show', server.middleware.https, function (req, res, next) {
    res.render('prefixbox/prefixboxSearch', {
        prefixboxEnabled: persistence.getPreference('PrefixboxEnabled'),
        websiteTracker: persistence.getPreference('WebsiteTracker'),
    });

    next();
});

module.exports = server.exports();
