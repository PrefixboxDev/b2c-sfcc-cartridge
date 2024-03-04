'use strict';

var server = require('server');
var persistence = require('*/cartridge/scripts/prefixbox/persistence/data');
var Logger = require('dw/system/Logger').getLogger('Prefixbox');
var prefixboxService = require('*/cartridge/scripts/services/service');
var prefixboxConstants = require('*/cartridge/scripts/prefixbox/lib/constants');
var prefixboxServiceHelper = require('*/cartridge/scripts/services/helper');
var Currency = require('dw/util/Currency');
var Site = require('dw/system/Site');

server.get('Start', function (req, res, next) {
    res.render('core/home');

    return next();
});

server.post('Save', server.middleware.https, function (req, res, next) {
    try {
        var requestBody = JSON.parse(req.body);

        Object.keys(requestBody.settings).forEach(function (key) {
            if (requestBody.settings[key] === 'true') {
                requestBody.settings[key] = true;
            }

            if (requestBody.settings[key] === 'false') {
                requestBody.settings[key] = false;
            }

            persistence.setPreference(key, requestBody.settings[key]);
        });

        res.json({
            success: true,
        });
    } catch (error) {
        Logger.error("Error while saving settings in BM configuration.");

        res.json({
            success: false
        });
    }

    return next();
});

server.post('Register', server.middleware.https, function (req, res, next) {
    try {
        var requestBody = JSON.parse(req.body);
        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            prefixboxConstants.PREFIXBOX_ENDPOINTS.SALESFORCE_REGISTER,
            req,
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var siteInformations = Site.current;
        var currencyCode = siteInformations.currencyCode;
        var siteCurrency = Currency.getCurrency(currencyCode);

        var callService = service.call(JSON.stringify({
            email: requestBody.account.Email,
            password: requestBody.account.Password,
            firstname: requestBody.account.Firstname,
            lastname: requestBody.account.Lastname,
            website: siteInformations.httpsHostName,
            currency: siteCurrency.currencyCode,
        }));

        if (!callService.isOk()) {
            var error = JSON.parse(callService.errorMessage);

            res.json({
                success: false,
                error: true,
                message: error.title,
            });

            return next();
        }

        persistence.setPreference('HasAccount', true);

        res.json({
            success: true,
        });
    } catch (error) {
        Logger.error("Error in user registration please try again.", error.toString(), error.fileName, error.lineNumber);

        res.json({
            success: false
        });
    }

    return next();
});

server.post('TestConnection', server.middleware.https, function (req, res, next) {
    try {
        if (!persistence.getPreference('ApiKey')) {
            throw new Error('Missing API key.');
        }

        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            prefixboxConstants.PREFIXBOX_ENDPOINTS.TEST_CONNECTION,
            prefixboxServiceHelper.getAPIHeaders()
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var callService = service.call();

        if (!callService.isOk()) {
            res.json({
                success: false,
                error: true
            });

            return next();
        }

        res.json({
            success: true,
        });

    } catch (error) {
        res.json({
            error: true,
            message: 'An unknown error has occurred',
            success: false
        });

        Logger.error("Error while getting suggestion list: ".concat(error));
    }

    return next();
});

server.post('ProductCatalogSync', server.middleware.https, function (req, res, next) {
    try {
        if (!persistence.getPreference('ApiKey')) {
            throw new Error('Missing API key.');
        }

        if (persistence.getPreference('ProductSyncEnabled')) {
            throw new Error('Product catalog already connected.');
        }

        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            prefixboxConstants.PREFIXBOX_ENDPOINTS.PRODUCT_CATALOG_SYNC,
            prefixboxServiceHelper.getAPIHeaders()
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var siteInformations = Site.current;
        var currencyCode = siteInformations.currencyCode;
        var siteCurrency = Currency.getCurrency(currencyCode);
        var defaultLocale = siteInformations.defaultLocale;
        var callService = service.call(JSON.stringify({
            currency: siteCurrency.currencyCode,
            primaryLocale: defaultLocale,
        }));

        if (!callService.isOk()) {
            res.json({
                success: false,
                error: true
            });

            return next();
        }

        if (callService.object.dataSetTracker) {
            persistence.setPreference('ProductSyncEnabled', true);
        }

        res.json({
            success: true,
        });
    } catch (error) {
        res.json({
            error: true,
            message: 'An unknown error has occurred',
            success: false
        });

        Logger.error("Error while creating suggestion list: ".concat(error));
    }

    return next();
});

server.get('GetSuggestionList', server.middleware.https, function (req, res, next) {
    try {
        if (!persistence.getPreference('ApiKey')) {
            throw new Error('Missing API key.');
        }
    
        if (!persistence.getPreference('ProductSyncEnabled')) {
            throw new Error('Product catalog not connected yet.');
        }

        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.GET,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            prefixboxConstants.PREFIXBOX_ENDPOINTS.GET_SUGGESTION_LIST,
            prefixboxServiceHelper.getAPIHeaders()
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var callService = service.call();

        if (!callService.isOk()) {
            res.json({
                success: false,
                error: true
            });

            return next();
        }

        res.json({
            success: true,
            suggestionList: callService.object,
        });

    } catch (error) {
        res.json({
            error: true,
            message: 'An unknown error has occurred',
            success: false
        });

        Logger.error("Error while getting suggestion list: ".concat(error));
    }

    return next();
});

server.get('GetFileVersions', server.middleware.https, function (req, res, next) {
    try {
        if (!persistence.getPreference('ApiKey')) {
            throw new Error('Missing API key.');
        }
    
        if (!persistence.getPreference('ProductSyncEnabled')) {
            throw new Error('Product catalog not connected yet.');
        }

        var params = request.httpParameterMap;

        if (!params.tracker) {
            throw new Error('Missing suggestion list tracker.');
        }

        var endpoint = prefixboxConstants.PREFIXBOX_ENDPOINTS.GET_FILE_VERSIONS.replace(':tracker', params.tracker);
        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.GET,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            endpoint,
            prefixboxServiceHelper.getAPIHeaders()
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var callService = service.call();

        if (!callService.isOk()) {
            res.json({
                success: false,
                error: true
            });

            return next();
        }

        res.json({
            success: true,
            fileVersions: callService.object.toArray(),
        });

    } catch (error) {
        res.json({
            error: true,
            message: 'An unknown error has occurred',
            success: false
        });

        Logger.error("Error while getting file versions: ".concat(error));
    }

    return next();
});

server.post('ConnectSearch', server.middleware.https, function (req, res, next) {
    try {
        if (!persistence.getPreference('ApiKey')) {
            throw new Error('Missing API key.');
        }

        if (!persistence.getPreference('ProductSyncEnabled')) {
            throw new Error('Product catalog sync not connected yet.');
        }

        if (persistence.getPreference('PrefixboxEnabled')) {
            throw new Error('Search already enabled.');
        }

        var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            prefixboxConstants.PREFIXBOX_ENDPOINTS.CREATE_SEARCH,
            prefixboxServiceHelper.getAPIHeaders()
        );

        if (!service) {
            throw new Error('Could not initialize service.');
        }

        var callService = service.call();

        if (!callService.isOk()) {
            res.json({
                success: false,
                error: true
            });

            return next();
        }

        if (callService.object.id) {
            persistence.setPreference('PrefixboxEnabled', true);
        }

        res.json({
            success: true,
        });
    } catch (error) {
        res.json({
            error: true,
            message: 'An unknown error has occurred',
            success: false
        });

        Logger.error("Error while creating Prefixbox search: ".concat(error));
    }

    return next();
});

module.exports = server.exports();