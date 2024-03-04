'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger').getLogger('Prefixbox');

/**
 * https://gist.github.com/zenoyu/a30df1e88859214b29d900a490c73692
 * https://developer.salesforce.com/docs/commerce/b2c-commerce/guide/b2c-webservices.html
 * http://www.it-surmann.com/salesforce-commerce-cloud/best-practice-for-creating-a-service-in-sfcc_1009.html
 * @description This function is used to create service request.
 * @function createServiceRequest
 * @param {string} method - method
 * @param {string} service - service
 * @param {Object} httpHeaders - httpHeaders
 * @returns {Object}-httpRequest
 */
function createServiceRequest(method, service, endPoint, httpHeaders) {
    var httpRequest = LocalServiceRegistry.createService(service, {
        createRequest: function (svc, args) {
            var baseURL = svc.getConfiguration().getCredential().getURL();

            if (httpHeaders) {
                var header = JSON.stringify(httpHeaders);
                var parseHeader = JSON.parse(header);
    
                Object.keys(parseHeader).forEach(function (key) {
                    var value = parseHeader[key];

                    svc.addHeader(key, value);
                });
            }

            svc.addHeader('Content-Type', 'application/json');
            svc.setURL(baseURL + endPoint);
            svc.setRequestMethod(method);
            
            if (args) {
                return args;
            }

            return null;
        },
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        },
        getRequestLogMessage: function (serviceRequest) {
            return serviceRequest;
        },
        getResponseLogMessage: function (serviceResponse) {
            if (!empty(serviceResponse) && !empty(serviceResponse.errorText)) {
                Logger.error('Error occurred while calling Prefixbox API. {0} - {1} - {2}', serviceResponse.statusCode, serviceResponse.statusMessage, serviceResponse.errorText);
                
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
    createServiceRequest: createServiceRequest
};