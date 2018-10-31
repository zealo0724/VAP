import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as AdminTenantsStore from '../../store/AdminTenants';
import * as AdminConfigStore from '../../store/AdminConfig';
import * as AdminUserAccessStore from '../../store/AdminUserAccess';
import { Modal, Radio, Alert } from 'react-bootstrap';
import { localResource, optionType } from '../../PublicFunctions';

type TenantsProps = AdminConfigStore.AdminConfigState & AdminTenantsStore.TenantsAdminState & AdminUserAccessStore.UserAccessState & typeof mapedActionCreators;

export class AdminTenants extends React.Component<TenantsProps, any> {
    constructor(props: TenantsProps) {
        super(props);
        this.state = {
            tenants: [],
            serviceUrl: '',
            activeTenant: null,
            addUserModalOpen: false,
            dnvglUsers: [],
            dnvglUser: null,
            addInLoading: false,
            checkUserInLoading: false,
            tenantAdmins: [],
            tenantAdminAdded: false,
            newTenantAdded: false,
            tenantAdminAddMessage: '',
            BusinessAreas: [],
            preLocations: [],
            activeLocation: null,
            locationOperationMode: 'Add',
            errors: [],
            locationModalOpen: false,
            addTenantModalOpen: false,
            editModalOpen: false
        };
    }

    componentWillMount() {
        this.props.getTenants();
        this.props.getBusinessAreas();
        this.initActiveLocation();
    }

    componentDidMount() {
        document.title = 'PBI App - Admin Tenants';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.newTenantAdded) {
            this.setState({ addInLoading: false, addTenantModalOpen: false });
            this.props.getTenants();
        }
        if (nextProps.tenantUpdated) {
            this.setState({ addInLoading: false, editModalOpen: false });
            this.props.getTenants();
        }
        if (nextProps.tenantAdminUpdated) {
            this.setState({ addInLoading: false, editModalOpen: false });
            this.props.getTenants();
        }
        if (nextProps.dnvglUserLoaded) {
            this.setState({ checkUserInLoading: false });
        }
        if (nextProps.tenantAdminAdded) {
            let activeTenant = this.state.activeTenant;
            this.props.getTenantAdmins(activeTenant.Id);
            this.setState({
                dnvglUser: null,
                addUserModalOpen: true,
                dnvglUsers: [],
                tenantAdmins: [],
                activeTenant: activeTenant,
                tenantAdminAdded: false,
                tenantAdminAddMessage: nextProps.tenantAdminAddMessage,
                addInLoading: false
            });
        }
        if (nextProps.getUsersSuccess) {
            if (nextProps.dnvglUsers.length === 0) {
                this.setState({ errors: [localResource.cannotFindUser] });
            } else {
                this.setState({ errors: [] });
            }
            this.setState({ dnvglUsers: nextProps.dnvglUsers });
            this.props.clearDNVGLUser();
        }
        if (nextProps.businessAreas && nextProps.businessAreas.length > 0) {
            this.setState({ BusinessAreas: nextProps.businessAreas });
        }
        if (nextProps.tenantAdminAdded === false && nextProps.tenantAdminAddMessage !== undefined && nextProps.tenantAdminAddMessage.length >0) {
            this.setState({ tenantAdminAddMessage: nextProps.tenantAdminAddMessage, addInLoading: false});
        }
        if (nextProps.operationType && nextProps.operationType === optionType.superAdminUpdateTenant.updateTenant) {
            this.setState({ editModalOpen: false, errors: [], addInLoading: false });
        }
        if (nextProps.preLocations) {
            this.setState({ preLocations: nextProps.preLocations});
        }
        if (nextProps.newLocationAdded) {
            this.props.getPreLocations(this.state.activeTenant.Id);
            this.initActiveLocation();
            this.setState({ errors: [] });
        }
        if (nextProps.newLocationDeleted) {
            this.props.getPreLocations(this.state.activeTenant.Id);
            this.setState({ errors: [] });
        }
        if (nextProps.newLocationUpdated) {
            this.props.getPreLocations(this.state.activeTenant.Id);
            this.initActiveLocation();
            this.setState({ locationOperationMode: 'Add', errors: [] });
        }
        this.setState({
            tenants: nextProps.tenants,
            serviceUrl: nextProps.serviceUrl,
            tenantAdmins: nextProps.tenantAdmins,
            checkUserInLoading: false
        });
    }

    showEditModal(tenant) {
        this.setState({ activeTenant: tenant, editModalOpen: true, tenantAdminAddMessage: '' });
    }

    showLocationModal(tenant) {
        this.initActiveLocation();
        this.props.getPreLocations(tenant.Id);
        this.setState({ activeTenant: tenant, locationModalOpen: true, errors: [], locationOperationMode: 'Add'});
    }

    hideEditModal() {
        this.setState({ activeTenant: null, editModalOpen: false, tenantAdminAddMessage: '', errors: [] });
    }

    hideLocationModal() {
        this.setState({ activeTenant: null, locationModalOpen: false, errors: [] });
    }

    handleModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let active = Object.assign({}, this.state.activeTenant);
        active[name] = value;

        this.setState({
            activeTenant: active
        });
    }

    handleLocationChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let active = Object.assign({}, this.state.activeLocation);
        active[name] = value;
        this.setState({
            activeLocation: active
        });
    }

    updateTenant() {
        if (this.validActiveTenant(this.state.activeTenant)) {
            this.setState({ addInLoading: true });
            this.props.updateTenant(this.state.activeTenant, optionType.superAdminUpdateTenant.updateTenant);
        }
    }

    validActiveTenant(activeTenant) {
        let currentTenants = this.state.tenants;
        let errors = [];
        let domainNameFound = currentTenants.some(t => t.DomainName === activeTenant.DomainName && t.Id !== activeTenant.Id);
        let nameFound = currentTenants.some(t => t.Name === activeTenant.Name && t.Id !== activeTenant.Id);

        if (domainNameFound) {
            errors.push('The tenant Domain Name is already in use, please change to a new one.');
        }

        if (nameFound) {
            errors.push('The tenant Name is already in use, please change to a new one.');
        }
        if (errors.length > 0) {
            this.setState({ errors: errors });
            return false;
        }
        return true;
    }

    showAddUserModal(tenant: AdminTenantsStore.Tenant) {
        this.props.getTenantAdmins(tenant.Id);
        this.setState({ activeTenant: tenant, addUserModalOpen: true, tenantAdmins: [] ,errors: [] });
    }

    setEditLocation(location) {
        let activeLocation = location;
        this.setState({ activeLocation: activeLocation, locationOperationMode: 'Edit' , erors:[]});
    }

    deleteLocation(location) {
        if (!this.validDeleteLocation(location))
            return;
        let activeLocation = location;
        this.props.deletePreLocation(activeLocation);
    }

    validDeleteLocation(location) {
        if (location.ReportsCount > 0) {
            this.setState({ errors: ['You canot delete this location, because it is dependent by '+ location.ReportsCount + ' reports'] });
            return false;
        }
        return true;
    }

    hideAddUserModal() {
        this.props.clearDNVGLUser();
        this.setState({ activeTenant: null, addUserModalOpen: false, dnvglUser: null, dnvglUsers: [], tenantAdminAddMessage: '', errors: [] });
    }

    validateEmail(e) {
        this.setState({ dnvglUsers: [], checkUserInLoading: true });
        e.preventDefault();
        if (e.target.form.checkValidity() && this.validEmail(e.target.form.email.value)) {
            this.props.getDNVGLUser(e.target.form.email.value);
        }
    }

    validEmail(email) {
        if (email.indexOf('@') >= 0) {
            return true;
        } else {
            this.setState({ errors: ['The email address you input is incorrect'], checkUserInLoading: false });
            return false;
        }
    }

    handleDNVGLUserClick(user: AdminUserAccessStore.DNVGLUser) {
        this.setState({ dnvglUser: user, dnvglUsers: [] });
    }

    updateTenantAdmins() {
        this.setState({ addInLoading: true });
        let dnvUser = this.state.dnvglUser;
        if (dnvUser == null) {
            this.setState({ addInLoading: false });
            return;
        }
        let addUser: AdminUserAccessStore.User = {
            MyDnvglUserId: dnvUser.Id,
            MyDnvGlUserName: dnvUser.MyDnvGlUserName,
            Email: dnvUser.Email,
            FirstName: dnvUser.FirstName,
            LastName: dnvUser.LastName,
            EntityTrees: [],
            Roles: []
        };
        if (this.validateUser()) {
            this.props.addTenantAdmin(addUser,
                this.state.activeTenant.MyDNVGLServiceId,
                this.state.activeTenant.Id,
                this.state.activeTenant.DomainName
            );
        } else {
            this.setState({ addInLoading: false });
        }
    }

    validateUser() {
        let errors = [];
        let existedUser = this.state.tenantAdmins.filter(x => x.MyDnvglUserId.toLowerCase() === this.state.dnvglUser.Id.toLowerCase());
        if (existedUser.length > 0) {
            errors.push(localResource.userAlreadyExist);
        }
        if (errors.length > 0) {
            this.setState({ errors: errors });
            return false;
        }
        this.setState({ errors: [] });
        return true;
    }

    showAddTenantModal() {
        this.setState({ addTenantModalOpen: true, activeTenant: { ReportLocation: "EU" }, tenantNameExists: false, domainNameExists: false});
    }

    initActiveLocation() {
        let activeLocation = {
            Name: '',
            Description: '',
            ShortName: '',
            GroupId: '',
            IsDefault: false,
            TenantId: null
        }
        this.setState({ activeLocation: activeLocation });
    }

    hideAddTenantModal() {
        this.setState({ addTenantModalOpen: false, errors: [] });
    }

    addTenant() {
        if (this.validActiveTenant(this.state.activeTenant)) {
            this.props.addNewTenant(this.state.activeTenant);
            this.setState({ addInLoading: true });
        }
    }

    unSelectUser() {
        this.setState({ dnvglUser: null, errors: [], tenantAdminAddMessage: '' });
    }

    addLocation() {
        if (this.validAddActiveLocation(this.state.activeLocation)) {
            if (!this.state.activeLocation.TenantId) {
                this.state.activeLocation.TenantId = this.state.activeTenant.Id;
            }
            this.props.addPreLocation(this.state.activeLocation);
        }
        return;
    }

    editLocation() {
        if (this.validEditActiveLocation(this.state.activeLocation)) {
            if (!this.state.activeLocation.TenantId) {
                this.state.activeLocation.TenantId = this.state.activeTenant.Id;
            }
            this.props.editPreLocation(this.state.activeLocation);
        }
        return;
    }

    validAddActiveLocation(location) {
        let existing = this.state.preLocations;
        let errors = [];
        if (existing.filter(x => x.GroupId === location.GroupId).length > 0) {
            errors.push('The service ID has already exists');
        }
        if (location.IsDefault === 'true') {
            if (existing.filter(x => x.IsDefault === true).length > 0) {
                errors.push('The default service is already exists');
            }
        }
        if (errors.length > 0) {
            this.setState({ errors: errors });
            return false;
        }
        this.setState({ errors: [] });
        return true;
    }

    validEditActiveLocation(location) {
        let existing = this.state.preLocations;
        let errors = [];
        if (existing.filter(x => x.GroupId === location.GroupId && x.Id !== location.Id).length > 0) {
            errors.push('The service ID has already exists');
        }
        if (location.IsDefault === 'true') {
            if (existing.filter(x => x.IsDefault === true && x.Id !== location.Id).length > 0) {
                errors.push('The default service is already exists');
            }
        }
        if (errors.length > 0) {
            this.setState({ errors: errors });
            return false;
        }
        this.setState({ errors: [] });
        return true;
    }

    handleDismiss() {
        this.props.clearDNVGLUser();
        this.setState({ errors: [] });
    }

    getSharedHtml(disabled) {
        return (
            <div className="modal-body">
                {
                    this.state.activeTenant !== null &&
                    <div>
                        <div className="form-group">
                            <label htmlFor="Name">Name: </label>
                            <input name="Name" type="text" value={this.state.activeTenant.Name} className={'wide'} onChange={this.handleModalInputChange.bind(this)} onBlur={this.handleModalInputChange.bind(this)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="MyDNVGLServiceId">MyDNVGL ServiceId: </label>
                            <input className="wide" name="MyDNVGLServiceId" type="text" value={this.state.activeTenant.MyDNVGLServiceId} onChange={this.handleModalInputChange.bind(this)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="DomainName">Domain Name: </label>
                            <input disabled={disabled} name="DomainName" type="text" value={this.state.activeTenant.DomainName} className={'wide'} onChange={this.handleModalInputChange.bind(this)} required />
                        </div>
                        <div className="form-group">
                            <label>Client: </label>
                            <select name="BusinessAreaId" value={this.state.activeTenant.BusinessAreaId} onChange={this.handleModalInputChange.bind(this)} required>
                                <option value=""></option>
                                {this.state.BusinessAreas && this.state.BusinessAreas.map(tp => <option key={tp.Id} value={tp.Id}>{tp.Name}</option>)}
                            </select>
                        </div>
                        <div className="form-group location">
                            <label htmlFor="ReportLocation">Report Location: </label>
                            <Radio name="ReportLocation" disabled={disabled} checked={this.state.activeTenant.ReportLocation === "EU"} onChange={this.handleModalInputChange.bind(this)} value="EU">EU</Radio>
                            <Radio name="ReportLocation" disabled={disabled} checked={this.state.activeTenant.ReportLocation === "US"} onChange={this.handleModalInputChange.bind(this)} value="US">US</Radio>
                        </div>
                        {this.state.errors.length > 0 && this.state.errors.map(x => <p className="errors">{x}</p>)}
                    </div>
                }
            </div>);
    }

    getLocationHtml() {
        return (
            <div className="modal-body content-appear">
                {
                    <div>
                        <div className="form-group premiumLocation">
                            <label htmlFor="ReportLocation">Premium Report Location: </label>
                            {
                                //this.state.preLocations.length > 0 &&
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Short Name</th>
                                            <th>Group ID</th>
                                            <th>Description</th>
                                            <th>Is Default</th>
                                            <th>Reports on it</th>
                                            <th></th>
                                        </tr>
                                        <tr>
                                            <td><input name="Name" type="text" value={this.state.activeLocation.Name} onChange={this.handleLocationChange.bind(this)} required /></td>
                                            <td><input name="ShortName" type="text" value={this.state.activeLocation.ShortName} onChange={this.handleLocationChange.bind(this)} required /></td>
                                            <td><input name="GroupId" disabled={this.state.locationOperationMode !== 'Add'} type="text" value={this.state.activeLocation.GroupId} onChange={this.handleLocationChange.bind(this)} required /></td>
                                            <td><input name="Description" type="text" value={this.state.activeLocation.Description} onChange={this.handleLocationChange.bind(this)} required /></td>
                                            <td>
                                                <select name="IsDefault" value={this.state.activeLocation.IsDefault} onChange={this.handleLocationChange.bind(this)} required>
                                                    <option value="false">No</option>
                                                    <option value="true">Yes</option>
                                                </select>
                                            </td>
                                            <td></td>
                                            <td>
                                                <span>
                                                    <button disabled={this.state.locationOperationMode !== 'Add'} type="button" className="btn btn-primary" aria-label="LocalOptionBtn" onClick={this.addLocation.bind(this)}><span aria-hidden="true">Add</span></button>
                                                    <button disabled={this.state.locationOperationMode !== 'Edit'} type="button" className="btn btn-primary" aria-label="LocalOptionBtn" onClick={this.editLocation.bind(this)}><span aria-hidden="true">Edit</span></button>
                                                </span>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.preLocations.map(preLocation =>
                                            <tr key={preLocation.Id}>
                                                <td>{preLocation.Name}</td>
                                                <td>{preLocation.ShortName}</td>
                                                <td>{preLocation.GroupId}</td>
                                                <td>{preLocation.Description}</td>
                                                <td>{preLocation.IsDefault && <span className="glyphicon glyphicon-ok"></span>}</td>
                                                <td>{preLocation.ReportsCount}</td>
                                                <td>
                                                    <span className="pull-right glyphicon glyphicon-edit edit-btn" onClick={this.setEditLocation.bind(this, preLocation)}></span>
                                                    <span className="pull-right glyphicon glyphicon-remove delete-btn" onClick={this.deleteLocation.bind(this, preLocation)}></span>
                                                </td>
                                                <td></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            }
                            {this.state.errors.length > 0 && this.state.errors.map(x => <p className="errors">{x}</p>)}
                        </div>
                    </div>
                }
            </div>);
    }

    render() {
        return (
            <div id="admin-tenants">
                <h1>Administer tenants</h1>
                <button type="button" className="btn btn-primary" onClick={this.showAddTenantModal.bind(this)}>Add</button>
                {this.state.tenants.length > 0 &&
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Domain Name</th>
                                <th>Display Name</th>
                                <th>ServiceId</th>
                                <th>Client</th>
                                <th>Location</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.tenants.map(tenant =>
                                <tr key={tenant.Id}>
                                    <td><a href={'/' + tenant.DomainName}>{tenant.DomainName}</a></td>
                                <td>{tenant.Name}</td>
                                <td><a target="_blank" href={this.state.serviceUrl + tenant.MyDNVGLServiceId}>{tenant.MyDNVGLServiceId}</a>
                                    <span className={'pull-right glyphicon ' + (tenant.IsAdminOk ? ' glyphicon-thumbs-up ' : ' glyphicon-thumbs-down ')} ></span>
                                </td>
                                    <td>{tenant.BusinessArea && tenant.BusinessArea.Name}</td>
                                    <td>{tenant.ReportLocation}</td>
                                    <td>
                                        <span className="pull-right glyphicon glyphicon-edit edit-btn" onClick={this.showEditModal.bind(this, tenant)}></span>
                                        {/*<span className="pull-right glyphicon glyphicon-map-marker location-btn" onClick={this.showLocationModal.bind(this, tenant)}></span>*/}
                                        <span className="pull-right glyphicon glyphicon-user user-icon" onClick={this.showAddUserModal.bind(this, tenant)}></span>
                                    </td>
                                        
                                </tr>
                            )}

                        </tbody>
                    </table>
                }

                {/*Location MODAL*/}
                <Modal className="withLocation" show={this.state.locationModalOpen} onHide={this.hideLocationModal.bind(this)}>
                    <div className="modal-content">
                        <form id="createForm">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideLocationModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Report Location Manage</h4>
                            </div>
                            {this.getLocationHtml()}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideLocationModal.bind(this)}>{localResource.modalCancel}</button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/*Add Tenant MODAL*/}
                <Modal show={this.state.addTenantModalOpen} onHide={this.hideAddTenantModal.bind(this)}>
                    <div className="modal-content">
                        <form id="createForm">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideAddTenantModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Add</h4>
                            </div>
                            {this.getSharedHtml(false)}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideAddTenantModal.bind(this)}>{localResource.modalCancel}</button>
                                <button type="button" className="btn btn-primary" onClick={this.addTenant.bind(this)}>{this.state.addInLoading ? <div className="loader"></div> : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/*Edit Tenant MODAL*/}
                <Modal show={this.state.editModalOpen} onHide={this.hideEditModal.bind(this)}>
                    <div className="modal-content">
                        <form id="createForm">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideEditModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit</h4>
                            </div>
                            {this.getSharedHtml(true)}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideEditModal.bind(this)}>{localResource.modalCancel}</button>
                                <button type="button" className="btn btn-primary" onClick={this.updateTenant.bind(this)}>{this.state.addInLoading ? <div className="loader"></div> : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </Modal>

                {/*Add User MODAL*/}
                <Modal dialogClassName="addtenantAdminModal" show={this.state.addUserModalOpen} onHide={this.hideAddUserModal.bind(this)}>
                    <div className="modal-content">
                        <form id="createForm">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideAddUserModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Add tenant SystemAdmin</h4>
                            </div>
                            <div className="modal-body">
                                {this.state.errors && this.state.errors.length > 0 &&
                                    <Alert bsStyle="danger" onDismiss={this.handleDismiss.bind(this)}>
                                        <h4>Error</h4>
                                        {this.state.errors.map(error => {
                                            return <p>{error}</p>;
                                        })}
                                        <button type="button" onClick={this.handleDismiss.bind(this)}>OK</button>
                                    </Alert>
                                }
                                <div>
                                    {this.state.tenantAdmins.length > 0 && <strong>Current admins:</strong>}
                                    <table className="table table-striped">
                                        <tbody>
                                        {
                                                this.state.tenantAdmins.map(admin =>
                                                    <tr key={admin.Id}>
                                                        <td>{admin.Email}</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                {
                                    this.state.activeTenant !== null &&
                                    <div>
                                        <strong>Add new admin:</strong>
                                        {this.state.dnvglUser === null &&
                                            <div className="form-group">
                                                <label htmlFor="email"></label>
                                                <input type="text" name="email" />
                                                <button type="submit" className="btn btn-primary" onClick={this.validateEmail.bind(this)}>{this.state.checkUserInLoading ? <div className="loader"></div> : 'Check'}</button>

                                            </div>
                                        }

                                        {/*this.state.dnvglUsers.ErrorMessage*/}
                                        {(this.state.dnvglUsers && this.state.dnvglUsers.length > 0) &&
                                            <table className="table table-striped" id="dnvglusers">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Username</th>
                                                        <th>Email</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.dnvglUsers.map(dnvglUser => {
                                                        return (
                                                            <tr key={dnvglUser.Id} onClick={this.handleDNVGLUserClick.bind(this, dnvglUser)}>
                                                                <td>{dnvglUser.LastName}, {dnvglUser.FirstName}</td>
                                                                <td>{dnvglUser.MyDnvGlUserName}</td>
                                                                <td>{dnvglUser.Email}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        }

                                        {
                                            this.state.dnvglUser !== null &&
                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="email">Email: </label>
                                                    <input className="wide" name="email" value={this.state.dnvglUser.Email} disabled />
                                                    <button type="button" className="btn btn-primary" onClick={this.unSelectUser.bind(this)} >Reselect</button>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                }
                                {this.state.tenantAdminAddMessage.length > 0 && <p className="errors">{this.state.tenantAdminAddMessage}</p>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideAddUserModal.bind(this)}>{localResource.modalCancel}</button>
                                <button disabled={this.state.dnvglUser ? false : true} type="button" className="btn btn-primary" onClick={this.updateTenantAdmins.bind(this)}>{this.state.addInLoading ? <div className="loader"></div> : 'Add' }</button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminConfig,  state.adminTenants, state.adminUserAccess);
    return State;
}

let mapedActionCreators = Object.assign({}, AdminConfigStore.actionCreators, AdminTenantsStore.actionCreators, AdminUserAccessStore.actionCreators);

export default connect(mapStateToProps, mapedActionCreators)(AdminTenants);