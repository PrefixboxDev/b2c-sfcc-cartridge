'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('Prefixbox');
var FileReader = require('dw/io/FileReader');

/**
 * https://gist.github.com/zenoyu/a30df1e88859214b29d900a490c73692
 * https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-webservices.html
 * https://www.rhino-inquisitor.com/submitting-a-file-to-a-third-party-service-in-sfcc/
 * @description This function is used to create upload service request.
 * @function createUploadRequest
 * @param {string} method - method
 * @param {string} endPoint - endPoint
 * @param {Object} httpHeaders - httpHeaders
 * @returns {Object}-httpRequest
 */
function createUploadRequest(method, endPoint, httpHeaders, id, chunkIndex) {
    var prefixboxConstants = require('*/cartridge/scripts/prefixbox/lib/constants');
    var httpRequest = LocalServiceRegistry.createService(prefixboxConstants.PREFIXBOX_SERVICES.PREFIXBOX_API_ENDPOINT_SERVICE, {
        createRequest: function (svc, args) {
            var baseURL = svc.getConfiguration().getCredential().getURL();
            var fileContent = null;
            var header = JSON.stringify(httpHeaders);
            var parseHeader = JSON.parse(header);

            Object.keys(parseHeader).forEach(function (key) {
                svc.addHeader(key, parseHeader[key]);
            });
            svc.setURL(baseURL + endPoint + '/' + chunkIndex + '/' + id);
            svc.setRequestMethod(method);

            if (args) {
                var fileReaders = new FileReader(args);

                fileContent = fileReaders.getString();
                fileReaders.close();
            }

            return fileContent;
        },
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        },
        getRequestLogMessage: function (serviceRequest) {
            return serviceRequest;
        },
        getResponseLogMessage: function (serviceResponse) {
            if (!empty(serviceResponse) && !empty(serviceResponse.errorText)) {
                Logger.error('Error occurred while calling Prefixbox upload API. {0} - {1} - {2}', serviceResponse.statusCode, serviceResponse.statusMessage, serviceResponse.errorText);
                
                return serviceResponse.errorText;
            }

            return serviceResponse.text;
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    
    return httpRequest;
}

module.exports = {
    createUploadRequest: createUploadRequest
};