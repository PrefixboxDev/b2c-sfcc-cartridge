const ConversionStatus = {
    Failed: 0,
    Converted: 1,
    InProgress: 2,
    NotAvailable: 3,
};

const DataSetVersionStatus = {
    None: 0,
    Previous: 1,
    Current: 2,
    Deleted: 3,
    Next: 4,
    Failed: 5,
};

function formatBytes(bytes, decimals) {
    if (bytes == 0) {
        return '0 Bytes';
    }

    var k = 1024;
    var dm = decimals || 2;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function fileVersionValidationText(value) {
    switch (value) {
        case null:
            return 'Validating';
        case false:
            return 'Not valid';
        case true:
            return 'Valid';
        default:
            return '';
    }
};

function fileVersionValidationIcon(value) {
    switch (value) {
        case null:
            return ('<div class="spinner-border text-dark table-spinner" role="status"><span class="visually-hidden" /></div>');
        case false:
            return ('<i class="ri-close-circle-fill text-danger"></i>');
        case true:
            return ('<i class="ri-checkbox-circle-fill text-success"></i>');
        default:
            return '';
    }
};

function fileVersionConversionStatusText(value) {
    switch (value) {
        case ConversionStatus.Failed:
            return 'Failed';
        case ConversionStatus.InProgress:
            return 'Converting';
        case ConversionStatus.NotAvailable:
            return '-';
        case ConversionStatus.Converted:
            return 'Converted';
        default:
            return '';
    }
};

function fileVersionConversionStatusIcon(value) {
    switch (value) {
        case ConversionStatus.InProgress:
            return ('<div class="spinner-border text-dark table-spinner" role="status"><span class="visually-hidden" /></div>');
        case ConversionStatus.Failed:
            return ('<i class="ri-close-circle-fill text-danger"></i>');
        case ConversionStatus.NotAvailable:
            return ('<i class="ri-error-warning-fill text-warning"></i>');
        case ConversionStatus.Converted:
            return ('<i class="ri-checkbox-circle-fill text-success"></i>');
        default:
            return '';
    }
};

function fileVersionStatusText(value) {
    switch (value) {
        case DataSetVersionStatus.Failed:
            return 'Failed';
        case DataSetVersionStatus.Next:
            return 'Next';
        case DataSetVersionStatus.Deleted:
            return 'Deleted';
        case DataSetVersionStatus.Previous:
            return 'Previous';
        case DataSetVersionStatus.None:
            return '-';
        case DataSetVersionStatus.Current:
            return 'Live';
        default:
            return 'In progress';
    }
};

function fileVersionStatusIcon(value) {
    switch (value) {
        case DataSetVersionStatus.Failed:
            return ('<i class="ri-close-circle-fill text-danger"></i>');
        case DataSetVersionStatus.Previous:
            return ('<i class="ri-arrow-left-line"></i>');
        case DataSetVersionStatus.Next:
            return ('<i class="ri-arrow-right-line"></i>');
        case DataSetVersionStatus.None:
            return ('<i class="ri-error-warning-fill text-warning"></i>');
        case DataSetVersionStatus.Current:
            return ('<i class="ri-checkbox-circle-fill text-success"></i>');
        default:
            return ('<div class="spinner-border text-dark table-spinner" role="status"><span class="visually-hidden" /></div>');
    }
};

const staticTags = [{
    value: "productName",
    readOnly: true,
}, {
    value: "identifier",
    readOnly: true,
}, {
    value: "url",
    readOnly: true,
}, {
    value: "imageUrl",
    readOnly: true,
}, {
    value: "price",
    readOnly: true,
}, {
    value: "availability",
    readOnly: true,
}, {
    value: "brand",
    readOnly: true,
}, {
    value: "category",
    readOnly: true,
}, {
    value: "description",
    readOnly: true,
}];

function parseBoolean(name, values) {
    if (values.get(name) === 'true') {
        values.delete(name);
        values.append(name, true);
    }

    if (!values.get(name) || values.get(name) === 'false') {
        values.delete(name);
        values.append(name, false);
    }
}

module.exports = {
    staticTags: staticTags,
    formatBytes: formatBytes,
    fileVersionValidationText: fileVersionValidationText,
    fileVersionValidationIcon: fileVersionValidationIcon,
    fileVersionConversionStatusText: fileVersionConversionStatusText,
    fileVersionConversionStatusIcon: fileVersionConversionStatusIcon,
    fileVersionStatusText: fileVersionStatusText,
    fileVersionStatusIcon: fileVersionStatusIcon,
    parseBoolean: parseBoolean,
    ConversionStatus: ConversionStatus,
    DataSetVersionStatus: DataSetVersionStatus,
}