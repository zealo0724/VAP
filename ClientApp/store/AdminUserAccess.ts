import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as EntityStore from './Entity';
import * as pbi from 'powerbi-client';
import ApiUtils from '../Utils/ApiUtils';
import * as fetchFunction from './FetchWithErrorHandling'

export interface UserAccessState {
    users: User[];
    dnvglUsers: any;
    getUsersSuccess?: boolean;
    dnvglUserError?: any;
    entities: EntityStore.Entity[];
    userAdded?: boolean;
    userUpdated?: boolean;
    userDeleted?: boolean;
    roles: Role[];
    batchUpdUsers?: User[];
    batchUploadUsersSucceed?: boolean;
}

export interface batchAddUsers {
    Users: User[];
    Roles: Role[];
    EntityTrees: EntityTree[];
}

export interface DNVGLUser {
    Company?: string;
    Email: string;
    FirstName: string;
    HasValidatedEmail: boolean;
    Id: string;
    LastFetchUtcTime: string;
    LastName: string;
    MyDNVGLUserId: string;
    UserPrincipalName: string;
    SamAccountName: string;
    MyDnvGlUserName: string;
}

export interface Role {
    Id: number;
    Name: string;
}

export interface User {
    Id?: number;
    MyDnvglUserId: string;
    MyDnvGlUserName: string;
    Email: string;
    FirstName: string;
    LastName: string;
    EntityTrees: EntityTree[];
    Roles: Role[];
    Status?: string;
}

export interface EntityTree {
    //Entity: EntityStore.Entity;
    EntityName: string;
    EntityTypeId: number;
    EntityTypeName: string;
    EntityId: number;
    //EntityTreeReports: any;
    Id: number;
    IsParent: boolean;
    ParentId: number;
    TenantId: 0;
}


interface RequestUsersAction {
    type: 'REQUEST_USERS';
}

interface ReceiveUsersAction {
    type: 'RECEIVE_USERS';
    users?: any[];
}

interface RequestDNVGLUser {
    type: 'REQUEST_DNVGL_USER';
}

interface ReceiveDNVGLUser {
    type: 'RECEIVE_DNVGL_USER';
    // Fix correct user object
    dnvglUsers?: any;
    getUsersSuccess?: boolean;
}

interface RequestEntitiesAction {
    type: 'REQUEST_ENTITIES';
}

interface ReceiveEntitiesAction {
    type: 'RECEIVE_ENTITIES';
    entities?: EntityStore.Entity[];
}

interface AddUserAction {
    type: 'ADD_USER';
}

interface AddUserSuccessAction {
    type: 'ADD_USER_SUCCESS';
    userAdded?: boolean;
}

interface UpdateUserAction {
    type: 'UPDATE_USER';
}

interface UpdateUserSuccessAction {
    type: 'UPDATE_USER_SUCCESS';
    userUpdated?: boolean;
}

interface DeleteUserAction {
    type: 'DELETE_USER';
}

interface DeleteUserSuccessAction {
    type: 'DELETE_USER_SUCCESS';
    userDeleted?: boolean;
}

interface RequestRolesAction {
    type: 'REQUEST_ROLES';
}

interface ReceiveRolesAction {
    type: 'RECEIVE_ROLES';
    roles?: Role[];
}

interface BathUsersUploadSuccessAction {
    type: 'BATH_USERS_UPLOAD_SUCCESS';
    batchUsersResponse: any[];
}

interface BathUsersUploadAction {
    type: 'BATH_USERS_UPLOAD';
}

interface BatchUsersAddSuccessAction {
    type: 'BATH_USERS_ADD_SUCCESS';
    batchUploadUsersSucceed?: boolean;
}

interface BatchUsersAddAction {
    type: 'BATH_USERS_ADD';
}


type KnownAction = RequestUsersAction
    | ReceiveUsersAction
    | RequestDNVGLUser
    | ReceiveDNVGLUser
    | RequestEntitiesAction
    | ReceiveEntitiesAction
    | AddUserAction
    | AddUserSuccessAction
    | UpdateUserAction
    | UpdateUserSuccessAction
    | DeleteUserAction
    | DeleteUserSuccessAction
    | RequestRolesAction
    | ReceiveRolesAction
    | BathUsersUploadSuccessAction
    | BathUsersUploadAction
    | BatchUsersAddSuccessAction
    | BatchUsersAddAction;

// ACTION CREATORS
export const actionCreators = {
    getUsers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/Users`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_USERS', users: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_USERS' });
    },
    getDNVGLUser: (email: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // let fake = '[{"Id":null,"MyDNVGLUserId":"370889b1-6001-4f3c-ac1e-3aca8e9a188f","UserPrincipalName":null,"FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"},{"Id":null,"MyDNVGLUserId":"9415aa99-f511-471e-b883-438822fa4d22","UserPrincipalName":"Per.August.Kramer@dnvgl.com","FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"}]';
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/GetDnvglUser?email=${email}`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_DNVGL_USER', dnvglUsers: data, getUsersSuccess: true });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_DNVGL_USER' });
    },
    clearDNVGLUser: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'RECEIVE_DNVGL_USER', dnvglUsers: null, getUsersSuccess: false });
        dispatch({ type: 'REQUEST_DNVGL_USER' });
    },
    getEntities: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/EntityAdmin/Entities`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ENTITIES', entities: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ENTITIES' });
    },
    addUser: (user: User): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/AddUser`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(user)
        }).then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'ADD_USER_SUCCESS', userAdded: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_USER' });
    },
    pushUsers: (form: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let formData = new FormData(form);
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + '/webapi/admin/UserAdmin/PushUsers',
            {
                credentials: 'same-origin',
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(response => {
                dispatch({
                    type: 'BATH_USERS_UPLOAD_SUCCESS',
                    batchUsersResponse: response
                });
            });
        addTask(fetchTask);
        dispatch({ type: 'BATH_USERS_UPLOAD' });
    }, 
    batchAddUsers: (batchAddUsers: batchAddUsers): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + '/webapi/admin/UserAdmin/BatchAddUsers',
            {
                credentials: 'same-origin',
                headers: { 'Content-type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(batchAddUsers)
            }
        )
            //.then(response => response.json())
            .then(response => {
                dispatch({
                    type: 'BATH_USERS_ADD_SUCCESS',
                    batchUploadUsersSucceed: response === true
                });
            });
        addTask(fetchTask);
        dispatch({ type: 'BATH_USERS_ADD' });
    },
    updateUser: (user: User): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/UpdateUser`, {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(user)
        }).then(data => {
            dispatch({ type: 'UPDATE_USER_SUCCESS', userUpdated: data.status === 200 });
        });
        addTask(fetchTask);
        dispatch({ type: 'UPDATE_USER' });
    },
    deleteUser: (user: User): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/DeleteUser`, {
            credentials: 'same-origin',
            method: 'DELETE',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(user)
        }).then(data => {
            dispatch({ type: 'DELETE_USER_SUCCESS', userDeleted: data.status === 200 });
        });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_USER' });
    },
    getRoles: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetchFunction.fetchWithHandler('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/Roles`, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_ROLES', roles: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_ROLES' });
    }

};


// Reducer
const unloadedState: UserAccessState = { entities: [], roles: [], dnvglUsers: [], users: []};

export const reducer: Reducer<UserAccessState> = (state: UserAccessState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_USERS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'RECEIVE_USERS':
            return {
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                users: action.users
            } as UserAccessState;
        case 'REQUEST_DNVGL_USER':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'RECEIVE_DNVGL_USER':
            return {
                users: state.users,
                roles: state.roles,
                entities: state.entities,
                dnvglUsers: action.dnvglUsers,
                getUsersSuccess: action.getUsersSuccess
            } as UserAccessState;
        case 'REQUEST_ENTITIES':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'RECEIVE_ENTITIES':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: action.entities
            } as UserAccessState;
        case 'ADD_USER':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'ADD_USER_SUCCESS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                userAdded: action.userAdded
            } as UserAccessState;
        case 'UPDATE_USER':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'UPDATE_USER_SUCCESS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                userUpdated: action.userUpdated
            } as UserAccessState;
        case 'DELETE_USER':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'DELETE_USER_SUCCESS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                userDeleted: action.userDeleted
            } as UserAccessState;
        case 'REQUEST_ROLES':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState; 
        case 'RECEIVE_ROLES':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: action.roles,
                entities: state.entities
            } as UserAccessState;
        case 'BATH_USERS_UPLOAD_SUCCESS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                batchUpdUsers: action.batchUsersResponse
            } as UserAccessState;
        case 'BATH_USERS_UPLOAD':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            } as UserAccessState;
        case 'BATH_USERS_ADD_SUCCESS':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities,
                batchUploadUsersSucceed: action.batchUploadUsersSucceed
            };
        case 'BATH_USERS_ADD':
            return {
                users: state.users,
                dnvglUsers: state.dnvglUsers,
                roles: state.roles,
                entities: state.entities
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
