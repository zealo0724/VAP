import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as ReportStore from './Report';
import * as EntityStore from './Entity';
import * as pbi from 'powerbi-client';

export interface ReportsState {
    reports: ReportStore.ReportState[];
    entity?: EntityStore.Entity;
    match?: any;
    pbiReport?: pbi.Report;
    RequestDone?: boolean;
}


interface RequestEntityAction {
    type: 'REQUEST_ENTITY';
}

interface ReceiveEntityAction {
    type: 'RECEIVE_ENTITY';
    entity: EntityStore.Entity;
    RequestDone: boolean;
}

interface RequestReportAction {
    type: 'REQUEST_REPORT';
}

interface ReceiveReportAction {
    type: 'RECEIVE_REPORT';
    pbiReport: pbi.Report;
}


type KnownAction = RequestEntityAction | ReceiveEntityAction | RequestReportAction | ReceiveReportAction;


// ACTION CREATORS
export const actionCreators = {
    //requestReport: (id: number, powerBiFilter: string, powerBiRole: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    //    let optional = ((powerBiFilter === '' || powerBiFilter === null || powerBiRole === '' || powerBiRole === null)
    //        ? '' : '&powerBiFilter=' + powerBiFilter + '&powerBiRole=' + powerBiRole);
    //    let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/GetPBIReportViewModel?reportId=${id}` + optional, { credentials: 'same-origin' })
    //        .then(response => response.json())
    //        .then(data => {
    //            dispatch({ type: 'RECEIVE_REPORT', pbiReport: data });
    //        });
    //    addTask(fetchTask);
    //    dispatch({ type: 'REQUEST_REPORT' });
    //},
    requestReport: (id: number, entityTreeId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let optional = (entityTreeId === 0 || entityTreeId === null) ? '' : '&entityTreeId=' + entityTreeId;
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/GetPBIReportViewModel?reportId=${id}` + optional, { credentials: 'same-origin' })
            //try to catch 500 errors
            //.then(response => {
            //    if (response.ok) {
            //        return response.json();
            //    } else {
            //        dispatch({ type: 'RECEIVE_REPORT', pbiReport: null });
            //        return;
            //    }
            //})
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_REPORT', pbiReport: data });
            });
            //.catch(response => {
            //    dispatch({ type: 'RECEIVE_REPORT', pbiReport: null });
            //});
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_REPORT' });
    },
    requestEntity: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/Entity?id=${id}`, { credentials: 'same-origin' })
            .then(response => response.json() as EntityStore.Entity)
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITY', entity: data, RequestDone: true});
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY' });
    }
};


// Reducer
const unloadedState: ReportsState = { reports: [], entity: null, pbiReport: null };

export const reducer: Reducer<ReportsState> = (state: ReportsState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_ENTITY':
            return {
                reports: state.reports,
                entity: state.entity,
                pbiReport: state.pbiReport,
                RequestDone: false
            };
        case 'RECEIVE_ENTITY':
            return {
                reports: state.reports,
                entity: action.entity,
                RequestDone: action.RequestDone,
                pbiReport: state.pbiReport
            };
            case 'REQUEST_REPORT':
            return {
                reports: state.reports,
                entity: state.entity,
                pbiReport: state.pbiReport,
                RequestDone: false
            };
        case 'RECEIVE_REPORT':
            return {
                reports: state.reports,
                entity: state.entity,
                pbiReport: action.pbiReport,
                RequestDone: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
