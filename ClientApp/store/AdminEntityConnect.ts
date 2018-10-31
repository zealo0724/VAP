import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction, AppThunkAction as IAppThunkAction } from './';
import * as pbi from 'powerbi-client';
import * as EntityStore from './Entity';
import * as AdminReportConnectStore from './AdminReportConnect';
//import * as CommonStore from './Common'
import * as fetchFunction from './FetchWithErrorHandling'

export interface EntityConnectState {
    entities: EntityStore.Entity[];
    reports: AdminReportConnectStore.AdminReport[];
    entityTypes: any[];
    entityDeleted?: boolean;
    entityUpdated?: boolean;
    entityInused?: boolean;
    entityAdded?: boolean;
}

interface RequestEntitiesAction {
    type: 'REQUEST_ENTITIES';
}

interface ReceiveEntitiesAction {
    type: 'RECEIVE_ENTITIES';
    entities: EntityStore.Entity[];
}

interface RequestReportsAction {
    type: 'REQUEST_REPORTS';
}

interface ReceiveReportsAction {
    type: 'RECEIVE_REPORTS';
    reports: AdminReportConnectStore.AdminReport[];
}

interface UpdateEntityAction {
    type: 'UPDATE_ENTITY';
}

interface UpdateEntitySuccessAction {
    type: 'UPDATE_ENTITY_SUCCESS';
    entityUpdated: boolean;
}

interface DeleteEntitySuccessAction {
    type: 'DELETE_ENTITY_SUCCESS';
    entityDeleted: boolean;
}

interface DeleteEntityAction {
    type: 'DELETE_ENTITY';
}

interface AddEntityAction {
    type: 'ADD_ENTITY';
}

interface AddEntitySuccessAction {
    type: 'ADD_ENTITY_SUCCESS';
    addedEntity: EntityStore.Entity;
    entityAdded: boolean;
}

interface RequestEntityTypesAction {
    type: 'REQUEST_ENTITY_TYPES';
}

interface ReceiveEntityTypesAction {
    type: 'RECEIVE_ENTITY_TYPES';
    entityTypes: any[];
}

interface CheckEntityInuseAction {
    type: 'CHECK_ENTITY_INUSE';
}

interface CheckEntityInuseSuccessAction {
    type: 'CHECK_ENTITY_INUSE_SUCCESS';
    entityInused: boolean;
}

type KnownAction = RequestEntitiesAction
    | ReceiveEntitiesAction
    | RequestReportsAction
    | ReceiveReportsAction
    | UpdateEntityAction
    | UpdateEntitySuccessAction
    | AddEntityAction
    | AddEntitySuccessAction
    | DeleteEntitySuccessAction
    | DeleteEntityAction
    | RequestEntityTypesAction
    | ReceiveEntityTypesAction
    | CheckEntityInuseSuccessAction
    | CheckEntityInuseAction;


// ACTION CREATORS
export const actionCreators = {
    getEntities: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/Entities`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITIES', entities: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITIES' });
    },
    getReports: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/ReportAdmin/Reports`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_REPORTS', reports: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_REPORTS' });
    },
    updateEntity: (entity: EntityStore.Entity): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/UpdateEntity`, {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(entity)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'UPDATE_ENTITY_SUCCESS', entityUpdated: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'UPDATE_ENTITY' });
    },
    deleteEntity: (entity: EntityStore.Entity): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/DeleteEntity`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(entity)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'DELETE_ENTITY_SUCCESS', entityDeleted: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_ENTITY' });
    },
    addEntity: (entity: EntityStore.Entity): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/AddEntity`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(entity)
        })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'ADD_ENTITY_SUCCESS', addedEntity: data, entityAdded: true });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_ENTITY' });
    },
    getEntityTypes: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/GetEntityTypes`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITY_TYPES', entityTypes: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY_TYPES' });
    },
    checkEntityInuse: (entityId: string): IAppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/CheckEntityInuse?entityId=` + entityId, {
                credentials: 'same-origin'
            })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'CHECK_ENTITY_INUSE_SUCCESS', entityInused: data === true });
            });
        addTask(fetchTask);
        dispatch({ type: 'CHECK_ENTITY_INUSE' });
    }
};


// Reducer
const unloadedState: EntityConnectState = { entities: [], reports: [], entityTypes: []};

export const reducer: Reducer<EntityConnectState> = (state: EntityConnectState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_ENTITIES':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'RECEIVE_ENTITIES':
            return {
                entities: action.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'REQUEST_REPORTS':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'RECEIVE_REPORTS':
            return {
                entities: state.entities,
                reports: action.reports,
                entityTypes: state.entityTypes
            };
        case 'UPDATE_ENTITY':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'UPDATE_ENTITY_SUCCESS':
            //let otherEntities = state.entities.filter(function (obj) {
            //    return obj.Id !== action.updatedEntity.Id;
            //});
            //let updatedEntities = [...otherEntities, action.updatedEntity];
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes,
                entityUpdated: action.entityUpdated
            };
        case 'DELETE_ENTITY_SUCCESS':
            return {
                entities: [],
                reports: state.reports,
                entityTypes: state.entityTypes,
                entityDeleted: action.entityDeleted
            };
        case 'DELETE_ENTITY':
            return {
                entities: [],
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'ADD_ENTITY':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'ADD_ENTITY_SUCCESS':
            let existing = state.entities.filter(function (obj) {
                return obj.Id !== action.addedEntity.Id;
            });
            let addedEntities = [...existing, action.addedEntity];
            return {
                entities: addedEntities,
                reports: state.reports,
                entityTypes: state.entityTypes,
                entityAdded: true
            };
        case 'REQUEST_ENTITY_TYPES':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        case 'RECEIVE_ENTITY_TYPES':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: action.entityTypes
            };
        case 'CHECK_ENTITY_INUSE_SUCCESS':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes,
                entityInused: action.entityInused
            };
        case 'CHECK_ENTITY_INUSE':
            return {
                entities: state.entities,
                reports: state.reports,
                entityTypes: state.entityTypes
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
