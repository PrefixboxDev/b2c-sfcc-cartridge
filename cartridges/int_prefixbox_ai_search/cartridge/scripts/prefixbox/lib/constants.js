'use strict';

var File = require('dw/io/File');

var PREFIXBOX_FILES_FOLDER = File.IMPEX + '/src/prefixbox/feeds/products/';
var PREFIXBOX_APP_NAME_PREFIX = 'Prefixbox_';
var PREFIXBOX_FILE_FORMAT = '.json';

var PREFIXBOX_SERVICES = {
    PREFIXBOX_API_ENDPOINT_SERVICE: 'int.prefixbox.http.api',
};

var PREFIXBOX_HTTP_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT'
};

var PREFIXBOX_ENDPOINTS = {
    TEST_CONNECTION: '/salesforce/test-connection',
    PRODUCT_CATALOG_SYNC: '/salesforce/suggestion-list/create',
    PRODUCT_FEED_UPLOAD: '/salesforce/upload/product-feed',
    GET_SUGGESTION_LIST: '/salesforce/website/suggestion-list',
    GET_FILE_VERSIONS: '/salesforce/fileversions/:tracker',
    CREATE_SEARCH: '/salesforce/create-search',
    SALESFORCE_REGISTER: '/salesforce/register',
}

module.exports = {
    PREFIXBOX_FILES_FOLDER: PREFIXBOX_FILES_FOLDER,
    PREFIXBOX_APP_NAME_PREFIX: PREFIXBOX_APP_NAME_PREFIX,
    PREFIXBOX_SERVICES: PREFIXBOX_SERVICES,
    PREFIXBOX_HTTP_METHOD: PREFIXBOX_HTTP_METHOD,
    PREFIXBOX_ENDPOINTS: PREFIXBOX_ENDPOINTS,
    PREFIXBOX_FILE_FORMAT: PREFIXBOX_FILE_FORMAT,
};
