import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as AdminUserAccessStore from './AdminUserAccess';
import ApiUtils from '../Utils/ApiUtils';
import { optionType } from '../PublicFunctions';
import * as fetchFunction from './FetchWithErrorHandling'

export interface TenantsAdminState {
    tenants: Tenant[];
    serviceUrl: string;
    dnvglUser: any;
    dnvglUserLoaded?: boolean;
    tenantAdmins: any[];
    tenantAdminAdded?: boolean;
    tenantAdminAddMessage?: string;
    tenantAdminUpdated?: boolean;
    newTenantAdded?: boolean;
    operationType?: string;
    preLocations: PreLocation[];
    newLocationAdded?: boolean;
    newLocationUpdated?: boolean;
    newLocationDeleted?: boolean;
}

export interface Tenant {
    Id: number;
    Name: string;
    MyDNVGLServiceId: string;
    IsAdminOk: boolean;
    DomainName: string;
    ReportLocation: string;
    InvoiceDetail: string;
    InvoiceContact: string;
    BusinessAreaId?: number;
    HeadIcon: string;
    HeadBackground: string;
}

export interface PreLocation {
    Id: number;
    Name: string;
    Description: string;
    ShortName: string;
    GroupId: string;
    IsDefault: boolean;
    TenantId: number;
    ReportsCount: number;
}

interface RequesttenantsAction {
    type: 'REQUEST_TENANTS';
}

interface ReceiveTenantsAction {
    type: 'RECEIVE_TENANTS';
    tenants: Tenant[];
    serviceUrl: string;
}

interface UpdateTenantAction {
    type: 'UPDATE_TENANT';
}

interface UpdateTenantSuccessAction {
    type: 'UPDATE_TENANT_SUCCESS';
    updatedTenant: Tenant;
    operationType: string;
}

//interface RequestDNVGLUser {
//    type: 'REQUEST_DNVGL_USER';
//}

//interface ReceiveDNVGLUser {
//    type: 'RECEIVE_DNVGL_USER';
//    // Fix correct user object
//    dnvglUser: any;
//    dnvglUserLoaded: boolean;
//}

interface RequestTenantAdminsAction {
    type: 'REQUEST_TENANT_ADMINS';
}

interface ReceiveTenantAdmins {
    type: 'RECEIVE_TENANT_ADMINS';
    tenantAdmins: any;
}

interface AddTenantAdminAction {
    type: 'ADD_TENANT_ADMIN';
}

interface AddTenantAdminSuccess {
    type: 'ADD_TENANT_ADMIN_SUCCESS';
    addAdminResult: any;
    tenantAdminAdded?: boolean;
}

interface AddNewTenantAction {
    type: 'ADD_NEW_TENANT';
}

interface AddNewTenantSuccessAction {
    type: 'ADD_NEW_TENANT_SUCCESS';
    newTenantAdded?: boolean;
}

interface ReceivePreLocationsAction {
    type: 'RECEIVE_PRELOCATIONS';
    preLocations: any;
}

interface RequestPreLocationsAction {
    type: 'REQUEST_PRELOCATIONS';
}

interface AddPreLocationSuccessAction {
    type: 'ADD_PRELOCATION_SUCCESS';
    newLocationAdded: boolean;
}

interface AddPreLocationAction {
    type: 'ADD_PRELOCATION';
}

interface EditPreLocationSuccessAction {
    type: 'EDIT_PRELOCATION_SUCCESS';
    newLocationUpdated: boolean;
}

interface EditPreLocationAction {
    type: 'EDIT_PRELOCATION';
}

interface DeletePreLocationSuccessAction {
    type: 'DELETE_PRELOCATION_SUCCESS';
    newLocationDeleted: boolean;
}

interface DeletePreLocationAction {
    type: 'DELETE_PRELOCATION';
}

type KnownAction = RequesttenantsAction
    | ReceiveTenantsAction
    | UpdateTenantAction
    | UpdateTenantSuccessAction
    //| RequestDNVGLUser
    //| ReceiveDNVGLUser
    | RequestTenantAdminsAction
    | ReceiveTenantAdmins
    | AddTenantAdminAction
    | AddTenantAdminSuccess
    | AddNewTenantAction
    | AddNewTenantSuccessAction
    | ReceivePreLocationsAction
    | RequestPreLocationsAction
    | AddPreLocationSuccessAction
    | AddPreLocationAction
    | EditPreLocationSuccessAction
    | EditPreLocationAction
    | DeletePreLocationSuccessAction
    | DeletePreLocationAction;

// ACTION CREATORS
export const actionCreators = {

    getTenants: (current?: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchURL = '/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/Tenants`;
        if (current) { fetchURL += `?current=${current}`; }
        let fetchTask = fetchFunction.fetchWithHandler(fetchURL, { credentials: 'same-origin' })
            //.then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_TENANTS', tenants: data.Tenants, serviceUrl: data.ServiceUrl });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_TENANTS' });
    },
    updateTenant: (tenant: Tenant, operationType?: any): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/UpdateTenant`, {
            credentials: 'same-origin',
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(tenant)
        })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'UPDATE_TENANT_SUCCESS', updatedTenant: data, operationType: (operationType ? operationType : null)});
            });
        addTask(fetchTask);
        dispatch({ type: 'UPDATE_TENANT' });
    },
    //getDNVGLUser: (email: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
    //    // let fake = '[{"Id":null,"MyDNVGLUserId":"370889b1-6001-4f3c-ac1e-3aca8e9a188f","UserPrincipalName":null,"FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"},{"Id":null,"MyDNVGLUserId":"9415aa99-f511-471e-b883-438822fa4d22","UserPrincipalName":"Per.August.Kramer@dnvgl.com","FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"}]';
    //    let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/UserAdmin/GetDnvglUser?email=${email}`, { credentials: 'same-origin' })
    //        .then(response => response.json())
    //        .then(data => {
    //            dispatch({ type: 'RECEIVE_DNVGL_USER', dnvglUser: data, dnvglUserLoaded: true});
    //        });
    //    addTask(fetchTask);
    //    dispatch({ type: 'REQUEST_DNVGL_USER' });
    //},
    getTenantAdmins: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // let fake = '[{"Id":null,"MyDNVGLUserId":"370889b1-6001-4f3c-ac1e-3aca8e9a188f","UserPrincipalName":null,"FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"},{"Id":null,"MyDNVGLUserId":"9415aa99-f511-471e-b883-438822fa4d22","UserPrincipalName":"Per.August.Kramer@dnvgl.com","FirstName":"Per August","LastName":"Krämer","Company":null,"Email":"Per.August.Kramer@dnvgl.com","HasValidatedEmail":false,"LastFetchUtcTime":"0001-01-01T00:00:00"}]';
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/TenantAdmins?id=${id}`, { credentials: 'same-origin' })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_TENANT_ADMINS', tenantAdmins: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_TENANT_ADMINS' });
    },
    addTenantAdmin: (user: AdminUserAccessStore.User, serviceId: string, tenantId: string, domainName: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/AddTenantAdmin?serviceId=${serviceId}&tenantId=${tenantId}&domainName=${domainName}`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(user)
        })
            //.then(ApiUtils.ApiUtils.checkStatus)
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'ADD_TENANT_ADMIN_SUCCESS', addAdminResult: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_TENANT_ADMIN' });
    },
    addNewTenant: (tenant: Tenant): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/AddTenant`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(tenant)
        })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                //hello,temp
                dispatch({ type: 'ADD_NEW_TENANT_SUCCESS', newTenantAdded: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_NEW_TENANT' });
    },
    getPreLocations: (tenantId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/PreLocations?TenantId=${tenantId}`,
            {
                 credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                dispatch({ type: 'RECEIVE_PRELOCATIONS', preLocations: data });
            });
        addTask(fetchTask);
        dispatch({ type: 'REQUEST_PRELOCATIONS' });
    },
    addPreLocation: (location: PreLocation): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/AddPreLocation`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(location)
        })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'ADD_PRELOCATION_SUCCESS', newLocationAdded: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'ADD_PRELOCATION' });
    },
    editPreLocation: (location: PreLocation): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/EditPreLocation`, {
            credentials: 'same-origin',
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(location)
        })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'EDIT_PRELOCATION_SUCCESS', newLocationUpdated: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'EDIT_PRELOCATION' });
    },
    deletePreLocation: (location: PreLocation): AppThunkAction<KnownAction> => (dispatch, getState) => {
        let fetchTask = fetch('/' + sessionStorage.getItem('tenant') + `/webapi/admin/TenantAdmin/DeletePreLocation`, {
            credentials: 'same-origin',
            method: 'Post',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(location)
        })
            .then(ApiUtils.ApiUtils.checkStatus)
            .then(data => {
                dispatch({ type: 'DELETE_PRELOCATION_SUCCESS', newLocationDeleted: data.status === 200 });
            });
        addTask(fetchTask);
        dispatch({ type: 'DELETE_PRELOCATION' });
    }
};


// Reducer
const unloadedState: TenantsAdminState = {
    tenants: []
    , serviceUrl: ''
    , dnvglUser: []
    , tenantAdmins: []
    , newTenantAdded: false
    , tenantAdminAddMessage: ''
    , preLocations: []
    , tenantAdminAdded: false
};

export const reducer: Reducer<TenantsAdminState> = (state: TenantsAdminState, action: KnownAction) => {
    switch (action.type) {
        case 'REQUEST_TENANTS':
            return {
                ...state,
                tenantAdminAdded: false
            };
        case 'RECEIVE_TENANTS':
            return {
                ...state,
                tenantAdminAdded: false,
                tenants: action.tenants,
                serviceUrl: action.serviceUrl,
            };
        case 'UPDATE_TENANT':
            return {
                ...state,
                tenantAdminAdded: false
            };
        case 'UPDATE_TENANT_SUCCESS':
            let otherTenants = state.tenants.filter(function (obj) {
                return obj.Id !== action.updatedTenant.Id;
            });
            let updatedTenants = [...otherTenants, action.updatedTenant];
            return {
                ...state,
                tenantAdminAdded: false,
                tenants: updatedTenants,
                operationType: action.operationType
            } as TenantsAdminState;
        //case 'REQUEST_DNVGL_USER':
        //    return {
        //        tenants: state.tenants,
        //        dnvglUser: state.dnvglUser,
        //        tenantAdmins: state.tenantAdmins,
        //    };
        //case 'RECEIVE_DNVGL_USER':
        //    return {
        //        tenants: state.tenants,
        //        dnvglUser: action.dnvglUser,
        //        tenantAdmins: state.tenantAdmins,
        //        dnvglUserLoaded: true
        //    } as TenantsAdminState;
        case 'REQUEST_TENANT_ADMINS':
            return {
                ...state,
                tenantAdminAdded: false
                //tenants: state.tenants,
                //dnvglUser: state.dnvglUser,
                //tenantAdmins: state.tenantAdmins,
            };
        case 'RECEIVE_TENANT_ADMINS':
            return {
                ...state,
                tenantAdminAdded: false
                //tenants: state.tenants,
                //dnvglUser: state.dnvglUser,
                ,tenantAdmins: action.tenantAdmins
            };
        case 'ADD_TENANT_ADMIN':
            return {
                ...state,
                tenantAdminAdded: false
                //tenants: state.tenants,
                //dnvglUser: state.dnvglUser,
                //tenantAdmins: state.tenantAdmins,
            };
        case 'ADD_TENANT_ADMIN_SUCCESS':
            let result = action.addAdminResult;
            return {
                ...state,
                tenantAdminAdded: result.Success,
                tenantAdminAddMessage: result.Message
            } as TenantsAdminState;
        case 'ADD_NEW_TENANT':
            return {
                ...state,
                tenantAdminAdded: false
            };
        case 'ADD_NEW_TENANT_SUCCESS':
            return {
                ...state,
                tenantAdminAdded: false,
                newTenantAdded: action.newTenantAdded
            };
        case 'RECEIVE_PRELOCATIONS':
            return {
                ...state,
                tenantAdminAdded: false,
                preLocations: action.preLocations
            };
        case 'REQUEST_PRELOCATIONS':
            return {
                ...state
                , tenantAdminAdded: false
            };
        case 'ADD_PRELOCATION_SUCCESS':
            return {
                ...state,
                tenantAdminAdded: false,
                newLocationAdded: action.newLocationAdded
            };
        case 'ADD_PRELOCATION':
            return {
                ...state
                , tenantAdminAdded: false
            };
        case 'EDIT_PRELOCATION_SUCCESS':
            return {
                ...state,
                tenantAdminAdded: false,
                newLocationUpdated: action.newLocationUpdated
            };
        case 'EDIT_PRELOCATION':
            return {
                ...state
                , tenantAdminAdded: false
            };
        case 'DELETE_PRELOCATION_SUCCESS':
            return {
                ...state,
                tenantAdminAdded: false,
                newLocationDeleted: action.newLocationDeleted
            };
        case 'DELETE_PRELOCATION':
            return {
                ...state
                , tenantAdminAdded: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }
    return state || unloadedState;
};
