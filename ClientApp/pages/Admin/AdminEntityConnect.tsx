import * as React from 'react';
//import deepcopy from 'deepcopy'
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as AdminEntityConnectStore from '../../store/AdminEntityConnect';
import * as EntityStore from '../../store/Entity';
import * as CommonStore from '../../store/Common';
import { Modal, Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { localResource, getDefaultOrCookiePageSize, saveCookiePageSize, commonFunctions } from '../../PublicFunctions'

let CommonActionCreators = Object.assign({}, AdminEntityConnectStore.actionCreators, CommonStore.actionCreators);
type AdminEntityConnectProps = AdminEntityConnectStore.EntityConnectState & CommonStore.CommonState & typeof CommonActionCreators;

export class AdminEntityConnect extends React.Component<AdminEntityConnectProps, any> {

    constructor(props: AdminEntityConnectProps) {
        super(props);
        this.state = {
            entities: [],
            reports: [],
            entityTypeProperties: [],
            entityProperties: [],
            createModalOpen: false,
            editModalOpen: false,
            activeEntity: null,
            selectedReportsObject: [],
            multiSelectReportsObject: [],
            deleteModalOpen: false,
            entityTypes: [],
            activePage: localResource.defaultActivePage,
            pageSize: getDefaultOrCookiePageSize(localResource.EntityCookieName),
            formErrors: [],
            propertyErrors: [],
            tooltips: [],
            inLoading: false
    };
    }

    componentWillMount() {
        this.props.getEntities();
        this.props.getReports();
        this.props.getEntityTypes();
        this.props.getEntityTypeProperties();
        if (this.props.tooltips === undefined) {
            this.props.getTooltips();
        } else {
            this.setState({ tooltips: this.props.tooltips });
        }
        if (sessionStorage.getItem('userRoles') === null) {
            this.props.getUserRoles();
        }
    }

    componentDidMount() {
        document.title = sessionStorage.getItem('tenant') + ' - Admin Connect Entities';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (sessionStorage.getItem('userRoles') === null) {
            if (nextProps.userRoles !== null && nextProps.userRoles !== undefined) {
                this.setState({ userRoles: nextProps.userRoles });
            }
        } else {
            this.setState({ userRoles: sessionStorage.getItem('userRoles').split(',') });
        }

        if (this.state.userRoles !== undefined) {
            let auth = this.state.userRoles.filter(x => x === localResource.SystemAdmin).length > 0 ||
                this.state.userRoles.filter(x => x === localResource.DataAdmin).length > 0;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }

            if (nextProps.tooltips !== undefined && nextProps.tooltips !== null) {
                this.setState({ tooltips: nextProps.tooltips });
            }

            if (nextProps.reports) {
                let selectableReports = this.mapReportsObject(nextProps.reports);
                this.setState({
                    entities: nextProps.entities,
                    reports: nextProps.reports,
                    multiSelectReportsObject: selectableReports,
                    entityTypes: nextProps.entityTypes
                });
            }

            if (nextProps.entityTypeProperties) {
                this.setState({ entityTypeProperties: nextProps.entityTypeProperties });
            }

            if (nextProps.entityAdded) {
                this.hideCreateModal();
                this.props.getEntities();
                this.setState({ activeEntity: null, inLoading: false });
            }

            if (nextProps.entityDeleted) {
                this.props.getEntities();
                this.setState({ deleteModalOpen: false, activeEntity: null, entityDeleted: false, inLoading: false });
            }

            if (nextProps.entityUpdated) {
                this.hideEditModal();
                this.props.getEntities();
                this.setState({ activeEntity: null, inLoading: false });
            }

            if (nextProps.entityInused) {
                this.setState({ isInuse: nextProps.entityInused });
            } else {
                this.setState({ isInuse: false });
            }
        }
    }

    showEditModal(entity) {
        let selectedReports = this.mapReportsObject(entity.Reports);
        this.setState({ activeEntity: entity, editModalOpen: true, selectedReportsObject: selectedReports });
    }

    // CREATE A label/value object of reports
    mapReportsObject(reports) {
        let tempArr = [];
        reports.map(report => {
            tempArr.push({ label: report.Title, value: report.Id });
        });
        return tempArr;
    }

    mapSelectedReportsToRealReportsObject() {
        let result =
            this.state.selectedReportsObject.map(report => {
                let test = this.state.reports.filter(function (obj) {
                    return obj.Id === report.value;
                });
                return test[0];
            });
        return result;
    }

    hideEditModal() {
        this.setState({ activeEntity: null, editModalOpen: false, formErrors: [], propertyErrors: []});
    }

    updateEntity() {
        if (this.activeReportIsValid()) {
            this.setState({ inLoading: true});
            let reports = this.mapSelectedReportsToRealReportsObject();
            this.state.activeEntity.Reports = reports;
            this.props.updateEntity(this.state.activeEntity);
            // TODO: hide based on success or not (pass from store)
        }
    }

    deleteEntity() {
        this.setState({ inLoading: true });
        this.props.deleteEntity(this.state.activeEntity);
    }

    showCreateModal() {
        let blankEntity = {
            EntityId: 0,
            EntityName: '',
            EntityTypeName: '',
            EntityTypeId: '',
            EntityTypeProperties: [],
            Id: 0,
            IsParent: false,
            ParentId: null,
            Reports: []

        };
        this.setState({
            createModalOpen: true,
            activeEntity: blankEntity,
            selectedReportsObject: []
        });
    }

    addEntity() {
        if (this.activeReportIsValid()) {
            this.setState({ inLoading: true });
            let reports = this.mapSelectedReportsToRealReportsObject();
            this.state.activeEntity.reports = reports;
            this.props.addEntity(this.state.activeEntity);
            // TODO: hide based on success or not (pass from store)
            this.hideCreateModal();
        }
    }

    hideCreateModal() {
        this.setState({ createModalOpen: false, formErrors: [], propertyErrors: [] });
    }

    showDeleteModal(entity) {
        this.props.checkEntityInuse(entity.Id);
        let selectedReports = this.mapReportsObject(entity.Reports);
        this.setState({ deleteModalOpen: true, activeEntity: entity, selectedReportsObject: selectedReports });
    }

    hideDeleteModal() {
        this.setState({ deleteModalOpen: false, formErrors: []});
    }


    handleModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let active = Object.assign({}, this.state.activeEntity);
        //if (target.name === 'EntityTypeId') {
        //    active.entityTypeName = target.selectedOptions[0].text;
        //}
        active[name] = value;
        this.setState({
            activeEntity: active, formErrors: []
        });
    }

    //handleEntityPropertyInputChange(event) {
    //    const target = event.target;
    //    const value = target.type === 'checkbox' ? target.checked : target.value;
    //    const name = target.name;

    //    let active = Object.assign({}, this.state.activeEntity.EntityProperties);
    //    active[name] = value;
    //    this.setState({
    //        activeEntity: active
    //    });
    //}

    activeReportIsValid() {
        let form = this.state.activeEntity;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                if (property === 'EntityName' && (form[property].trim() === '' || form[property] === null)) {
                    errorFields.push(localResource.entityNameIsRequired);
                }
                if(property === 'EntityTypeId' && (form[property] === '' || form[property] === 0)) {
                    errorFields.push(localResource.entityTypeIsRequired);
                }
            }
        }
        let reports = this.state.selectedReportsObject;
        if (reports.length === 0) {
            errorFields.push(localResource.reportIsRequired);
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    handleMultiSelectChange(val) {
        this.setState({ selectedReportsObject: val });
    }

    handleSelect(eventKey) {
        this.setState({ activePage: eventKey });
    }

    getPaginationContent() {
        let actPag = this.state.activePage;
        let pagSize = this.state.pageSize;
        return this.state.entities.slice((actPag - 1) * pagSize, actPag * pagSize);
    }

    changePageSize(event) {
        saveCookiePageSize(localResource.EntityCookieName, event.target.value);
        this.setState({ pageSize: event.target.value, activePage: 1 });
    }

    addToPropertyMapListFunction(entityTypePropertyId, value) {
        this.setState({ propertyErrors: [] });
        if (this.propertyAddedIsValid(entityTypePropertyId, value)) {
            let propertyText = this.state.entityTypeProperties.filter(x => x.Id == entityTypePropertyId)[0].Name;
            let actEntity = Object.assign({}, this.state.activeEntity);
            actEntity.EntityTypeProperties = [...this.state.activeEntity.EntityTypeProperties];
            actEntity.EntityTypeProperties.push({
                EntityTypePropertyId: entityTypePropertyId,
                EntityTypePropertyName: propertyText,
                Value: value
            });
            this.setState({ activeEntity: actEntity });
        }
    }

    propertyAddedIsValid(entityTypePropertyId, value) {
        if (value === undefined || value.length === 0)
            return false;
        let propertyList = this.state.activeEntity.EntityTypeProperties;
        let errorFields = [];
        errorFields = propertyList.filter(k => k.EntityTypePropertyId == entityTypePropertyId);
        this.setState({ propertyErrors: errorFields });
        return !(errorFields.length > 0);
    }

    removePropertiesMapFromList(entity) {
        let actEntity = Object.assign({}, this.state.activeEntity);
        actEntity.EntityTypeProperties = [...this.state.activeEntity.EntityTypeProperties];
        let newEntity = actEntity.EntityTypeProperties.filter(k => !(k.Id === entity.Id && k.Value === entity.Value));
        actEntity.EntityTypeProperties = newEntity;
        this.setState({ activeEntity: actEntity, propertyErrors: [] });
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

    getSharedBody(disabled) {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="EntityName">Name: {this.getTooltipHtml('EntityConnectNameTooltip')}</label>
                    <input name="EntityName" disabled={disabled} type="text" className="wide" value={this.state.activeEntity.EntityName} onChange={this.handleModalInputChange.bind(this)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="entityTypeId">Type: {this.getTooltipHtml('EntityConnectTypeTooltip')}</label>
                    <select name="EntityTypeId" disabled={disabled} onChange={this.handleModalInputChange.bind(this)} value={this.state.activeEntity.EntityTypeId}>
                        <option value=""></option>
                        {this.state.entityTypes.map(type => <option key={type.Id} value={type.Id}>{type.Name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="EntityReports">Reports: {this.getTooltipHtml('EntityConnectReportsTooltip')}</label>
                    <Select multi={true} disabled={disabled} name="EntityReports" value={this.state.selectedReportsObject} options={this.state.multiSelectReportsObject} onChange={this.handleMultiSelectChange.bind(this)}>
                    </Select>
                </div>
                <div className="form-group">
                    <label>Type Property Value Setting: {this.getTooltipHtml('EntityConnectPropertyValueTooltip')}</label>
                    <div hidden={disabled}>
                        <span>
                            <select name="entityTypePropertyID" onChange={this.handleModalInputChange.bind(this)}>
                                <option value=""></option>
                                {this.state.entityTypeProperties != null && this.state.entityTypeProperties.map(type => <option key={type.Id} value={type.Id}>{type.Name}</option>)}
                            </select>
                        </span>
                        <span><input name="PropertyValue" type="text" onChange={this.handleModalInputChange.bind(this)} required /></span>
                        <span><button type="button" className="btn btn-primary addPlussSymble" aria-label="Add"
                            onClick={this.addToPropertyMapListFunction.bind(this, this.state.activeEntity.entityTypePropertyID, this.state.activeEntity.PropertyValue)}><span aria-hidden="true">+</span></button>
                        </span>
                    </div>
                </div>
                <table className="table table-striped">
                    <tbody>
                        {this.state.activeEntity.EntityTypeProperties.map(entity =>
                            <tr key={entity.Id}>
                                <td hidden={true}>{entity.EntityTypePropertyId}</td>
                                <td>{entity.EntityTypePropertyName}</td>
                                <td>{entity.Value}</td>
                                <td hidden={disabled}><span className="glyphicon glyphicon-remove delete-btn" onClick={this.removePropertiesMapFromList.bind(this, entity)}></span></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {this.state.propertyErrors.length > 0 && <p className="errors">{localResource.propertyErrors}</p>}
                {this.state.formErrors.length > 0 && this.state.formErrors.map(x => <p className="errors">{x}</p>)}
            </div>
            );
    }

    render() {
        return (
            <div id="admin-entity-connect">
                <div hidden={this.state.isAuthorized === false || this.state.isAuthorized === undefined} className="content-appear">
                    <h2 className="management-title">Manage Entities</h2>
                    <button type="button" className="btn btn-primary management-action-button" onClick={this.showCreateModal.bind(this)}>Add</button>
                    {this.getPaginationContent().length > 0 &&
                        <div>
                        <table className="table table-striped pbi-table">
                                <thead>
                                <tr>
                                    <td>Name</td>
                                    <td>Type</td>
                                    <td>Reports</td>
                                    <td>PBI Filter</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </thead>
                                <tbody>
                                {this.getPaginationContent().map(entity =>
                                    <tr key={entity.Id}>
                                        <td>{entity.EntityName}</td>
                                        <td>{entity.EntityTypeName}</td>
                                        <td>
                                        {
                                            //entity.Reports.lenght>0 &&
                                            entity.Reports.map(report => {
                                                return <div key={report.Id} className="table-report-item" title={report.Description}>{report.Title} </div>;
                                            })}
                                        </td>
                                        <td>
                                        {
                                            entity.EntityTypeProperties.map(property => {
                                                return <div key={property.Id} className="table-report-item">{property.EntityTypePropertyName} : {property.Value} </div>;
                                            })
                                        }
                                        </td>
                                        <td><span className="glyphicon glyphicon-edit edit-btn" onClick={this.showEditModal.bind(this, entity)}></span></td>
                                        <td><span className="glyphicon glyphicon-remove delete-btn" onClick={this.showDeleteModal.bind(this, entity)}></span></td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    }

                    { /*Edit MODAL*/}
                    <Modal show={this.state.editModalOpen} onHide={this.hideEditModal.bind(this)}>
                        <div className="modal-content">
                            <form id="createForm">
                                <div className="modal-header">
                                    <button type="button" className="close" aria-label="Close" onClick={this.hideEditModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                    <h4 className="modal-title">Edit</h4>
                                </div>
                                <div className="modal-body">
                                    {
                                        this.state.activeEntity !== null &&
                                        this.getSharedBody(false)
                                    }
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideEditModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.updateEntity.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    { /*ADD MODAL*/}
                    <Modal show={this.state.createModalOpen} onHide={this.hideCreateModal.bind(this)}>
                        <div className="modal-content">
                            <form id="createForm">
                                <div className="modal-header">
                                    <button type="button" className="close" aria-label="Close" onClick={this
                                        .hideCreateModal
                                        .bind(this)}><span aria-hidden="true">&times;</span></button>
                                    <h4 className="modal-title">Add</h4>
                                </div>
                                <div className="modal-body">
                                    {
                                        this.state.activeEntity !== null &&
                                        this.getSharedBody(false)
                                    }
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideCreateModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.addEntity.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Add'}</button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    { /*DELETE Modal*/}
                    <Modal show={this.state.deleteModalOpen} onHide={this.hideDeleteModal.bind(this)}>
                        <div className="modal-content">
                            <form id="deleteForm">
                                <div className="modal-header">
                                    <button type="button" className="close" aria-label="Close" onClick={this
                                        .hideDeleteModal
                                        .bind(this)}><span aria-hidden="true">&times;</span></button>
                                    <h4 className="modal-title">{localResource.modalDelete}</h4>
                                </div>
                                {this.state.activeEntity !== null &&
                                    <div className="modal-body">
                                        {
                                            this.state.activeEntity !== null &&
                                            <div className="modal-body">
                                                {this.state.isInuse !== null && this.state.isInuse === true && localResource.entityInuse}
                                                Are you sure you want to delete entity:
                                                <div><strong>{this.state.activeEntity.EntityName !== null && this.state.activeEntity.EntityName}</strong></div>
                                            </div>
                                        }
                                    </div>
                                }
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this
                                        .hideDeleteModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this
                                        .deleteEntity.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Delete'}</button>
                                </div>
                            </form>
                        </div>
                    </Modal>

                    { /*Pagging*/}
                    <div className="pagination">
                        <div>
                            <Pagination
                                prev
                                next
                                first
                                last
                                bsSize="small"
                                items={Math.ceil(this.state.entities.length / this.state.pageSize)}
                                activePage={this.state.activePage}
                                onSelect={this.handleSelect.bind(this)}/>
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
                </div>
            </div>
        );
    }
}


const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminEntityConnect, state.common);
    return State;

    //return {
    //reports: state.adminEntityConnect.reports,
    //entityDeleted: state.adminEntityConnect.entityDeleted,
    //entityTypes: state.adminEntityConnect.entityTypes,
    //entities: state.adminEntityConnect.entities,
    //entityTypeProperties: state.common.entityTypeProperties,
    //entityProperties: state.common.entityProperties
    //}
};
export default connect( mapStateToProps, CommonActionCreators )(AdminEntityConnect);