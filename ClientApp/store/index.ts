
import * as Entities from './Entities';
import * as Entity from './Entity';
// import * as Report from './Report';
import * as Report from './Report';
import * as Reports from './Reports';
import * as AdminPbiReports from './AdminPbiReports';
import * as AdminReportConnect from './AdminReportConnect';
import * as AdminEntityConnect from './AdminEntityConnect';
import * as AdminUserAccess from './AdminUserAccess';
import * as AdminConfig from './AdminConfig';
import * as MyDnvGlUser from './MyDnvGlUser';

import * as Common from './Common';
import * as AdminTenants from './AdminTenants';


// The top-level state object
export interface ApplicationState {
    entities: Entities.EntitiesState;
    entity: Entity.EntityState;
    // report: Report.ReportState,
    reports: Reports.ReportsState;
    report: Report.ReportState;

    adminPbiReports: AdminPbiReports.PBIReportsState;
    adminReportConnect: AdminReportConnect.ReportConnectState;
    adminEntityConnect: AdminEntityConnect.EntityConnectState;
    adminUserAccess: AdminUserAccess.UserAccessState;
    adminConfig: AdminConfig.AdminConfigState;
    myDnvGlUser: MyDnvGlUser.MyDnvGlUserState;

    common: Common.CommonState;
    adminTenants: AdminTenants.TenantsAdminState;


}

// Whenever an action is dispatched, Redux will update each top-level application state property using
// the reducer with the matching name. It's important that the names match exactly, and that the reducer
// acts on the corresponding ApplicationState property type.
export const reducers = {
    entities: Entities.reducer,
    // report: Report.reducer,
    entity: Entity.reducer,
    reports: Reports.reducer,
    report: Report.reducer,
    adminPbiReports: AdminPbiReports.reducer,
    adminReportConnect: AdminReportConnect.reducer,
    adminEntityConnect: AdminEntityConnect.reducer,
    adminUserAccess: AdminUserAccess.reducer,
    adminConfig: AdminConfig.reducer,
    myDnvGlUser: MyDnvGlUser.reducer,
    common: Common.reducer,
    adminTenants: AdminTenants.reducer
    
};

// This type can be used as a hint on action creators so that its 'dispatch' and 'getState' params are
// correctly typed to match your store.
export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
