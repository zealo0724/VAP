import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as AdminPbiReportsStore from './AdminPbiReports';
import * as AdminConfigStore from './AdminConfig';
import * as pbi from 'powerbi-client';
import * as fetchFunction from './FetchWithErrorHandling'

export interface ReportConnectState {
    reports: AdminReport[];
    pbiFiles: AdminPbiReportsStore.PBIReport[];
    reportUpdated?: boolean;
    reportAdded?: boolean;
    reportDeleted?: boolean;
    pbiReportConnectInused?: boolean;
}

export interface AdminReport {
    Id: number;
    MenuName: string;
    Title: string;
    Description: string;
    PowerBiReportId: string;
    IsShown: boolean;
    EntityFilter: string;
    EntityTypePropertyId: number;
    IsEffectiveIdentityRequired: boolean;
    IsEffectiveIdentityRolesRequired: boolean;
    HideCustomTitle: boolean;
    ShowEntityName: boolean;
    ShowReportName: boolean;
    ShowPageName: boolean;
}

interface RequestReportsAction {
    type: 'REQUEST_REPORTS';
}

interface ReceiveReportsAction {
    type: 'RECEIVE_REPORTS';
    reports: AdminReport[];
}

interface RequestPbiFilesAction {
    type: 'REQUEST_PBI_FILES';
}

interface ReceivePbiFilesAction {
    type: 'RECEIVE_PBI_FILES';
    pbiFiles: AdminPbiReportsStore.PBIReport[];
}

interface UpdateReportAction {
    type: 'UPDATE_REPORT';
}

interface UpdateReportSuccessAction {
    type: 'UPDATE_REPORT_SUCCESS';
    reportUpdated?: boolean;
}

interface DeleteReportSuccessAction {
    type: 'DELETE_REPORT_SUCCESS';
    reportDeleted?: boolean;
}

interface DeleteReportAction {
    type: 'DELETE_REPORT';
}

interface CreateReportAction {
    type: 'CREATE_REPORT';
}

interface CreateReportSuccessAction {
    type: 'CREATE_REPORT_SUCCESS';
    reportAdded?: boolean;
}

interface CheckReportConnectInuseAction {
    type: 'CHECK_REPORTCONNECT_INUSE';
}

interface CheckReportConnectInuseSuccessAction {
    type: 'CHECK_REPORTCONNECT_INUSE_SUCCESS';
    pbiReportConnectInused: boolean;
}

type KnownAction = RequestReportsAction
    | ReceiveReportsAction
    | RequestPbiFilesAction
    | ReceivePbiFilesAction
    | UpdateReportAction
    | UpdateReportSuccessAction
    | DeleteReportSuccessAction
    | DeleteReportAction
    | CreateReportAction
    | CreateReportSuccessAction
    | CheckReportConnectInuseAction
    | CheckReportConnectInuseSuccessAction;


// ACTION CREATORS
export const actionCreators = {
    getReports: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/Reports`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(
            data => {
                dispatch({ type: 'RECEIVE_REPORTS', reports: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_REPORTS' });
    }, 
    getPbiFiles: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/PowerBiReports`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_PBI_FILES', pbiFiles: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_PBI_FILES' });
    },
    updateReport: (report: AdminReport): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/UpdateReport`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(report)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({
                    type: 'UPDATE_REPORT_SUCCESS', reportUpdated: data === true
                });
            });

        addTask(fetchTask);
        dispatch({ type: 'UPDATE_REPORT' });
    },

    deleteReport: (reportId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/DeleteReport`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(reportId)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({
                    type: 'DELETE_REPORT_SUCCESS', reportDeleted: data === true
                });
            });

        addTask(fetchTask);
        dispatch({ type: 'DELETE_REPORT' });
    },

    addReport: (report: AdminReport): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/AddReport`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(report)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({
                    type: 'CREATE_REPORT_SUCCESS', reportAdded: data === true
                });
            });
        addTask(fetchTask);
        dispatch({ type: 'CREATE_REPORT' });
    },
    checkReportConnectInuse: (ReportConnectId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/CheckReportConnectInuse?ReportConnectId=` + ReportConnectId, {
                credentials: 'same-origin'
            })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'CHECK_REPORTCONNECT_INUSE_SUCCESS', pbiReportConnectInused: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'CHECK_REPORTCONNECT_INUSE' });
    }
};


// Reducer
const unloadedState: ReportConnectState = { reports: [], pbiFiles: [] };

export const reducer: Reducer<ReportConnectState> = (state: ReportConnectState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_REPORTS':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles
            };
        case 'RECEIVE_REPORTS':
            return {
                reports: action.reports,
                pbiFiles: state.pbiFiles
            };
        case 'REQUEST_PBI_FILES':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles
            };
        case 'RECEIVE_PBI_FILES':
            return {
                reports: state.reports,
                pbiFiles: action.pbiFiles
            };
        case 'UPDATE_REPORT':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles
            };
        case 'UPDATE_REPORT_SUCCESS':
            //let otherReports = state.reports.filter(function (obj) {
            //    return obj.Id !== action.updatedReport.Id;
            //});
            //let updatedReports = [...otherReports, action.updatedReport];
            return {
                reports: state.reports,//updatedReports,
                pbiFiles: state.pbiFiles,
                reportUpdated: action.reportUpdated
            };
        case 'DELETE_REPORT_SUCCESS':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles,
                reportDeleted: action.reportDeleted
            };
        case 'DELETE_REPORT':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles
            };
        case 'CREATE_REPORT':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles
            };
        case 'CREATE_REPORT_SUCCESS':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles,
                reportAdded: action.reportAdded
            };
        case 'CHECK_REPORTCONNECT_INUSE':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles,
            };
        case 'CHECK_REPORTCONNECT_INUSE_SUCCESS':
            return {
                reports: state.reports,
                pbiFiles: state.pbiFiles,
                pbiReportConnectInused: action.pbiReportConnectInused
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
