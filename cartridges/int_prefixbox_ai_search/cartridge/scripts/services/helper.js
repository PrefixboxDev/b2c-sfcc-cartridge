'use strict';

var persistence = require('*/cartridge/scripts/prefixbox/persistence/data');
var prefixboxUploadFeedService = require('*/cartridge/scripts/services/uploadFeedService');
var prefixboxConstants = require('*/cartridge/scripts/prefixbox/lib/constants');

/**
 * @description Get API headers
 * @function getAPIHeaders
 * @returns {Object}-headers
 */
function getAPIHeaders() {
    var apiKey = persistence.getPreference('ApiKey');
    var websiteTracker = persistence.getPreference('WebsiteTracker');

    return {
        'X-PREFIXBOX-API-KEY': apiKey,
        'X-PREFIXBOX-WEBSITE-TRACKER': websiteTracker,
    };
}

/**
 * @description Get uploader service headers
 * @function getFileUploadHeaders
 * @returns {Object}-headers
 */
function getFileUploadHeaders() {
    var apiKey = persistence.getPreference('ApiKey');
    var websiteTracker = persistence.getPreference('WebsiteTracker');
    
    return {
        'Content-Type': 'application/octet-stream',
        'X-PREFIXBOX-API-KEY': apiKey,
        'X-PREFIXBOX-WEBSITE-TRACKER': websiteTracker,
    };
}

/**
 * @description Get  headers
 * @function getHeaders
 * @returns {Object}-headers
 */
function getHeaders() {
    return {
        'Content-Type': 'application/json',
    };
}

/**
 * @description Get Upload Feed Service
 * @function uploadFeedService
 * @param {string} productFile - productFile
 * @returns {Object}-uploadResponse
 */
function uploadFeedService(productFile) {
    var httpHeader = getFileUploadHeaders();
    var service = prefixboxUploadFeedService.createUploadRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST, 
            prefixboxConstants.PREFIXBOX_ENDPOINTS.PRODUCT_FEED_UPLOAD, 
            httpHeader, 
        );

    return service.call(productFile);
}

module.exports = {
    getAPIHeaders: getAPIHeaders,
    getFileUploadHeaders: getFileUploadHeaders,
    getHeaders: getHeaders,
    uploadFeedService: uploadFeedService,
};
