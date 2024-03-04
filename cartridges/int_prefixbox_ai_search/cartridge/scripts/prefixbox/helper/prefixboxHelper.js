'use strict';

var Calendar = require('dw/util/Calendar');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var StringUtils = require('dw/util/StringUtils');
var prefixboxConstants = require('*/cartridge/scripts/prefixbox/lib/constants');

/**
 * @description For getting current date for filename
 * @returns {string} formatted current date
 */
function getFormattedDate() {
    var calendar = new Calendar();
    var currentDate = StringUtils.formatCalendar(calendar, "yyyy-MM-dd_HH:mm:ss");

    return currentDate;
}

/**
 * @description Generate feed file name
 * @returns {string} filename - feed file name
 */
function getFeedFileName() {
    return 'prefixbox_feed_export_' + getFormattedDate() + prefixboxConstants.PREFIXBOX_FILE_FORMAT;
}

/**
 * @description Creates feed file in a IMPEX directory and returns a new FileWriter.
 * @param {string} sourcePath - sourcePath
 * @returns {FileWriter} filewriter - filewriter
 */
function createFeedFile(sourcePath) {
    var workingPath = File.IMPEX + sourcePath;
    var fileName = getFeedFileName();
    var fileDirectory = new File(workingPath);
    var file = new File(workingPath + fileName);

    if (!file.exists()) {
        fileDirectory.mkdirs();

        return new File(workingPath + fileName);
    }

    return file;
}

/**
 * @description Creates feed file in a IMPEX directory.
 * @param {string} sourcePath - sourcePath
 * @returns {FileWriter} filewriter - filewriter
 */
function createProductFeedFile(sourcePath) {
    return createFeedFile(sourcePath);
}

/**
 * @description Writes product file in IMPEX
 * @function writeProductFile
 * @param {string} source - source
 * @param {Object} products - products
 * @returns {file} - productFile
 */
function writeProductFile(source, products) {
    var productFile = createProductFeedFile(source);
    var productFileWriter = new FileWriter(productFile);

    productFileWriter.writeLine(JSON.stringify(products));
    productFileWriter.flush();
    productFileWriter.close();

    return productFile;
}

module.exports = {
    getFormattedDate: getFormattedDate,
    getFeedFileName: getFeedFileName,
    createFeedFile: createFeedFile,
    createProductFeedFile: createProductFeedFile,
    writeProductFile: writeProductFile,
};