import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as EntityStore from './Entity';

export interface EntitiesState {
    entities: EntityStore.Entity[];
}

export interface PageParams {
    params: any;
}

interface RequestEntitiesAction {
    type: 'REQUEST_ENTITIES';
}

interface ReceiveEntitiesAction {
    type: 'RECEIVE_ENTITIES';
    entities: EntityStore.Entity[];
}

interface UpdateEntityAction {
    type: 'UPDATE_ENTITY';
}

interface UpdateEntitySuccessAction {
    type: 'UPDATE_ENTITY_SUCCESS';
    entities: EntityStore.Entity[];
}


type KnownAction = RequestEntitiesAction | ReceiveEntitiesAction | UpdateEntityAction | UpdateEntitySuccessAction;


// ACTION CREATORS
export const actionCreators = {
    requestEntities: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + '/webapi/Dashboard/Entities', { credentials: 'same-origin' })
            .then(response => response.json() as Promise<EntityStore.Entity[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_ENTITIES', entities: data });
            });

        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITIES' });
    },
    updateEntity: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('apiURL', {
            method: 'POST',
            body: JSON.stringify({ entity: 'entity her' })
        }).then(respone => respone.json() as Promise<EntityStore.Entity[]>)
            .then(data => {
                dispatch({ type: 'UPDATE_ENTITY_SUCCESS', entities: data });
            });

        addTask(fetchTask);
        dispatch({ type: 'UPDATE_ENTITY' });
    }
};

// Reducer
const unloadedState: EntitiesState = { entities: [] };

export const reducer: Reducer<EntitiesState> = (state: EntitiesState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_ENTITIES':
            return {
                entities: state.entities
            };
        case 'RECEIVE_ENTITIES':
            return {
                entities: action.entities
            };
        case 'UPDATE_ENTITY':
            return {
                entities: state.entities
            };
        case 'UPDATE_ENTITY_SUCCESS':
            return {
                entities: action.entities
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
