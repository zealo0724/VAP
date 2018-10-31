import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as AdminUserAccessStore from '../../store/AdminUserAccess';
import { Modal, Pagination, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import * as CommonStore from '../../store/Common';
import { localResource, getDefaultOrCookiePageSize, saveCookiePageSize, commonFunctions } from '../../PublicFunctions';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

let CommonActionCreators = Object.assign({}, AdminUserAccessStore.actionCreators, CommonStore.actionCreators);
type AdminUserAccessProps = AdminUserAccessStore.UserAccessState & CommonStore.CommonState & typeof CommonActionCreators;

export class AdminUserAccess extends React.Component<AdminUserAccessProps, any> {

    constructor(props: AdminUserAccessProps) {
        super(props);
        this.state = {
            users: [],
            filteredUsers: [],
            rolesLoaded: false,
            entitiesLoadded: false,
            activeUser: null,
            addModalOpen: false,
            bathAddModalOpen: false,
            editModalOpen: false,
            deleteModalOpen: false,
            dnvglUsers: [],
            dnvglUser: null,
            entities: [],
            multiSelectEntityObject: [],
            selectedEntitiesObject: [],
            loadingUsers: false,
            roles: [],
            multiselectRolesIbject: [],
            selectedRolesObject: [],
            inLoading: false,
            batchInChecking: false,
            batchInLoading: false,
            userFilterName: null,
            userFilterEmail: null,
            userFilterRoles: [],
            userFilterEntityIds: [],
            unSelectedRoles: [],
            selectedMenuRolesObject: [],
            unSelectedMenuRolesProject: [],
            selectedMenuEntityObject: [],
            unSelectedMenuEntityProject: [],
            activePage: localResource.defaultActivePage,
            pageSize: getDefaultOrCookiePageSize(localResource.UserAccessCookieName),
            tooltips: [],
            batchUsers: null,
            errors: [],
            pagedUsers: [],
            userUpdWarning: [],
            canBatchAddUsers: false
        };
    }

    componentWillMount() {
        if (sessionStorage.getItem('userRoles')) {

            let batchUserViewMod = {
                Users: [],
                EntityTrees: [],
                Roles: []
            };
            this.setState({ batchUsers: batchUserViewMod });

            this.props.getUsers();
            this.props.getEntities();

            this.props.getRoles();
            if (this.props.tooltips === undefined) {
                this.props.getTooltips();
            } else {
                this.setState({ tooltips: this.props.tooltips });
            }
        } else {
            this.props.getUserRoles();
        }
    }

    componentDidMount() {
        document.title = sessionStorage.getItem('tenant') + ' - Admin Manage Users';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (sessionStorage.getItem('userRoles') === null) {
            if (nextProps.userRoles !== null && nextProps.userRoles !== undefined) {
                this.setState({ userRoles: nextProps.userRoles });
            }
        }
        else {
            this.setState({ userRoles: sessionStorage.getItem('userRoles').split(',') });
        }

        if (this.state.userRoles) {
            let auth = this.state.userRoles.filter(x => x === localResource.SystemAdmin).length > 0 ||
                this.state.userRoles.filter(x => x === localResource.UserAdmin).length > 0;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }

            let canBatchAddUsers = this.state.userRoles.filter(x => x === localResource.canBatchAddUsers).length > 0;
            if (canBatchAddUsers) {
                this.setState({ canBatchAddUsers: canBatchAddUsers });
            }

            if (nextProps.tooltips !== undefined && nextProps.tooltips !== null) {
                this.setState({ tooltips: nextProps.tooltips });
            }
            if (nextProps.userAdded) {
                this.props.getUsers();
                this.setState({ addModalOpen: false, activeUser: null, inLoading: false, selectedEntitiesObject: [], selectedRolesObject: [] });

            }
            if (nextProps.userUpdated) {
                this.props.getUsers();
                this.setState({ editModalOpen: false, activeUser: null, inLoading: false, selectedEntitiesObject: [], selectedRolesObject: [] });

            }
            if (nextProps.userDeleted) {
                this.props.getUsers();
                this.setState({ deleteModalOpen: false, inLoading: false, activeUser: null });
            }
            if (!this.state.entitiesLoadded && nextProps.entities.length > 0) {
                let multiSelectEntities = nextProps.entities.map(entity => { return this.mapToMultiselectObject(entity.EntityName, entity.Id); });
                this.setState({ multiSelectEntityObject: multiSelectEntities, entitiesLoadded: true, unSelectedMenuEntityProject: multiSelectEntities });
            }
            if (!this.state.rolesLoaded && nextProps.roles.length > 0) {
                let multiselectRoles = nextProps.roles.map(role => { return this.mapToMultiselectObject(role, role); });
                this.setState({
                    multiselectRolesIbject: multiselectRoles,
                    unSelectedMenuRolesProject: multiselectRoles,
                    rolesLoaded: true
                });
            }
            if (nextProps.batchUpdUsers) {
                let errors = [];

                if (nextProps.batchUpdUsers.length > 0) {
                    let viewUsers = this.state.batchUsers;
                    viewUsers.Users = nextProps.batchUpdUsers;
                    let multipleUsers = [];
                    let leftUsers = viewUsers.Users;
                    viewUsers.Users.forEach(x => {
                        if (leftUsers.filter(z => z.Email.toLowerCase() === x.Email.toLowerCase()).length > 1) {
                            multipleUsers.push(x.Email);
                            leftUsers = leftUsers.filter(y => y.Email !== x.Email);
                        }
                    });
                    if (multipleUsers.length > 0) {
                        errors.push(`There are multiple emails in your uploaded file: ${multipleUsers.join(', ')}, please check it`);
                        this.setState({ batchInLoading: false, errors: errors, batchInChecking: false });
                        return;
                    }

                    this.setState({ batchUsers: viewUsers, batchInLoading: false, batchInChecking: false });
                    if (viewUsers.Users.filter(x => x.Status === 'Not Exist').length > 0) {
                        let warning = [];
                        warning.push('You have some invalid users, will skip these users if you continue your opreation');
                        this.setState({ userUpdWarning: warning });
                    } else {
                        this.setState({ userUpdWarning: [] });
                    }
                }
                if (nextProps.batchUpdUsers.length === 0) {
                    let viewUsers = this.state.batchUsers;
                    viewUsers.Users = [];
                    errors.push("There is no invalid user in the file.");
                    this.setState({ batchUsers: viewUsers, batchInLoading: false, errors: errors });
                }
            }
            if (nextProps.batchUploadUsersSucceed) {
                this.props.getUsers();
                this.hideBatchAddModal();
            }

            if (nextProps.users && nextProps.users.length > 0) {
                let pagedUsers = this.pageUsers(nextProps.users, null, null, null, null, null, null);
                this.setState({ pagedUsers: pagedUsers });
            }

            if (nextProps.getUsersSuccess) {
                if (nextProps.dnvglUsers.length === 0) {
                    this.setState({ errors: [localResource.cannotFindUser] });
                } else {
                    this.setState({
                        errors: []
                    });
                }
                this.setState({ dnvglUsers: nextProps.dnvglUsers });
                this.props.clearDNVGLUser();
            }
            this.setState({ users: nextProps.users, entities: nextProps.entities, loadingUsers: false, roles: nextProps.roles });
        }
    }

    mapToMultiselectObject(label, value) {
        return { label: label, value: value };
    }

    handleEmailInputChanged(event) {
        this.setState({ activePage: 1, userFilterEmail: event.target.value, pagedUsers: this.pageUsers(null, null, null, event.target.value, null, null, null) });
    }

    handleNameInputChanged(event) {
        this.setState({ activePage: 1, userFilterName: event.target.value, pagedUsers: this.pageUsers(null, null, null, null, event.target.value, null, null) });
    }

    getFilteredUsers(users, userFilterEmail, userFilterName, selectedMenuRolesObject, selectedMenuEntityObject) {
        let result = users || this.state.users;
        let letUserFilterEmail = userFilterEmail || (userFilterEmail === "" ? "" : this.state.userFilterEmail);
        let letUerFilterName = userFilterName || (userFilterName === "" ? "" : this.state.userFilterName);
        let letSelectedMenuRolesObject = selectedMenuRolesObject || (selectedMenuRolesObject === "" ? "" : this.state.selectedMenuRolesObject);
        let letSelectedMenuEntityObject = selectedMenuEntityObject || (selectedMenuEntityObject === "" ? "" : this.state.selectedMenuEntityObject);

        if (letUserFilterEmail && letUserFilterEmail.trim().length !== 0) {
            result = result.filter(
                user => user.Email.toLowerCase().indexOf(letUserFilterEmail.toLowerCase()) >= 0
            );
        }
        if (letUerFilterName && letUerFilterName.trim().length !== 0) {
            result = result.filter(
                user => (user.FirstName + ' ' + user.LastName).toLowerCase().indexOf(letUerFilterName.toLowerCase()) >= 0
            );
        }
        if (letSelectedMenuRolesObject && letSelectedMenuRolesObject.length > 0) {
            result = result.filter(
                user => user.Roles.some(
                    role => letSelectedMenuRolesObject.some(
                        selectedRole => selectedRole.value.toLowerCase() === role.toLowerCase()
                    )
                )
            );
        }
        if (letSelectedMenuEntityObject !== 'undefined' && letSelectedMenuEntityObject.length > 0) {
            result = result.filter(
                user => user.EntityTrees.some(
                    entity => letSelectedMenuEntityObject.some(selectedEntity => selectedEntity.value === entity.Id)
                )
            );
        }

        return result;
    }

    pageUsers(users, activePage, pageSize, userFilterEmail, userFilterName, selectedMenuRolesObject, selectedMenuEntityObject) {
        let filteredUsers = this.getFilteredUsers(users, userFilterEmail, userFilterName, selectedMenuRolesObject, selectedMenuEntityObject);
        this.setState({ filteredUsers: filteredUsers });
        let actPag = activePage || this.state.activePage;
        let pagSize = pageSize || this.state.pageSize;
        return filteredUsers.slice((actPag - 1) * pagSize, actPag * pagSize);
    }

    handleMultiSelectEntityChange(val) {
        let active: AdminUserAccessStore.User = Object.assign({}, this.state.activeUser);
        active.EntityTrees = [];

        val.map(multiSelectEntity => {

            let entTree = this.state.entities.filter(function (ent) {
                return ent.Id === multiSelectEntity.value;
            });
            active.EntityTrees.push(entTree[0]);
        });
        this.setState({ activePage: 1, activeUser: active, selectedEntitiesObject: val });
    }

    handleBatchMultiSelectEntityChange(val) {
        let viewUsers = this.state.batchUsers;
        let batchEntity = viewUsers.EntityTrees;

        val.map(multiSelectEntity => {

            let entTree = this.state.entities.filter(function (ent) {
                return ent.EntityId === multiSelectEntity.value;
            });
            batchEntity.push(entTree[0]);
        });
        this.setState({ batchUsers: viewUsers, selectedEntitiesObject: val });
    }

    handleMultiSelectRoleChange(val) {
        let active: AdminUserAccessStore.User = Object.assign({}, this.state.activeUser);
        active.Roles = [];
        val.map(multiSelectRole => {
            active.Roles.push(multiSelectRole.value);
        });
        this.setState({ activePage: 1, activeUser: active, selectedRolesObject: val });
    }

    handleBatchMultiSelectRolesChange(val) {
        let viewUsers = this.state.batchUsers;

        val.map(multiSelectRole => {
            viewUsers.Roles.push(multiSelectRole.value);
        });
        this.setState({ batchUsers: viewUsers, selectedRolesObject: val });
    }

    handleMenuMultiSelectRoleChange(val) {
        this.setState({ activePage: 1, selectedMenuRolesObject: val, pagedUsers: this.pageUsers(null, 1, null, null, null, val, null) });
    }

    handleMenuMultiSelectEntityChange(val) {
        //val.map(item => {
        //    this.state.selectedMenuEntityObject.push(item.value);
        //});
        this.setState({ activePage: 1, selectedMenuEntityObject: val, pagedUsers: this.pageUsers(null, 1, null, null, null, null, val) });
    }

    handleClear() {
        this.setState({ selectedMenuRolesObject: [], selectedMenuEntityObject: [], userFilterEmail: '', userFilterName: '', pagedUsers: this.pageUsers(null, 1, null, '', '', '', '') });
    }

    showAddModal() {
        this.setState({ addModalOpen: true, dnvglUser: null, dnvglUsers: [] });
    }

    hideAddModal() {
        this.props.clearDNVGLUser();
        this.setState({ addModalOpen: false, dnvglUser: null, dnvglUsers: [], selectedEntitiesObject: [], selectedRolesObject: [], activeUser: null, inLoading: false, errors: [] });
    }

    batchAddUsers(e) {
        //valid
        let updViewUsers = this.state.batchUsers;
        let errors = [];
        if (!updViewUsers.Users || updViewUsers.Users.length === 0) {
            errors.push("No valid user");
        }
        if (!updViewUsers.EntityTrees || updViewUsers.EntityTrees.length === 0) {
            errors.push("At least select one Entity");
        }
        if (!updViewUsers.Roles || updViewUsers.Roles.length === 0) {
            errors.push("At least select one Roles");
        }
        if (errors.length > 0) {
            this.setState({ errors: errors });
            return;
        }
        this.setState({ batchInLoading: true, errors: [] });
        this.props.batchAddUsers(this.state.batchUsers);
    }

    showBathAddModal() {
        this.setState({
            bathAddModalOpen: true
        });
    }

    hideBatchAddModal() {
        let batchUsers = this.state.batchUsers;
        batchUsers.Users = [];
        batchUsers.EntityTree = [];
        batchUsers.Roles = [];
        this.setState({ bathAddModalOpen: false, batchInLoading: false, batchUsers: batchUsers, selectedEntitiesObject: null, selectedRolesObject: null, errors: [], userUpdWarning: [] });
    }

    showEditModal(user: AdminUserAccessStore.User) {
        let multiSelectUserEntities = user.EntityTrees.map(entity => { return this.mapToMultiselectObject(entity.EntityName, entity.Id); });
        let multiSelectUserRoles = user.Roles.map(role => this.mapToMultiselectObject(role, role));
        this.setState({ editModalOpen: true, activeUser: user, selectedEntitiesObject: multiSelectUserEntities, selectedRolesObject: multiSelectUserRoles });
    }
    hideEditModal() {
        this.setState({ editModalOpen: false, selectedEntitiesObject: [], selectedRolesObject: [], errors: [], inLoading: false });
    }

    showDeleteModal(user) {
        this.setState({ deleteModalOpen: true, activeUser: user });
    }

    hideDeleteModal() {
        this.setState({ deleteModalOpen: false });
    }


    validateEmail(e) {
        this.setState({ dnvglUsers: [], loadingUsers: true });
        e.preventDefault();
        if (e.target.form.checkValidity() && this.validEmail(e.target.form.email.value)) {
            this.props.getDNVGLUser(e.target.form.email.value);
        }
    }

    validEmail(email) {
        if (email.indexOf('@') >= 0) {
            return true;
        } else {
            this.setState({ errors: ['The email address you input is incorrect'], loadingUsers: false });
            return false;
        }
    }

    handleDNVGLUserClick(user: AdminUserAccessStore.DNVGLUser) {
        let activeUser: AdminUserAccessStore.User = {
            MyDnvglUserId: user.Id,
            MyDnvGlUserName: user.MyDnvGlUserName,
            Email: user.Email,
            FirstName: user.FirstName,
            LastName: user.LastName,
            EntityTrees: [],
            Roles: []
        };
        this.setState({ dnvglUser: user, activeUser: activeUser });
    }



    handleModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let active = Object.assign({}, this.state.activeUser);
        active[name] = value;
        this.setState({
            activeUser: active
        });
    }

    addUser() {
        if (this.validAddUser(true)) {
            this.setState({ inLoading: true });
            this.props.addUser(this.state.activeUser);
        }
    }

    pushUsers(e) {
        this.setState({ errors: [], userUpdWarning: [] });
        let usersFile = e.target.form.file.value;
        if (usersFile === null || usersFile.length === 0) {
            this.state.errors.push("File cannot been null or invalid user file");
            this.setState({ errors: this.state.errors });
            return;
        }
        var array = usersFile.split('.');
        var fileType = array[array.length - 1].toLowerCase();
        if (fileType !== "xlsx") {
            this.state.errors.push("Only support xlsx file");
            this.setState({ errors: this.state.errors });
            return;
        }
        this.setState({ batchInChecking: true, errors: [], userUpdWarning: [] });
        this.props.pushUsers(e.target.form);
    }

    validAddUser(addOperation) {
        let errors = [];
        if (addOperation) {
            let existedUser = this.state.users.filter(x => x.MyDnvglUserId.toLowerCase() ===
                this.state.dnvglUser.Id.toLowerCase());
            if (existedUser.length > 0) {
                errors.push(localResource.userAlreadyExist);
            }
        }
        if (this.state.activeUser.Roles.length === 0) {
            errors.push(localResource.roleIsRequired);
        }
        if (this.state.activeUser.EntityTrees.length === 0) {
            errors.push(localResource.entityIsRequired);
        }
        if (errors.length > 0) {
            this.setState({ errors: errors, inLoading: false});
            return false;
        }
        this.setState({ errors: [] });
        return true;
    }

    updateUser() {
        this.setState({ inLoading: true });
        if (this.validAddUser(false)) {
            this.props.updateUser(this.state.activeUser);
        }
    }

    deleteUser() {
        this.setState({ inLoading: true });
        this.props.deleteUser(this.state.activeUser);
    }

    handleSelect(eventKey) {
        this.setState({ activePage: eventKey, pagedUsers: this.pageUsers(null, eventKey, null, null, null, null, null) });
    }

    changePageSize(event) {
        saveCookiePageSize(localResource.UserAccessCookieName, event.target.value);
        this.setState({ pageSize: event.target.value, activePage: 1, pagedUsers: this.pageUsers(null, null, event.target.value, null, null, null, null) });
    }

    getTooltipHtml(elementId) {
        let tooltipTxt = commonFunctions.getCommonTooltip(elementId, this.state.tooltips);
        if (tooltipTxt.length > 0)
            return (
                <OverlayTrigger placement="top" overlay={<Tooltip className={tooltipTxt.length > 200 && 'myTooltip'} id="reportConnectTitleTooltip">{tooltipTxt}</Tooltip>}>
                    <span className="glyphicon tooltipAfterText glyphicon-question-sign"></span>
                </OverlayTrigger>
            );
        return (<span></span>);
    }

    handleDismiss() {
        this.props.clearDNVGLUser();
        this.setState({ errors: [] });
    }

    handleWarningDismiss() {
        this.setState({ userUpdWarning: [] });
    }

    render() {
        return (
            <div id="admin-user-access">
                {this.state.isAuthorized === true &&
                    <div className="content-appear">
                    <h2 className="management-title">Manage Users</h2>
                    <button type="button" className="btn btn-primary management-action-button" onClick={this.showAddModal.bind(this)}>Add User</button>
                    {this.state.canBatchAddUsers && <button type="button" className="btn btn-primary  management-action-button" onClick={this.showBathAddModal.bind(this)}>Batch Add User</button>}
                        <div>
                        <table className="table table-striped pbi-table">
                                <thead>
                                    <tr>
                                        <th>Name
                                    </th>
                                        <th>Email
                                    </th>
                                        <th className="col-xs-3">Roles
                                    </th>
                                        <th>Entities
                                    </th>
                                        <th></th>
                                    </tr>
                                    <tr className="filterTr">
                                        <th>
                                            <input className="filterInput" type="text" name="name" placeholder="Filter on name..." value={this.state.userFilterName} onChange={this.handleNameInputChanged.bind(this)} />
                                        </th>
                                        <th>
                                            <input className="filterInput" type="text" name="email" placeholder="Filter on email..." value={this.state.userFilterEmail} onChange={this.handleEmailInputChanged.bind(this)} />
                                        </th>
                                        <th>
                                            <Select multi={true} name="menuRoles" value={this.state.selectedMenuRolesObject} placeholder="Filter on roles..." options={this.state.unSelectedMenuRolesProject} onChange={this.handleMenuMultiSelectRoleChange.bind(this)}>
                                            </Select>
                                        </th>
                                        <th>
                                            <Select multi={true} name="menuProjects" value={this.state.selectedMenuEntityObject} placeholder="Filter on entities..." options={this.state.unSelectedMenuEntityProject} onChange={this.handleMenuMultiSelectEntityChange.bind(this)}>
                                            </Select>
                                        </th>
                                        <th className="clearButton">
                                            <button type="button" className="btn btn-default" onClick={this.handleClear.bind(this)}>Clear</button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.pagedUsers.map(user => {
                                        return (
                                            <tr key={user.Id}>
                                                <td>{user.FirstName} {user.LastName}</td>
                                                <td>{user.Email}</td>
                                                <td>{user.Roles.map(role => { return <div className="role-pill" key={role}>{role}</div>; })}</td>
                                                <td>{user.EntityTrees.map(entityTree => { return <div key={entityTree.EntityId}>{entityTree.EntityName}</div>; })}</td>

                                                <td className="action-buttons">
                                                    <span className="glyphicon glyphicon-edit edit-btn" onClick={this.showEditModal.bind(this, user)}></span>
                                                    <span className="glyphicon glyphicon-remove delete-btn" onClick={this.showDeleteModal.bind(this, user)}></span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                    {/*Add MODAL*/}
                    <Modal show={this.state.addModalOpen} onHide={this.hideAddModal.bind(this)} bsSize="medium">
                            <div className="modal-content">
                                <form id="addUserForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideAddModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Add User</h4>
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
                                            {this.state.dnvglUser === null &&
                                                <div className="form-group">
                                                    <label htmlFor="email"></label>
                                                    <input type="text" name="email" style={{ minWidth: "440px" }} />
                                                    <button type="submit" className="btn btn-primary addPlussSymble" onClick={this.validateEmail.bind(this)}>{this.state.loadingUsers ? <div className="loader"></div> : 'Check Name'}</button>

                                                </div>
                                            }
                                        </div>

                                        <div>
                                            {this.state.dnvglUsers && this.state.dnvglUsers.length > 0 &&
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
                                                        <input name="email" value={this.state.dnvglUser.Email} disabled />
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="Projects">Grant access to: </label>
                                                        <Select multi={true} name="entities" value={this.state.selectedEntitiesObject} options={this.state.multiSelectEntityObject} onChange={this.handleMultiSelectEntityChange.bind(this)}>
                                                        </Select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label htmlFor="Roles">Roles:{this.getTooltipHtml('userManageRolesTooltip')}
                                                        </label>
                                                        <Select multi={true} name="Roles" value={this.state.selectedRolesObject} options={this.state.multiselectRolesIbject} onChange={this.handleMultiSelectRoleChange.bind(this)}>
                                                        </Select>
                                                    </div>
                                                </div>
                                            }

                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideAddModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" className="btn btn-primary" onClick={this.addUser.bind(this)} disabled={!this.state.dnvglUser}>{this.state.inLoading ? <div className="loader"></div> : 'Add'}</button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        {/*Batch Add MODAL*/}
                    <Modal show={this.state.bathAddModalOpen && this.state.canBatchAddUsers} onHide={this.hideBatchAddModal.bind(this)} bsSize="lg">
                            <div className="modal-content">
                                <form id="bathAddUserForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideBatchAddModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Batch Add Users</h4>
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
                                        {this.state.userUpdWarning && this.state.userUpdWarning.length > 0 &&
                                            <Alert bsStyle="warning" onDismiss={this.handleWarningDismiss.bind(this)}>
                                                <h4>Warning</h4>
                                                {this.state.userUpdWarning.map(error => {
                                                    return <p>{error}</p>;
                                                })}
                                                <button type="button" onClick={this.handleWarningDismiss.bind(this)}>OK</button>
                                            </Alert>
                                        }
                                        <div className="form-group">
                                            <label htmlFor="Projects">Grant access to: </label>
                                            <Select multi={true} name="entities" value={this.state.selectedEntitiesObject} options={this.state.multiSelectEntityObject} onChange={this.handleBatchMultiSelectEntityChange.bind(this)}>
                                            </Select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="Roles">Roles:{this.getTooltipHtml('userManageRolesTooltip')}
                                            </label>
                                            <Select multi={true} name="Roles" value={this.state.selectedRolesObject} options={this.state.multiselectRolesIbject} onChange={this.handleBatchMultiSelectRolesChange.bind(this)}>
                                            </Select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="file">Choose a users excel file: </label>
                                            <div className="fileInput">
                                                <input disabled={this.state.batchInChecking || this.state.batchInLoading} id="file" type="file" name="file" ref="file" />
                                                <button type="button" className="btn btn-primary" onClick={(e) => this.pushUsers(e)} disabled={this.state.batchInChecking || this.state.batchInLoading}>{this.state.batchInChecking ? <div className="loader"></div> : 'Check'}</button>
                                            </div>
                                            <div className="exlLink"><span>Click <a target="_blank" href="/PowerBIFrameworkUserInputTemplate.xlsx">here</a> to download the template file</span></div>
                                        </div>
                                        <div>
                                            {
                                                this.state.batchUsers.Users && this.state.batchUsers.Users.length > 0 &&
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>FirstName</th>
                                                            <th>LastName</th>
                                                            <th>Email</th>
                                                            <th>MyDnvgl User Id</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.batchUsers.Users.map(user => {
                                                            return (
                                                                <tr key={user.Email}>
                                                                    <td>{user.FirstName}</td>
                                                                    <td>{user.LastName}</td>
                                                                    <td>{user.Email}</td>
                                                                    <td>{user.MyDnvglUserId}</td>
                                                                    <td className="AlertText">{user.Status}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            }
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideBatchAddModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" disabled={this.state.batchInChecking || this.state.batchInLoading} className="btn btn-primary" onClick={(e) => this.batchAddUsers(e)}>{this.state.batchInLoading ? <div className="loader"></div> : 'Run Batch Adding'}</button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        {/*Edit Modal*/}
                        <Modal show={this.state.editModalOpen} onHide={this.hideEditModal.bind(this)}>
                            {this.state.activeUser !== null &&
                                <div className="modal-content">
                                    <form id="editUserForm">
                                        <div className="modal-header">
                                            <button type="button" className="close" aria-label="Close" onClick={this.hideEditModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                            <h4 className="modal-title">Update user {this.state.activeUser.FirstName} {this.state.activeUser.LastName}</h4>
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
                                            <div className="form-group">
                                                <label htmlFor="email">Email: </label>
                                                <input name="email" value={this.state.activeUser.Email} disabled />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="Projects">Grant access to: </label>
                                                <Select multi={true} name="entities" value={this.state.selectedEntitiesObject} options={this.state.multiSelectEntityObject} onChange={this.handleMultiSelectEntityChange.bind(this)}>
                                                </Select>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="Roles">Roles: </label>
                                                <Select multi={true} name="Roles" value={this.state.selectedRolesObject} options={this.state.multiselectRolesIbject} onChange={this.handleMultiSelectRoleChange.bind(this)}>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" onClick={this.hideEditModal.bind(this)}>{localResource.modalCancel}</button>
                                            <button type="button" className="btn btn-primary" onClick={this.updateUser.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                                        </div>
                                    </form>
                                </div>}
                        </Modal>

                        {/*Delete Modal*/}
                        <Modal show={this.state.deleteModalOpen} onHide={this.hideDeleteModal.bind(this)}>
                            {this.state.activeUser !== null &&
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideDeleteModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Delete user {this.state.activeUser.FirstName} {this.state.activeUser.LastName}</h4>
                                    </div>
                                    <div className="modal-body">
                                        <p><strong>Please confirm that you want to delete user:</strong></p>
                                        <div><strong>Name:</strong> {this.state.activeUser.FirstName} {this.state.activeUser.LastName}</div>
                                        <div><strong>MyDNVGLId:</strong> {this.state.activeUser.MyDnvglUserId}</div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideDeleteModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" className="btn btn-primary" onClick={this.deleteUser.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Delete'}</button>
                                    </div>
                                </div>}
                        </Modal>

                        {/*Pagging*/}
                        <div className="pagination">
                            <div>
                                <Pagination
                                    prev
                                    next
                                    first
                                    last
                                    bsSize="small"
                                    items={Math.ceil(this.state.filteredUsers.length / this.state.pageSize)}
                                    activePage={this.state.activePage}
                                    onSelect={this.handleSelect.bind(this)} />
                            </div>
                            <div className="pagenationPagesize">
                                <span>Page Size: </span>
                                <select name="ChangePageSize" value={this.state.pageSize} onChange={this.changePageSize.bind(this)}>
                                    <option value={localResource.pageSize.small}>{localResource.pageSize.small}</option>
                                    <option value={localResource.pageSize.mid}>{localResource.pageSize.mid}</option>
                                    <option value={localResource.pageSize.big}>{localResource.pageSize.big}</option>
                                </select>
                            </div>
                        </div>
                    </div>}
            </div>
        );
    }
}


//export default connect(
//    (state: ApplicationState) => state.adminUserAccess,
//    AdminUserAccessStore.actionCreators
//)(AdminUserAccess);

const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminUserAccess, state.common);
    return State;
};
export default connect(mapStateToProps, CommonActionCreators)(AdminUserAccess);

