'use strict';

var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Logger = require('dw/system/Logger').getLogger('Prefixbox');
var URLUtils = require('dw/web/URLUtils');

/**
 * @description Build product categories tree
 * @param {Object} product - product
 * @param {string} categoryId - categoryId
 * @param {Array} tree - array of tree object
 * @returns {string} - categories
 */
function getAllCategories(product, categoryId, tree) {
    var categories = '';
    var category = '';

    try {
        if (!empty(product) && empty(categoryId)) {
            category = product.variant ? product.masterProduct.primaryCategory : product.primaryCategory;
        } else if (!empty(categoryId)) {
            category = CatalogMgr.getCategory(categoryId);
        }

        if (category) {
            tree.push(category.displayName);

            if (category.parent && category.parent.ID !== 'root') {
                return getAllCategories(null, category.parent.ID, tree);
            }
        }

        categories += tree.reverse().join('|');
    } catch (e) {
        Logger.error('Error occurred while generating product categories. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return categories;
}

/**
 * SFRA default rating from productID ref https://github.com/SalesforceCommerceCloud/storefront-reference-architecture/blob/master/cartridges/app_storefront_base/cartridge/models/product/decorators/ratings.js
 * @description Get product rating
 * @function getProductRating
 * @param {Object} product - product
 * @returns {string} - rating
 */
function getProductRating(product) {
    var ratingValue = null;
    var sum = null;

    try {
        var id = product.ID;
        sum = id.split('').reduce(function (total, letter) {
            return total + letter.charCodeAt(0);
        }, 0);

        ratingValue = (Math.ceil(((sum % 3) + 2) + (((sum % 10) / 10) + 0.1)));
    } catch (e) {
        Logger.error('Error occurred while generating product rating. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return (ratingValue < 5 ? ratingValue + (((sum % 10) * 0.1) + 0.1) : ratingValue);
}

/**
 * @description Get variation attribute
 * @function getVariationAttribute
 * @param {Object} product - product
 * @returns {string} - product variation attribute
 */
function getVariationAttribute(product, attr) {
    var result = null;

    try {
        if (product.variant) {
            var pA = product.variationModel.getProductVariationAttribute(attr);

            if (!empty(pA)) {
                var getAllValues = product.variationModel.getAllValues(pA);
                var toArray = getAllValues.toArray();

                result = toArray.find(function (a) {
                    return a.ID === product.custom[attr];
                });
            }
        }
    } catch (e) {
        Logger.error('Error occurred while getting product variation attribute. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return result ? result.displayValue : '';
}

/**
 * @description Get custom properties object
 * @function getLisOfCustomProperties
 * @returns {Object} - properties
 */
function getLisOfCustomProperties(fields) {
    var properties = null;

    try {
        var fieldsArray = fields.split(',');

        properties = {};

        Object.keys(fieldsArray).forEach((key) => {
            properties[fieldsArray[key]] = fieldsArray[key];
        });
    } catch (e) {
        Logger.error('Error occurred while getting product custom properties. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return properties;
}

/**
 * @description Get product field
 * @function getLisOfCustomProperties
 * @returns {Object} - attr
 */
function getAttributeValue(object, name) {
    var attr = null;

    try {
        attr = name.split('.');
        var result = attr.reduce(function (prev, current) {
            if (prev === null || !(current in prev)) {
                return null;
            }

            var tmpResult = prev[current];

            if (typeof tmpResult === 'string' && !empty(tmpResult)) {
                tmpResult = StringUtils.trim(tmpResult);
            }

            return tmpResult;
        }, object);

        return result;
    } catch (e) {
        Logger.error('Error occurred while getting product attribute value. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return attr;
}

/**
 * @description Check custom attribute in product customs
 * @function checkInProductObject
 * @param {Object} product - product
 * @param {string} attribute - attribute
 * @returns {boolean} - attribute in product
 */
function checkInProductCustomsAttr(custom, attribute) {
    if (attribute in custom) {
        return true;
    }

    return false;
}

/**
 * @description Get Product Data
 * @function getProductsData
 * @param {Object} product - product
 * @param {boolean} isVariant - isVariant
 * @returns {Object} - product object
 */
function getProductsData(product, customProps) {
    var productObject = null;

    try {
        var productImage = product.getImage('large');
        var category = getAllCategories(product, null, []);
        var identifier = product.getID();
        var name = product.getName();

        productObject = {
            identifier: identifier,
            url: URLUtils.abs('Product-Show', 'pid', product.ID).toString(),
            brand: product.brand ? product.brand : '',
            name: name,
            category: category,
            imageUrl: productImage.httpsURL ? productImage.httpsURL.toString() : '',
            price: product.priceModel.minPrice.value,
            oldPrice: product.priceModel.maxPrice.value,
            description: product.shortDescription ? product.shortDescription.source : '',
            availability: product.availabilityModel.availabilityStatus,
            variantId: product.masterProduct.ID,
        }

        if (customProps.size && checkInProductCustomsAttr(product.custom, 'size') && !empty(product.custom.size)) {
            productObject.size = getVariationAttribute(product, 'size');
        }
        
        if (customProps.color && checkInProductCustomsAttr(product.custom, 'color') && !empty(product.custom.color)) {
            productObject.color = getVariationAttribute(product, 'color');
        }

        if (customProps.rating) {
            productObject.productRating = getProductRating(product);
        }

        Object.keys(customProps).forEach(function (key) {
            if (key === 'size' || key === 'color' || key === 'rating') return;

            var attribute = getAttributeValue(product, key);

            if (attribute) {
                productObject[key] = attribute;
            }
        });
    } catch (e) {
        Logger.error('Error occurred while generating products. The exception was {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return productObject;
}

/**
 * @description Get product object to be exported
 * @function processProducts
 * @param {Object} product - product
 * @returns {Object} - product object
 */
function processProducts(product, customProps, productVariantExport) {
    var prefixboxProducts = [];

    try {
        var getProduct = ProductMgr.getProduct(product);

        if (productVariantExport) {
            prefixboxProducts.push(getProductsData(getProduct, customProps));
        } else {
            if(!getProduct.variant) {
                prefixboxProducts.push(getProductsData(getProduct, customProps));
            }
        }
    } catch (e) {
        Logger.error('Error occurred while processing products exception: {0} in {1} -- {2}', e.toString(), e.fileName, e.lineNumber);
    }

    return prefixboxProducts;
}

module.exports = {
    getAttributeValue: getAttributeValue,
    getProductRating: getProductRating,
    getAllCategories: getAllCategories,
    processProducts: processProducts,
    getLisOfCustomProperties: getLisOfCustomProperties,
    getProductsData: getProductsData,
    checkInProductCustomsAttr: checkInProductCustomsAttr,
    getVariationAttribute: getVariationAttribute,
};