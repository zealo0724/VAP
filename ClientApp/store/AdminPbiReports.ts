import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as ReportStore from './Report';
import * as EntityStore from './Entity';
import * as pbi from 'powerbi-client';
import ApiUtils from '../Utils/ApiUtils';
import * as fetchFunction from './FetchWithErrorHandling'

export interface PBIReportsState {
    reports: PBIReport[];
    addedReport?: PBIReport;
    reportAdded?: boolean;
    reportDeleted?: boolean;
    pbiReportInused?: boolean;
    uploadPbiReportMessage?: string;
}

export interface PBIReport {
    CreatedDateUtc: string;
    DatasetId: string;
    DeletedDateUtc: string;
    ReportId: string;
    ReportName: string;
    Externaldata: boolean;
    IsPremium: boolean;
    IsEffectiveIdentityRolesRequired: boolean;
    IsEffectiveIdentityRequired: boolean;
    IsPagesHidden: boolean;
}


interface UploadReportAction {
    type: 'UPLOAD_REPORT';
}

interface UploadReportSucessAction {
    type: 'UPLOAD_REPORT_SUCCESS';
    uploadPbiReportResponse: any;
}

interface RequestReportsAction {
    type: 'REQUEST_REPORTS';
}

interface ReceiveReportsAction {
    type: 'RECEIVE_REPORTS';
    reports: PBIReport[];
}

interface DeleteReportAction {
    type: 'DELETE_REPORT';
}

interface DeleteReportSuccessAction {
    type: 'DELETE_REPORT_SUCCESS';
    reportDeleted: boolean;
}
interface CheckFileInuseAction {
    type: 'CHECK_FILE_INUSE';
}

interface CheckFileInuseSuccessAction {
    type: 'CHECK_FILE_INUSE_SUCCESS';
    pbiReportInused: boolean;
}

type KnownAction = UploadReportAction | UploadReportSucessAction | RequestReportsAction | ReceiveReportsAction | DeleteReportAction | DeleteReportSuccessAction | CheckFileInuseAction | CheckFileInuseSuccessAction;

// ACTION CREATORS
export const actionCreators = {
    uploadPbiReport: (form: any, reportName: string, connectionstring: string, isPagesHidden: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let formData = new FormData(form);
        let connectionStringString = connectionstring ? `&connectionString=${connectionstring}` : ``;
        let isPagesMenuHidden = isPagesHidden ? `&isPagesHidden=${isPagesHidden}` : ``;
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/AddPowerBiReport?reportName=${reportName}` + connectionStringString + isPagesMenuHidden, {
            credentials: 'same-origin',
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(response => {
                dispatch({
                    type: 'UPLOAD_REPORT_SUCCESS',
                    uploadPbiReportResponse: response
                });
            });
        addTask(fetchTask);
        dispatch({ type: 'UPLOAD_REPORT' });
    },

    getPbiReports: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/PowerBiReports`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_REPORTS', reports: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_REPORTS' });
    },
    deletePBIReport: (id: string, isPremium: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/DeletePowerBiReport${isPremium ? 'Premium' : 'Deprecated'}`,
            {
                credentials: 'same-origin',
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(id)
            })
            .then(response => {
                dispatch({ type: 'DELETE_REPORT_SUCCESS', reportDeleted: response.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_REPORT' });
    },
    checkFileInuse: (PBIReportId: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/CheckFileInuse?PBIReportId=` + PBIReportId, {
                credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'CHECK_FILE_INUSE_SUCCESS', pbiReportInused: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'CHECK_FILE_INUSE' });
    }
};


// Reducer
const unloadedState: PBIReportsState = { reports: [] };

export const reducer: Reducer<PBIReportsState> = (state: PBIReportsState, action: KnownAction) => {
    switch (action.type) {
        case 'UPLOAD_REPORT':
            return {
                reports: state.reports
            };
        case 'UPLOAD_REPORT_SUCCESS':
            // let newReports = [...state.reports, action.addedReport];
            let actionResponse = action.uploadPbiReportResponse;
            return {
                reports: state.reports,
                reportAdded: actionResponse.isSuccessfull,
                uploadPbiReportMessage: actionResponse.message
            } as PBIReportsState;
        case 'REQUEST_REPORTS':
            return {
                reports: state.reports
            };
        case 'RECEIVE_REPORTS':
            return {
                reports: action.reports
            };
        case 'DELETE_REPORT':
            return {
                reports: state.reports
            };
        case 'DELETE_REPORT_SUCCESS':
            return {
                reports: state.reports,
                reportDeleted: action.reportDeleted
            };
        case 'CHECK_FILE_INUSE':
            return {
                reports: state.reports
            };
        case 'CHECK_FILE_INUSE_SUCCESS':
            return{
                reports: state.reports,
                pbiReportInused: action.pbiReportInused
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
