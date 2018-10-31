export const getPageCookie = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return Number(c.substring(name.length, c.length));
        }
    }
    return 0;
}

export const localResource = {
    //RolesKey from Backend
    SystemAdmin: 'SystemAdmin',
    ReportAdmin: 'ReportAdmin',
    DataAdmin: 'DataAdmin',
    UserAdmin: 'UserAdmin',
    SuperTenantAdmin: 'SuperTenantAdmin',
    canBatchAddUsers: 'canBatchAddUsers',

    defaultPageSize: 10,
    defaultActivePage: 1,
    pageSize: {
        small: 10,
        mid: 20,
        big: 100
    },
    headIcon: {
        width: 128,
        height: 67
    },
    /*Buttons*/
    modalCancel: 'Cancel',
    modalSave: 'Save',
    modalDelete: 'Delete',
    pageSizeCookieName: 'PageSize',
    pbiReportCookieName: "pbiReportCookie",
    ReportConnectCookieName: "ReportConnectCookie",
    EntityCookieName: "EntityCookie",
    UserAccessCookieName: "UserAccessCookie",
    NoPermision: 'You do not have enough entitlement to view this page, please contact your System Admin.',
    propertyErrors: 'Not a avaliable value or you can not add a multiple parameter',
    userAlreadyExist: 'This user is already exist!',
    fileInuse: 'This file is connected to a report.',
    reportConnectInuse: 'This report is connected to one or more entities.',
    entityInuse: 'This entity is connected to one or more users.',
    PBIfileUnavaliable: ' Can not find a PBI File or the file is unavaliable',
    PBIfileNameUnavaliable: ' Name should not be null value',
    reflashRequest: 'You need refresh your page to see the changes',
    requiedFieldsMissing: 'Some required fields are missing',
    selectPicture: 'Select a picture',
    cropPicture: 'Please crop your picture',
    contactEmailWrong: 'Support Contact Email style is wrong',
    invoiceEmailWrong: 'Invoice Contact Email style is wrong',
    serviceOwnerWrong: 'Service Owner style is wrong',
    businessAreaRequired: 'BusinessArea can not been empty',
    pbiFileExtensionWarning:
    'Warning: The PBI file you will upload is incorrect, please select a .pbix file, or it will not work property',

    /*EntityConnect*/
    reportIsRequired: 'You need to select at least one report',
    entityNameIsRequired: 'Entity Name is required',
    entityTypeIsRequired: 'Entity Type is required',

    //ReportConnect
    filterRequired: 'We detect the report file you selected have at least one filter, but you did not provide them, please open your Reprt to check the parameter name and input it into PBI Filter Name input box.',
    titleRequired: 'Title can not be null',
    reportNameRequired: 'Report MenuName can not be null',
    noPremiumRport: 'It seems you have no Premium Report, please reupload your report',
    reportRequired: 'You need select a report',
    currentReportOld: [
        "This report cannot be selected. Microsoft will retire the Power BI version,you have to use the new Premium version.",
        "Please do the following:",
        "",
        "1. Select 'Manage Files' and upload your report again, then it will be stored in Power BI Premium. ",
        "2. Select 'Create Report' again and then select you new Power BI file in the dropdown list"
    ],
    isPagesHiddenToolTip: 'If you select Hide , that will hide the menu of your report, so that your can not switch the pages by menu, uless you have tabs or buttons can switch between them.'

    //Report View
    , emptyEntity: 'There is no reports connected to this entity. Please contact support for this service. You find the email in the footer'

    //User Connect
    , cannotFindUser: 'This user has no Veracity account. You could invite the user to become a Veracity user and then add him/her as a user.'
    , roleIsRequired: 'Please select a role for this user'
    , entityIsRequired: 'Please select one or more entities for this user'
}

export const optionType = {
    updateTenant: {
        iconUpdate: 'iconUpdate',
        iconAdd: 'iconAdd',
        tenantPropertyUpdate: 'tenantPropertyUpdate'
    },
    superAdminUpdateTenant: {
        updateTenant: 'updateTenant'
    },
    updateFooter: {
        update: 'update'
    }
}

export const getDefaultOrCookiePageSize = (cookieName) => {
    return getPageCookie(cookieName + localResource.pageSizeCookieName) > 0
        ? getPageCookie(cookieName + localResource.pageSizeCookieName) : localResource.defaultPageSize;
}

export const saveCookiePageSize = (cookieName, value) => {
    return document.cookie = cookieName + localResource.pageSizeCookieName + "=" + value;
}

export const commonFunctions = {
    getCommonTooltip(elementId, stateTooltips) {
        if (stateTooltips !== null && stateTooltips !== undefined && stateTooltips.length > 0) {
            let result = stateTooltips.filter(k => k.Code == elementId);
            if (result !== undefined && result[0] !== undefined)
                return result[0].Value;
        }
        return '';
    }
}

export const getCustomTitleStyle = (showEntityName,entityName, showReportName, reportName, showTabName, tabName) => {
    let result = (showEntityName ? entityName : '');
    result += ((result.length > 0 && showReportName) ? ' - ' : '') + (showReportName ? reportName : '');
    result += ((result.length > 0 && showTabName) ? ' - ' : '') + (showTabName ? tabName : '');
    return result;
}
