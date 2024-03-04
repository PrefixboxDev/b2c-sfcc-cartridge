'use strict';

/** https://jatin29.medium.com/maximizing-efficiency-with-the-chunk-oriented-script-module-in-the-job-framework-for-storefront-80145fe375a9 */
var ArrayList = require('dw/util/ArrayList');
var Logger = require('dw/system/Logger').getLogger('Prefixbox');
var ProductMgr = require('dw/catalog/ProductMgr');

var prefixboxServiceHelper = null;
var prefixboxHelper = null;
var products = null;
var productsToExport = [];
var sourceFolder = null;
var productFile = null;
var productFile = null;
var productGenerator = null;
var persistence = null;
var productSyncEnabled = null;
var customProperties = null;
var productVariantExport = null;
var fields = null;
var products;

exports.beforeStep = function (parameters, stepExecution) {
    prefixboxHelper = require('*/cartridge/scripts/prefixbox/helper/prefixboxHelper');
    prefixboxServiceHelper = require('*/cartridge/scripts/services/helper');
    productGenerator = require('*/cartridge/scripts/prefixbox/helper/generateProduct');
    sourceFolder = parameters.get('srcFolder');
    persistence = require('*/cartridge/scripts/prefixbox/persistence/data');
    productSyncEnabled = persistence.getPreference('ProductSyncEnabled');

    if (productSyncEnabled) {
        productVariantExport = persistence.getPreference('ProductVariantExport');
        fields = persistence.getPreference('Fields');
        customProperties = productGenerator.getLisOfCustomProperties(fields);
        products = ProductMgr.queryAllSiteProductsSorted();
    }
};

exports.read = function (parameters, stepExecution) {
    if (productSyncEnabled) {
        if (products.hasNext()) {
            var productSearch = products.next();

            return productSearch.getID();
        }
    }
};

exports.process = function (product, parameters, stepExecution) {
    if (productSyncEnabled) {
        return productGenerator.processProducts(product, customProperties, productVariantExport);
    }
};

exports.write = function (lines, parameters, stepExecution) {
    if (productSyncEnabled) {
        var productsList = new ArrayList(lines).toArray();

        productsList.forEach(function (item) {
            var id = item;

            if (id && id.length >= 1) {
                Object.keys(id).forEach(function (key) {
                    productsToExport.push(item[key]);
                });
            }
        });
    }
};

exports.afterStep = function (success, parameters, stepExecution) {
    if (productSyncEnabled) {
        productFile = prefixboxHelper.writeProductFile(sourceFolder, productsToExport);
        Logger.info('Total products Exported: {0}', productsToExport.length);
        productsToExport = [];

        var uploadServiceResult = prefixboxServiceHelper.uploadFeedService(productFile);

        if (!empty(uploadServiceResult) && uploadServiceResult.ok) {
            products.close();

            Logger.info('File uploaded successfully');

            if (parameters.get('deleteFile')) {
                productFile.remove();
                Logger.info('File uploaded and removed successfully ' + productFile.path + '');
            }
        }
    }
};
