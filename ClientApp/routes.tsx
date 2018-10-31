import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout } from './components/Layout';

import Entities from './pages/Entities';
import Entity from './pages/Entity';
//import EditEntity from './pages/EditEntity';
import EntityReports from './pages/EntityReports';
import NotFound from './pages/NotFound';
import Administration from './pages/Admin/Administration';
import AdminPbiReports from './pages/Admin/AdminPbiReports';
import AdminReportConnect from './pages/Admin/AdminReportConnect';
import AdminEntityConnect from './pages/Admin/AdminEntityConnect';
import AdminUserAccess from './pages/Admin/AdminUserAccess';
import AdminConfig from './pages/Admin/AdminConfig';
import AdminTenants from './pages/TenantAdmin/AdminTenants';
import NotAuthorize from './NotAuthorize';

export default (
    <Layout>
        <Switch>
            <Route exact path="/Admin" component={AdminTenants} />
            <Route exact path="/:tenant" component={Entities} />
            <Route path="/:tenant/NotAuthorize" component={NotAuthorize} />
            <Route exact path="/:tenant/entities/:id" component={Entity} />
            <Route path="/:tenant/entities/:id/reports" component={EntityReports} />
            { /* <Route path=":tenant/entities/:id/edit" component={ EditEntity } /> */}

            <Route exact path="/:tenant/administration" component={Administration} />
            <Route exact path="/:tenant/administration/pbi-reports" component={AdminPbiReports} />
            <Route path="/:tenant/administration/report-connect" component={AdminReportConnect} />
            <Route path="/:tenant/administration/entity-connect" component={AdminEntityConnect} />
            <Route path="/:tenant/administration/user-access" component={AdminUserAccess} />
            <Route path="/:tenant/administration/config" component={AdminConfig} />

            <Route path="*" component={NotFound} />
        </Switch>
    </Layout>
)

// Enable Hot Module Replacement (HMR)
if (module.hot) {
    module.hot.accept();
}
