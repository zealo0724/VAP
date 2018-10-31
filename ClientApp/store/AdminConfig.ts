import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import ApiUtils from '../Utils/ApiUtils';
import * as fetchFunction from './FetchWithErrorHandling'

export interface AdminConfigState {
    entityTypes: EntityType[];
    typeAdded?: boolean;
    propertyTypes: PropertyType[];
    businessAreas: BusinessArea[];
    baOprationSuccessfull?: boolean;
    footer: Footer[];
    updateFootSuccess?: boolean;
}

export interface EntityType {
    Id: number;
    Name: string;
}

export interface PropertyType {
    Id: number;
    Name: string;
}

export interface BusinessArea {
    Id: number;
    Name: string;
}

 export interface EntitytypeProperty {
     Id: number;
     Name: string;
     PropertyType: PropertyType;
     PropertyTypeId: number;
}

export interface Footer {
    Id: number;
    FootHeader: string;
    ContactEmail: string;
    TenantInfo: string;
    TenantInfoURL: string;
    CopyRight: string;
}


interface RequestEntityTypesAction {
    type: 'REQUEST_ENTITY_TYPES';
}

interface ReceiveEntityTypesAction {
    type: 'RECEIVE_ENTITY_TYPES';
    entityTypes: any[];
}

interface AddEntityTypeAction {
    type: 'ADD_ENTITY_TYPE';
}

interface AddEntityTypeSuccessAction {
    type: 'ADD_ENTITY_TYPE_SUCCESS';
    typeAdded?: boolean;
}

interface RequestPropertyTypes {
    type: 'REQUEST_PROPERTY_TYPES';
}

interface ReceivePropertyTypes {
    type: 'RECEIVE_PROPERTY_TYPES';
    propertyTypes: PropertyType[];
}

interface ReceiveBusinessAreas {
    type: 'RECEIVE_BUSINESSAREAS';
    BusinessAreas: BusinessArea[];
}

interface RequestBusinessAreas {
    type: 'REQUEST_BUSINESSAREAS';
}

interface AddBusinessAreaSuccess {
    type: 'ADD_BUSINESSAREA_SUCCESS';
    baOprationSuccessfull?: boolean;
}

interface AddBusinessAreaAction {
    type: 'ADD_BUSINESSAREA';
}

interface UpdateBusinessAreaSuccess {
    type: 'UPDATE_BUSINESSAREA_SUCCESS';
    baOprationSuccessfull?: boolean;
}

interface UpdateBusinessAreaAction {
    type: 'UPDATE_BUSINESSAREA';
}

interface DeleteBusinessAreaSuccessAction {
    type: 'DELETE_BUSINESSAREA_SUCCESS';
    baOprationSuccessfull?: boolean;
}

interface DeleteBusinessAreaAction {
    type: 'DELETE_BUSINESSAREA';
}

interface UpdateFooterAction {
    type: 'UPDATE_FOOTER';
}

interface UpdateFooterSuccessAction {
    type: 'UPDATE_FOOTER_SUCCESS';
    updateFootSuccess?: boolean;
}

interface ReceiveFooterAction {
    type: 'RECEIVE_FOOTER';
    footer: Footer[];
}

interface RequestFooterAction {
    type: 'REQUEST_FOOTER';
}

type KnownAction =
    RequestEntityTypesAction
    | ReceiveEntityTypesAction
    | AddEntityTypeAction
    | AddEntityTypeSuccessAction
    | RequestPropertyTypes
    | ReceivePropertyTypes
    | ReceiveBusinessAreas
    | RequestBusinessAreas
    | AddBusinessAreaSuccess
    | AddBusinessAreaAction
    | UpdateBusinessAreaSuccess
    | UpdateBusinessAreaAction
    | DeleteBusinessAreaSuccessAction
    | DeleteBusinessAreaAction
    | UpdateFooterSuccessAction
    | UpdateFooterAction
    | ReceiveFooterAction
    | RequestFooterAction;


// ACTION CREATORS
export const actionCreators = {
    getEntityTypes: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/GetEntityTypes`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITY_TYPES', entityTypes: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY_TYPES' });
    },
    getPropertyTypes: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/GetPropertyTypes`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_PROPERTY_TYPES', propertyTypes: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_PROPERTY_TYPES' });
    },
    addType: (name: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/AddEntityType?name=${name}`,
            {
                credentials: 'same-origin', method: 'POST'
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'ADD_ENTITY_TYPE_SUCCESS', typeAdded: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_ENTITY_TYPE' });
    },
    getBusinessAreas: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/GetBusinessAreas`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_BUSINESSAREAS', BusinessAreas: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_BUSINESSAREAS' });
    },
    addBusinessArea: (area: BusinessArea): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/AddBusinessArea`,
            {
                credentials: 'same-origin'
                , method: 'POST'
                ,headers: { 'Content-type': 'application/json' }
                , body: JSON.stringify(area)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'ADD_BUSINESSAREA_SUCCESS', baOprationSuccessfull: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_BUSINESSAREA' });
    },
    updateBusinessArea: (area: BusinessArea): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/UpdateBusinessArea`,
            {
                credentials: 'same-origin'
                , method: 'POST'
                , headers: { 'Content-type': 'application/json' }
                , body: JSON.stringify(area)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'UPDATE_BUSINESSAREA_SUCCESS', baOprationSuccessfull: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'UPDATE_BUSINESSAREA' });
    },
    deleteBusinessArea: (area: BusinessArea): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/DeleteBusinessArea`,
            {
                credentials: 'same-origin', method: 'POST'
                , headers: { 'Content-type': 'application/json' }
                , body: JSON.stringify(area)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'DELETE_BUSINESSAREA_SUCCESS', baOprationSuccessfull: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_BUSINESSAREA' });
    },
    updateFoot: (foot: Footer): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/UpdateFooterInfo`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(foot)
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'UPDATE_FOOTER_SUCCESS', updateFootSuccess: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'UPDATE_FOOTER' });
    },
    getFoot: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/GetFooter`, {
            credentials: 'same-origin',
            method: 'GET',
            headers: { 'Content-type': 'application/json' }
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_FOOTER', footer: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_FOOTER' });
    },
};


// Reducer
const unloadedState: AdminConfigState = { entityTypes: [], propertyTypes: [], businessAreas: [], footer: null };

export const reducer: Reducer<AdminConfigState> = (state: AdminConfigState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_ENTITY_TYPES':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'RECEIVE_ENTITY_TYPES':
            return {
                entityTypes: action.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'ADD_ENTITY_TYPE':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'ADD_ENTITY_TYPE_SUCCESS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                typeAdded: action.typeAdded,
                footer: state.footer
            } as AdminConfigState;
        case 'RECEIVE_PROPERTY_TYPES':
            return {
                entityTypes: state.entityTypes,
                businessAreas: state.businessAreas,
                propertyTypes: action.propertyTypes,
                footer: state.footer
            };
        case 'REQUEST_PROPERTY_TYPES':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'RECEIVE_BUSINESSAREAS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: action.BusinessAreas,
                footer: state.footer
            };
        case 'REQUEST_BUSINESSAREAS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'ADD_BUSINESSAREA_SUCCESS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                baOprationSuccessfull: action.baOprationSuccessfull,
                footer: state.footer
            };
        case 'ADD_BUSINESSAREA':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'UPDATE_BUSINESSAREA_SUCCESS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                baOprationSuccessfull: action.baOprationSuccessfull,
                footer: state.footer
            };
        case 'UPDATE_BUSINESSAREA':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'DELETE_BUSINESSAREA_SUCCESS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                baOprationSuccessfull: action.baOprationSuccessfull,
                footer: state.footer
            };
        case 'DELETE_BUSINESSAREA':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'UPDATE_FOOTER_SUCCESS':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                updateFootSuccess: action.updateFootSuccess,
                footer: state.footer
            };
        case 'UPDATE_FOOTER':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        case 'RECEIVE_FOOTER':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: action.footer
            };
        case 'REQUEST_FOOTER':
            return {
                entityTypes: state.entityTypes,
                propertyTypes: state.propertyTypes,
                businessAreas: state.businessAreas,
                footer: state.footer
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
