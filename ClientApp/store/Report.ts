import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as pbi from 'powerbi-client';
import * as EntityStore from './Entity';

export interface ReportState {
    Id: string;
    report?: pbi.Report;
    // reportType?: string;
    // accessToken?: string;
    // embedUrl?: string;
    // pageName?: string;
    // filters?: pbi.models.IFilter[];
    // filterPaneEnabled?: boolean;
    // navContentPaneEnabled?: boolean;
    // onEmbedded?: (embed: pbi.Embed) => any;
    requestReport?: any;
    pages?: any[];

}

interface RequestPagesAction {
    type: 'REQUEST_PAGES';
}

interface ReceivePagesAction {
    type: 'RECEIVE_PAGES';
    pages: any[];
}




type KnownAction = ReceivePagesAction | RequestPagesAction;

// ACTION CREATORS
export const actionCreators = {
    requestPages: (report: pbi.Report): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let task = report.getPages()
            .then(pages => {
                dispatch({ type: 'RECEIVE_PAGES', pages: pages });
            });
        addTask(task);
        dispatch({ type: 'REQUEST_PAGES' });
    }
};

// Reducer
const unloadedState: ReportState = { Id: '', pages: [] };

export const reducer: Reducer<ReportState> = (state: ReportState, action: KnownAction) => {
    switch (action.type) {
        case 'RECEIVE_PAGES':
            return {
                Id: state.Id,
                report: state.report,
                pages: action.pages
            };
        case 'REQUEST_PAGES':
            return {
                Id: state.Id,
                report: state.report,
                pages: state.pages
            };
        
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
