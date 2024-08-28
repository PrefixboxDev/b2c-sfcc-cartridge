'use strict';

var persistence = require('*/cartridge/scripts/prefixbox/persistence/data');
var prefixboxUploadFeedService = require('*/cartridge/scripts/services/uploadFeedService');
var prefixboxService = require('*/cartridge/scripts/services/service');

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
function uploadFeedService(productFile, id, chunkIndex) {
    var httpHeader = getFileUploadHeaders();
    var service = prefixboxUploadFeedService.createUploadRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST, 
            prefixboxConstants.PREFIXBOX_ENDPOINTS.PRODUCT_FEED_UPLOAD, 
            httpHeader,
            id,
            chunkIndex,
        );

    return service.call(productFile);
}

/**
 * @description Get Finish Feed Service
 * @function finishFeedService
 * @param {string} streamId - streamId
 * @returns {Object}-finishResponse
 */
function finishFeedService(streamId) {
    var httpHeader = getAPIHeaders();
    var endpoint = prefixboxConstants.PREFIXBOX_ENDPOINTS.PRODUCT_FEED_FINISH.replace(':streamId', streamId);

    var service = prefixboxService.createServiceRequest(
            prefixboxConstants.PREFIXBOX_HTTP_METHOD.POST,
            prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE,
            endpoint,
            httpHeader
        );

    return service.call(streamId);
}

module.exports = {
    getAPIHeaders: getAPIHeaders,
    getFileUploadHeaders: getFileUploadHeaders,
    getHeaders: getHeaders,
    uploadFeedService: uploadFeedService,
    finishFeedService: finishFeedService,
};
