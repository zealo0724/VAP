import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

export interface MyDnvGlUserState {
    myDnvGlUser?: any;

}

interface RequestMyDnvGlUserAction {
    type: 'REQUEST_MYDNVGL_USER';
}

interface ReceiveMyDnvGlUserAction {
    type: 'RECEIVE_MYDNVGL_USER';
    myDnvGlUser: any;
}




type KnownAction = RequestMyDnvGlUserAction | ReceiveMyDnvGlUserAction;

// ACTION CREATORS
export const actionCreators = {
    requestMyDnvGlUser: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Home/Name`, { credentials: 'same-origin' })
        .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_MYDNVGL_USER', myDnvGlUser: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_MYDNVGL_USER' });
    }
};

// Reducer
const unloadedState: MyDnvGlUserState = { myDnvGlUser: {} };

export const reducer: Reducer<MyDnvGlUserState> = (state: MyDnvGlUserState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_MYDNVGL_USER':
            return {
                myDnvGlUser: state.myDnvGlUser
            };
        case 'RECEIVE_MYDNVGL_USER':
            return {
                myDnvGlUser: action.myDnvGlUser
            };

        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
