import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';

export interface EntityState {
    entity: Entity;
    match?: any;
    entities?: Entity[];
    location?: any;
    RequestDone?: boolean;
}

export interface Entity {
    Id: number;
    IsParent: boolean;
    ParentId: number;
    EntityId: number;
    EntityName: string;
    EntityTypeName: string;
    EntityTypeId: number;
    EntityTypeProperties: Array<EntityTypeProperty>;
    Reports: Array<string>;
}

export interface EntityTypeProperty {
    Id: number;
    PropertyTypeName: string;
    EntityTypePropertyId: number;
    EntityTypePropertyName: string;
    Value: string;
}

// export interface PropertyType {
//     name: string;
// }

interface RequestEntityAction {
    type: 'REQUEST_ENTITY';
}

interface ReceiveEntityAction {
    type: 'RECEIVE_ENTITY';
    entity: Entity;
    RequestDone: boolean;
}

interface RequestEntitiesAction {
    type: 'REQUEST_ENTITIES';
}

interface ReceiveEntitiesAction {
    type: 'RECEIVE_ENTITIES';
    entities: Entity[];
}


type KnownAction = RequestEntityAction
    | ReceiveEntityAction
    | RequestEntitiesAction
    | ReceiveEntitiesAction;


// ACTION CREATORS
export const actionCreators = {
    requestEntity: (id: number, noSkip = false): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/Entity?id=${id}`, { credentials: 'same-origin' })
            .then(response => response.json() as Entity)
            .then(data => {
                data.Id > 0 && !data.IsParent && data.Reports.length > 0 && !noSkip
                    ? () => {}
                    : dispatch({ type: 'RECEIVE_ENTITY', entity: data, RequestDone: true });
            });

        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITY' });
    },
    requestEntities: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/Entities?id=${id}`, { credentials: 'same-origin' })
            .then(response => response.json() as Promise<Entity[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITIES', entities: data });
            });

        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITIES' });
    }
};

const unloadedState: EntityState = { entity: { Id: 0, IsParent: false, ParentId: 0, EntityId: 0, EntityName: '', EntityTypeName: '', EntityTypeId: null, EntityTypeProperties: [], Reports: [] } };

export const reducer: Reducer<EntityState> = (state: EntityState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_ENTITY':
            return {
                entity: state.entity,
                RequestDone: false
            };
        case 'RECEIVE_ENTITY':
            return {
                entity: action.entity,
                RequestDone: action.RequestDone
            };
        case 'REQUEST_ENTITIES':
            return {
                entity: state.entity,
                entities: state.entities,
                RequestDone: false
            };
        case 'RECEIVE_ENTITIES':
            return {
                entity: state.entity,
                entities: action.entities,
                RequestDone: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
