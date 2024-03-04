document.addEventListener('DOMContentLoaded', (e) => {
    const classes = {
        visuallyHidden: 'visually-hidden',
    };

    const fetchGetHeaders = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'GET',
    };

    const fetchPostHeaders = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        method: 'POST',
    }

    const registerForm = document.querySelectorAll('#register-form');
    const settingsForm = document.querySelectorAll('#settingsForm');
    const checkboxes = document.querySelectorAll('.form-check-input');
    const productCatalogSettingsForm = document.getElementById('productCatalogSettingsForm')
    const testConnectionButton = document.getElementById('testConnectionButton');
    const productCatalogSyncButton = document.getElementById('productCatalogSyncButton');
    const productCatalogSyncButtonIcon = document.getElementById('product-catalog-sync-loading');
    const input = document.querySelector('input[name=Fields]');
    const refreshButton = document.getElementById('refreshSuggestionList');
    const refreshButtonIcon = document.getElementById('refresh-loading');
    const fileVersionsTable = document.getElementById('fileVersionsTable');
    const lastRefresh = document.getElementById('lastRefresh');
    const prefixboxSearch = document.getElementById('prefixboxSearch');
    const prefixboxConnectSearchButton = document.getElementById('prefixboxConnectSearchButton');
    const prefixboxConnectSearchButtonIcon = document.getElementById('enable-search-loading');
    const productCatalogContainer = document.getElementById('productCatalog');
    const fileTableContainer = document.getElementById('file-table');
    const apiKeyInput = document.getElementById('ApiKey');
    const apiKeyButton = document.getElementById('api-key-button');
    const registerLoadingButton = document.getElementById('register-loading');

    const { 
        staticTags, 
        formatBytes, 
        fileVersionValidationText,
        fileVersionValidationIcon,
        fileVersionConversionStatusText,
        fileVersionConversionStatusIcon,
        fileVersionStatusText,
        fileVersionStatusIcon,
        parseBoolean,
    } = PrefixboxSalesforceLibrary;

    const tags = new Tagify(input, {
        originalInputValueFormat: (valuesArr) => valuesArr.filter((x) => x.readOnly !== true).map(y => y.value).join(','),
        enforceWhitelist: false,
        whitelist: [...staticTags, 'color', 'size', 'rating', 'variants', 'longDescription'],
    });

    tags.addTags(staticTags);

    function showHideAlert(data, successBarId, errorBarId, customMessage = false) {
        if (data.success) {
            const successBar = document.getElementById(successBarId);

            successBar.classList.add('show');
            successBar.classList.remove('disabled');
            window.setTimeout(() => {
                successBar.classList.remove('show');
            }, 5000);

        } else {
            const errorBar = document.getElementById(errorBarId);

            if (customMessage) {
                errorBar.innerHTML = data.message;
            }

            errorBar.classList.add('show');
            window.setTimeout(() => {
                errorBar.classList.remove('show');
            }, 5000);
        }
    }

    async function getSuggestionListWithFileVersions() {
        if (fileVersionsTable) {
            fileVersionsTable.innerHTML = '<div class="m-2 w-full flex align-items-center justify-content-center">Loading...</div>';
        }
        
        refreshButtonIcon.classList.remove(classes.visuallyHidden);

        if (prefixboxConnectSearchButton) {
            prefixboxConnectSearchButton.disabled = true;
        }

        const suggestionResponse = await fetch('Prefixbox-GetSuggestionList', fetchGetHeaders);
        const suggestionListResult = await suggestionResponse.json();
        const { suggestionList } = suggestionListResult;

        if (suggestionListResult.success && suggestionList) {
            const fileVersionsResponse = await fetch(`Prefixbox-GetFileVersions?tracker=${suggestionList.dataSetTracker}`, fetchGetHeaders);
            const fileVersionsResult = await fileVersionsResponse.json();
            const { fileVersions } = fileVersionsResult;

            if (fileVersionsResult.success) {
                const selectFileVersions = fileVersions.filter((x) => x.numberOfSuggestions > 0);

                if (selectFileVersions.length > 0) {
                    if (prefixboxSearch) {
                        prefixboxSearch.classList.remove(classes.visuallyHidden);
                    }

                    if (fileTableContainer) {
                        fileTableContainer.classList.remove(classes.visuallyHidden);
                    }

                    if (prefixboxConnectSearchButton) {
                        prefixboxConnectSearchButton.disabled = false;
                    }
                } else {
                    if (prefixboxConnectSearchButton) {
                        prefixboxConnectSearchButton.disabled = false;
                    }
                }

                updateTable(fileVersions);

                if (lastRefresh) {
                    lastRefresh.innerHTML = '<i>Last refreshed at: ' + new Date().toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"}) + '</i>';
                }
            }
        }

        refreshButtonIcon.classList.add(classes.visuallyHidden);

        if (productCatalogSyncButtonIcon) {
            productCatalogSyncButtonIcon.classList.add(classes.visuallyHidden);
        }
    }

    function updateTable(fileVersions) {
        const renderTable = fileVersions.map((fv) => {
            var isValid = fileVersionValidationText(fv.isValid);
            var isValidIcon = fileVersionValidationIcon(fv.isValid);
            var fileStatusText = fileVersionConversionStatusText(fv.conversionStatus);
            var conversionIcon = fileVersionConversionStatusIcon(fv.conversionStatus);
            var versionText = fileVersionStatusText(fv.status);
            var versionIcon = fileVersionStatusIcon(fv.status);

            return (
                `<tr>
                    <td>${isValidIcon} ${isValid}</td>
                    <td>${conversionIcon} ${fileStatusText}</td>
                    <td>${versionIcon} ${versionText}</td>
                    <td>${fv.version}</td>
                    <td>${fv.numberOfSuggestions}</td>
                    <td>${formatBytes(fv.rawFileSize)}</td>
                </tr>`
            );
        })
        .join('');

        if (fileVersionsTable) {
            fileVersionsTable.innerHTML = renderTable;
        }
    }

    apiKeyButton.addEventListener('click', async (e) => {
        e.preventDefault();

        var state = apiKeyButton.getAttribute('data-state'); 

        if (state === 'hidden') {
            apiKeyButton.setAttribute('data-state', 'visible'); 
            apiKeyButton.innerHTML = '<i class="ri-eye-off-line"></i>';
            apiKeyInput.setAttribute('type', 'text');
        } else {
            apiKeyButton.setAttribute('data-state', 'hidden'); 
            apiKeyButton.innerHTML = '<i class="ri-eye-line"></i>';
            apiKeyInput.setAttribute('type', 'password');
        }
    });

    testConnectionButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const response = await fetch('Prefixbox-TestConnection', fetchPostHeaders);
        const data = await response.json();

        showHideAlert(data, 'successfulConnection', 'errorInConnection');
    });

    Array.prototype.slice.call(settingsForm).forEach(function (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();
    
            if (!form.checkValidity()) {
                event.stopPropagation()
            }

            const values = new FormData(event.target);
            const entries = Object.fromEntries(values.entries());
            const response = await fetch('Prefixbox-Save', {
                ...fetchPostHeaders,
                body: JSON.stringify({
                    settings: entries,
                })
            });

            const data = await response.json();
            showHideAlert(data, 'saveChangesAlert', 'notSavedChangesAlert');

            productCatalogContainer.classList.remove(classes.visuallyHidden);

            form.classList.add('was-validated');
        }, false);
    });

    Array.prototype.slice.call(registerForm).forEach(function (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('is-invalid');
            }

            registerLoadingButton.classList.remove(classes.visuallyHidden);
    
            const values = new FormData(event.target);
            const entries = Object.fromEntries(values.entries());

            const response = await fetch('Prefixbox-Register', {
                ...fetchPostHeaders,
                body: JSON.stringify({
                    account: entries,
                })
            });
    
            const data = await response.json();
            showHideAlert(data, 'successfulRegister', 'errorInRegister', true);

            if (data.success) {
                document.getElementById("create-nav").remove();
                form.remove();
            }

            registerLoadingButton.classList.add(classes.visuallyHidden);
    
            form.classList.add('was-validated');
        }, false);
    });

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (c) => {
            if (c.target.checked) {
                c.target.value = true;
            } else {
                c.target.value = false;
            }
        });
    });

    productCatalogSyncButton.addEventListener('click', async (event)  => {
        productCatalogSyncButton.disabled = true;

        if (productCatalogSyncButtonIcon) {
            productCatalogSyncButtonIcon.classList.remove(classes.visuallyHidden);
        }

        event.preventDefault();

        const response = await fetch('Prefixbox-ProductCatalogSync', fetchPostHeaders);
        const data = await response.json();

        if (data.success) {
            await getSuggestionListWithFileVersions();
        } else {
            productCatalogSyncButton.disabled = false;
            productCatalogSyncButtonIcon.classList.add(classes.visuallyHidden);
        }

        showHideAlert(data, 'successfulProductCatalogSync', 'errorInProductCatalogSync');
    });

    refreshButton.addEventListener('click', async ()  => {
        await getSuggestionListWithFileVersions();
    });

    productCatalogSettingsForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const values = new FormData(event.target);
        parseBoolean('ProductVariantExport', values);

        const entries = Object.fromEntries(values.entries());
        const response = await fetch('Prefixbox-Save', {
            ...fetchPostHeaders,
            body: JSON.stringify({
                settings: entries,
            })
        });

        const data = await response.json();

        showHideAlert(data, 'saveChangesAlert', 'notSavedChangesAlert');
    }, false);

    if (prefixboxConnectSearchButton) {
        prefixboxConnectSearchButton.addEventListener('click', async (event)  => {
            prefixboxConnectSearchButton.disabled = true;

            if (prefixboxConnectSearchButtonIcon) {
                prefixboxConnectSearchButtonIcon.classList.remove(classes.visuallyHidden);
            }

            event.preventDefault();
    
            const response = await fetch('Prefixbox-ConnectSearch', fetchPostHeaders);
            const data = await response.json();
    
            if (!data.success) {
                prefixboxConnectSearchButton.disabled = false;

                if (prefixboxConnectSearchButtonIcon) {
                    prefixboxConnectSearchButtonIcon.classList.add(classes.visuallyHidden);
                }
            } else {
                var text = prefixboxConnectSearchButton.getAttribute("data-connected-text");
                prefixboxConnectSearchButton.innerText = text;
            }
    
            showHideAlert(data, 'successfulSearchEnabled', 'errorInSearchEnable');
        });
    }

    getSuggestionListWithFileVersions();
});