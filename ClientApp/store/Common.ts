import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import ApiUtils from '../Utils/ApiUtils';
import * as fetchFunction from './FetchWithErrorHandling'

export interface CommonState {
    entityTypeProperties?: EntitytypeProperty[];
    entityProperties?: EntityProperty[];
    entityTypePropertyAdded?: boolean;
    entityTypePropertyDeleted?: boolean;
    entityTypePropertyEdited?: boolean;
    tooltips?: Tooltip[];
    tooltipsEdited?: boolean;
    userRoles: string[];
    location?: string;
}

export interface Tooltip {
    Id: number;
    Code: string;
    Name: string;
    Value: string;
}

export interface PropertyType {
    Id: number;
    Name: string;
}

export interface EntityProperty {
    Id: number;
    EntitytypeProperty: EntitytypeProperty;
    EntityId: number;
    Value: string;
}

export interface EntitytypeProperty {
    Id: number;
    Name: string;
    PropertyType: PropertyType;
    PropertyTypeId: number;
}

interface RequestEntityTypeProperty {
    type: 'REQUEST_ENTITY_TYPE_PROPERTY';
}

interface ReceiveEntityTypeProperty {
    type: 'RECEIVE_ENTITY_TYPE_PROPERTY';
    entityTypeProperties: EntitytypeProperty[];
}

interface RequestEntityProperty {
    type: 'REQUEST_ENTITY_PROPERTY';
}

interface ReceiveEntityProperty {
    type: 'RECEIVE_ENTITY_PROPERTY';
    entityProperties: EntityProperty[];
}

interface AddEntityTypePropertySuccessAction {
    type: 'ADD_ENTITY_TYPE_PROPERTY_SUCCESS';
    propertyAdded?: boolean;
}

interface AddEntityTypePropertyAction {
    type: 'ADD_ENTITY_TYPE_PROPERTY';
}

interface DeleteEntityTypePropertySuccessAction {
    type: 'DELETE_ENTITY_TYPE_PROPERTY_SUCCESS';
    propertyDeleted?: boolean;
}

interface DeleteEntityTypePropertyAction {
    type: 'DELETE_ENTITY_TYPE_PROPERTY';
}

interface EditEntityTypePropertySuccessAction {
    type: 'EDIT_ENTITY_TYPE_PROPERTY_SUCCESS';
    propertyEdited?: boolean;
}

interface EditEntityTypePropertyAction {
    type: 'EDIT_ENTITY_TYPE_PROPERTY';
}

interface RequestTooltipAction {
    type: 'REQUEST_TOOLTIP';
}

interface ReceiveTooltipAction {
    type: 'RECEIVE_TOOLTIP';
    tips: Tooltip[];
}

interface EditTooltipSuccessAction {
    type: 'EDIT_TOOLTIP_SUCCESS';
    tooltipEdited?: boolean;
}

interface EditTooltipAtion {
    type: 'EDIT_TOOLTIP';
}

interface GetRolesSuccessAction {
    type: 'RECEIVE_GETROLES_SUCCESS';
    roles?: string[];
}

interface GetRolesAction {
    type: 'RECEIVE_GETROLES';
}

interface RequestLocationAction {
    type: 'REQUEST_LOCATION';
}

interface ReceiveLocationAction {
    type: 'RECEIVE_LOCATION';
    location: string;
}

type KnownAction =
    ReceiveEntityTypeProperty
    | RequestEntityTypeProperty
    | RequestEntityProperty
    | ReceiveEntityProperty
    | AddEntityTypePropertySuccessAction
    | AddEntityTypePropertyAction
    | DeleteEntityTypePropertySuccessAction
    | DeleteEntityTypePropertyAction
    | EditEntityTypePropertySuccessAction
    | EditEntityTypePropertyAction
    | RequestTooltipAction
    | ReceiveTooltipAction
    | EditTooltipSuccessAction
    | EditTooltipAtion
    | GetRolesSuccessAction
    | GetRolesAction
    | RequestLocationAction
    | ReceiveLocationAction;


// ACTION CREATORS
export const actionCreators = {
    getEntityTypeProperties: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/GetEntityTypeProperties`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITY_TYPE_PROPERTY', entityTypeProperties: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY_TYPE_PROPERTY' });
    },
    getEntityProperties: (entityId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/GetEntityProperties`,
            {
                credentials: 'same-origin',
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(entityId)
            })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITY_PROPERTY', entityProperties: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY_PROPERTY' });
    },
    addEntityTypeProperty: (entity: EntitytypeProperty): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/AddEntityTypeProperty`,
            {
                credentials: 'same-origin',
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(entity)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'ADD_ENTITY_TYPE_PROPERTY_SUCCESS', propertyAdded: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_ENTITY_TYPE_PROPERTY' });
    },
    editEntityTypeProperty: (entity: EntitytypeProperty): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/UpdateEntityTypeProperty`,
            {
                credentials: 'same-origin',
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(entity)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'EDIT_ENTITY_TYPE_PROPERTY_SUCCESS', propertyEdited: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'EDIT_ENTITY_TYPE_PROPERTY' });
    },
    deleteEntityTypeProperty: (entity: EntitytypeProperty): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/DeleteEntityTypeProperty`,
            {
                credentials: 'same-origin',
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(entity)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'DELETE_ENTITY_TYPE_PROPERTY_SUCCESS', propertyDeleted: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_ENTITY_TYPE_PROPERTY' });
    },
    getTooltips: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/Dashboard/GetTooltips`,
            {
                credentials: 'same-origin'
            })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_TOOLTIP', tips: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_TOOLTIP' });
    },
    editTooltip: (entity: Tooltip): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ConfigAdmin/UpdateTooltip`,
            {
                credentials: 'same-origin',
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(entity)
            })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'EDIT_TOOLTIP_SUCCESS', tooltipEdited: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'EDIT_TOOLTIP' });
    },
    getUserRoles: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/MyInfo`,
            { credentials: 'same-origin' })
            .then(response => response.json())
            .then(data => {
                //sessionStorage.setItem('userRoles', data.Roles);
                dispatch({ type: 'RECEIVE_GETROLES_SUCCESS', roles: data.Roles });
            });
        addTask(fetchTask);
        dispatch({ type: 'RECEIVE_GETROLES' });

        //if (sessionStorage.getItem('userRoles') === null) {
        //    let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/MyInfo`,
        //            { credentials: 'same-origin' })
        //        .then(response => response.json())
        //        .then(data => {
        //            //sessionStorage.setItem('userRoles', data.Roles);
        //            dispatch({ type: 'RECEIVE_GETROLES_SUCCESS', roles: data.Roles });
        //        });
        //    addTask(fetchTask);
        //} else {
        //    dispatch({ type: 'RECEIVE_GETROLES_SUCCESS', roles: sessionStorage.getItem('userRoles').split(",") });
        //}
        //dispatch({ type: 'RECEIVE_GETROLES' });
    },
    getLocation: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/GetLocation`,
            {
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_LOCATION', location: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_LOCATION' });
    }
};

const unloadedState: CommonState = {
    userRoles:[]
};

export const reducer: Reducer<CommonState> = (state: CommonState, action: KnownAction) => {
    switch (action.type) {
        case 'RECEIVE_ENTITY_TYPE_PROPERTY':
            return {
                ...state,
                entityTypeProperties: action.entityTypeProperties
            };
        case 'REQUEST_ENTITY_TYPE_PROPERTY':
            return {
                ...state
            };
        case 'RECEIVE_ENTITY_PROPERTY':
            return {
                ...state,
                entityProperties: action.entityProperties
            };
        case 'REQUEST_ENTITY_PROPERTY':
            return {
                ...state
            };
        case 'ADD_ENTITY_TYPE_PROPERTY_SUCCESS':
            return {
                ...state,
                entityTypePropertyAdded: action.propertyAdded
            };
        case 'ADD_ENTITY_TYPE_PROPERTY':
            return {
                ...state
            };
        case 'DELETE_ENTITY_TYPE_PROPERTY_SUCCESS':
            return {
                ...state,
                entityTypePropertyDeleted: action.propertyDeleted
            };
        case 'DELETE_ENTITY_TYPE_PROPERTY':
            return {
                ...state
            };
        case 'EDIT_ENTITY_TYPE_PROPERTY_SUCCESS':
            return {
                ...state,
                entityTypePropertyEdited: action.propertyEdited
            };
        case 'EDIT_ENTITY_TYPE_PROPERTY':
            return {
                ...state
            };
        case 'RECEIVE_TOOLTIP':
            return {
                ...state,
                tooltips: action.tips
            };
        case 'REQUEST_TOOLTIP':
            return {
                ...state
            };
        case 'EDIT_TOOLTIP_SUCCESS':
            return {
                ...state,
                tooltipsEdited: action.tooltipEdited
            };
        case 'EDIT_TOOLTIP':
            return {
                ...state
            };
        case 'RECEIVE_GETROLES_SUCCESS':
            return {
                ...state,
                userRoles: action.roles
            };
        case 'RECEIVE_GETROLES':
            return {
                ...state
            };
        case 'RECEIVE_LOCATION':
            return {
                ...state,
                location: action.location
            };
        case 'REQUEST_LOCATION':
            return {
                ...state
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
