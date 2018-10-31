import * as React from 'react';
// import * as ReactBootstrap from 'react-bootstrap';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as AdminReportConnectStore from '../../store/AdminReportConnect';
import * as CommonStore from '../../store/Common';
import { Modal, Pagination, OverlayTrigger, Tooltip, Checkbox } from 'react-bootstrap';
import { localResource, getDefaultOrCookiePageSize, saveCookiePageSize, commonFunctions, getCustomTitleStyle } from '../../PublicFunctions';
let CommonActionCreators = Object.assign({}, AdminReportConnectStore.actionCreators, CommonStore.actionCreators);
type PbiReportsProps = AdminReportConnectStore.ReportConnectState & CommonStore.CommonState & typeof CommonActionCreators;

export class AdminReportConnect extends React.Component<PbiReportsProps, any> {
    constructor(props: PbiReportsProps) {
        super(props);
        this.state = {
            reports: [],
            entityTypeProperties: [],
            pbiFiles: [],
            filteredPbiFiles: [],
            editModalOpen: false,
            deleteModalOpen: false,
            activeReport: null,
            createModalOpen: false,
            formErrors: [],
            activePage: localResource.defaultActivePage,
            pageSize: getDefaultOrCookiePageSize(localResource.ReportConnectCookieName),
            tooltips: [],
            isInuse: false,
            inLoading: false,
            operateAvaliable: true
        };
    }

    componentWillMount() {
        this.props.getReports();
        this.props.getPbiFiles();
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
        document.title = sessionStorage.getItem('tenant') + ' - Admin Connect Reports';
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
                this.state.userRoles.filter(x => x === localResource.ReportAdmin).length > 0 ||
                this.state.userRoles.filter(x => x === localResource.DataAdmin).length > 0;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }

            if (nextProps.tooltips !== undefined && nextProps.tooltips !== null) {
                this.setState({ tooltips: nextProps.tooltips });
            }
            if (nextProps.reportUpdated) {
                this.props.getReports();
                this.setState({ editModalOpen: false, inLoading: false });
            }
            if (nextProps.reportAdded) {
                this.props.getReports();
                this.setState({ createModalOpen: false, activeReport: null, reportAdded: false, inLoading: false });
            }
            if (nextProps.reportDeleted) {
                this.props.getReports();
                this.setState({ deleteModalOpen: false, activeReport: null, reportDeleted: false, inLoading: false });
            }
            if (nextProps.pbiReportConnectInused) {
                this.setState({ isInuse: nextProps.pbiReportConnectInused });
            } else {
                this.setState({ isInuse: false });
            }
            if (nextProps.entityTypeProperties) {
                this.setState({ entityTypeProperties: nextProps.entityTypeProperties });
            }
            if (nextProps.pbiFiles) {
                let pbiFiles = nextProps.pbiFiles;
                let filtered = pbiFiles.filter(x => x.IsPremium === true);
                if (filtered.length > 0) {
                    this.setState({ filteredPbiFiles: filtered, formErrors: [] });
                }
            }

            this.setState({ reports: nextProps.reports, pbiFiles: nextProps.pbiFiles });
        }
    }

    showEditModal(report) {
        if (report.PowerBiReportId && this.state.pbiFiles.filter(x => x.ReportId === report.PowerBiReportId).length > 0 &&
            this.state.pbiFiles.filter(x => x.ReportId === report.PowerBiReportId)[0].IsPremium === false) {
            this.setState({ formErrors: localResource.currentReportOld, operateAvaliable: false });
        } else {
            this.setState({ formErrors: [], operateAvaliable: true });
        }

        if (report.ShowEntityName === false &&
            report.ShowPageName === false &&
            report.ShowReportName === false) {
            report['HideCustomTitle'] = true;
        } else {
            report['HideCustomTitle'] = false;
        }

        this.setState({ editModalOpen: true, activeReport: report });
    }

    showDeleteModal(report) {
        this.props.checkReportConnectInuse(report.Id);
        this.setState({ deleteModalOpen: true, activeReport: report });
    }

    hideEditModal() {
        this.setState({ editModalOpen: false, activeReport: null, formErrors: [] });
    }

    hideDeleteModal() {
        this.setState({ deleteModalOpen: false, activeReport: null, formErrors: [] });
    }

    updateReport() {
        if (this.activeReportIsValid()) {
            this.setState({ inLoading: true });
            this.props.updateReport(this.state.activeReport);
        }
    }

    deleteReport() {
        if (this.activeReportIsValid()) {
            this.props.deleteReport(this.state.activeReport);
        }
    }

    findPbiFilesName(id) {
        let file = this.state.pbiFiles.filter(function (obj) {
            return obj.ReportId === id;
        });
        return file.length > 0 ? file[0].ReportName : '';
    }

    showCreateModal() {
        this.setState({
            createModalOpen: true, activeReport: {
                Description: '',
                Id: null,
                IsShown: true,
                MenuName: '',
                PowerBiReportId: 0,
                Title: '',
                EntityFilter: '',
                EntityTypeProperty: '',
                EntityTypePropertyId: '',
                IsEffectiveIdentityRolesRequired: false,
                IsEffectiveIdentityRequired: false,
                HideCustomTitle: true,
                ShowEntityName: false,
                ShowReportName: false,
                ShowPageName: false

            }
        });
        if (this.state.filteredPbiFiles.length === 0) {
            this.setState({ formErrors: [localResource.noPremiumRport] });
        } else {
            this.setState({ formErrors: [] });
        }
    }

    handleCustomTitleChange(val) {
        let active = Object.assign({}, this.state.activeReport);
        active['HideCustomTitle'] = !this.state.activeReport.HideCustomTitle;
        active['ShowEntityName'] = this.state.activeReport.HideCustomTitle;
        active['ShowReportName'] = this.state.activeReport.HideCustomTitle;
        active['ShowPageName'] = this.state.activeReport.HideCustomTitle;

        this.setState({ activeReport: active });
    }

    handleShowEntityNamechange(val) {
        let active = Object.assign({}, this.state.activeReport);
        let current = this.state.activeReport.ShowEntityName;
        active['ShowEntityName'] = !current;

        if (current && !this.state.activeReport.ShowReportName && !this.state.activeReport.ShowPageName) {
            active['HideCustomTitle'] = true;
        }
        this.setState({ activeReport: active });
    }

    handleShowReportNamechange(val) {
        let active = Object.assign({}, this.state.activeReport);
        let current = this.state.activeReport.ShowReportName;
        active['ShowReportName'] = !current;

        if (!this.state.activeReport.ShowEntityName && current && !this.state.activeReport.ShowPageName) {
            active['HideCustomTitle'] = true;
        }
        this.setState({ activeReport: active });
    }

    handleShowPageNamechange(val) {
        let active = Object.assign({}, this.state.activeReport);
        let current = this.state.activeReport.ShowPageName;
        active['ShowPageName'] = !current;

        if (!this.state.activeReport.ShowEntityName && !this.state.activeReport.ShowReportName && current) {
            active['HideCustomTitle'] = true;
        }
        this.setState({ activeReport: active });
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

    hideCreateModal() {
        this.setState({ createModalOpen: false, activeReport: null, formErrors: [] });
    }

    reportForm(isDisabled, isAddModal) {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="Title">Title:{this.getTooltipHtml('reportConnectTitleTooltip')}
                    </label>
                    <input name="Title" type="text" disabled={isDisabled} className="wide" value={this.state.activeReport.Title} onChange={this.handleModalInputChange.bind(this)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="MenuName">Menu name:{this.getTooltipHtml('reportConnectMenuNameTooltip')}
                    </label>
                    <input name="MenuName" type="text" disabled={isDisabled} className="wide" value={this.state.activeReport.MenuName} onChange={this.handleModalInputChange.bind(this)} required />
                </div>

                <div className="form-group CustomTitle">
                    <label htmlFor="CustomTitle">Custom Title: {this.getTooltipHtml('ReportCustomTitleTooltip')}</label>
                    <div><Checkbox name="HideCustomTitle" checked={this.state.activeReport.HideCustomTitle} value="Hide Custom Report Title" onChange={this.handleCustomTitleChange.bind(this)}>Hide Custom Report Title</Checkbox></div>
                    {!this.state.activeReport.HideCustomTitle &&
                        <div>
                            <div className="CustomTitleContent">
                            <Checkbox name="ShowEntityName" disabled={this.state.activeReport.HideCustomTitle} checked={this.state.activeReport.ShowEntityName} value="Show Entity Name" onChange={this.handleShowEntityNamechange.bind(this)}>Show Entity Name</Checkbox>
                            <Checkbox name="ShowReportName" disabled={this.state.activeReport.HideCustomTitle} checked={this.state.activeReport.ShowReportName} value="Show Report Name" onChange={this.handleShowReportNamechange.bind(this)}>Show Report Name</Checkbox>
                            <Checkbox name="ShowPageName" disabled={this.state.activeReport.HideCustomTitle} checked={this.state.activeReport.ShowPageName} value="Show Page Name" onChange={this.handleShowPageNamechange.bind(this)}>Show Page Name</Checkbox>
                            </div>
                            <div>Title Style: {getCustomTitleStyle(this.state.activeReport.ShowEntityName, 'Entity Name', this.state.activeReport.ShowReportName, 'Report Name', this.state.activeReport.ShowPageName, 'Page Name')}</div>
                        </div>}
                </div>

                <div className="form-group">
                    <label htmlFor="Description">Description:{this.getTooltipHtml('reportConnectDescriptionTooltip')}
                    </label>
                    <input name="Description" type="text" disabled={isDisabled} className="wide" value={this.state.activeReport.Description} onChange={this.handleModalInputChange.bind(this)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="PowerBiReportId">Power BI file:{this.getTooltipHtml('reportConnectPBIFilesTooltip')}
                    </label>
                    <select name="PowerBiReportId" disabled={isDisabled} value={this.state.activeReport.PowerBiReportId} onChange={this.handleModalInputChange.bind(this)} required>
                        <option value=""></option>
                        {!isAddModal && this.state.pbiFiles.map(file => <option key={file.ReportId} value={file.ReportId}>{file.ReportName}{!file.IsPremium && ' *'}</option>)}
                        {isAddModal && this.state.filteredPbiFiles.map(file => <option key={file.ReportId} value={file.ReportId}>{file.ReportName}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="EntityFilter">PBI Filter Name:{this.getTooltipHtml('reportConnectEntityFilterTooltip')}
                    </label>
                    <input name="EntityFilter" type="text" disabled={isDisabled} className="wide" value={this.state.activeReport.EntityFilter} onChange={this.handleModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label htmlFor="EntityTypePropertyId">Filter Value:{this.getTooltipHtml('reportConnectFilterValueTooltip')}
                    </label>
                    <select name="EntityTypePropertyId" disabled={isDisabled} value={this.state.activeReport.EntityTypePropertyId} onChange={this.handleModalInputChange.bind(this)} required>
                        <option value=""></option>
                        {this.state.entityTypeProperties !== undefined && this.state.entityTypeProperties.map(tp => <option key={tp.Id} value={tp.Id}>{tp.Name}</option>)}
                    </select>
                </div>
                {this.state.formErrors.length > 0 && this.state.formErrors.map(x => <p className="errors">{x}</p>)}
            </div>
        );
    }

    addReport() {
        if (this.activeReportIsValid()) {
            this.setState({ inLoading: true });
            this.props.addReport(this.state.activeReport);
        }
    }

    activeReportIsValid() {
        let form = this.state.activeReport;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                //if ((form[property] === '' || form[property] === null) && property !== 'Id'
                //    && property !== 'EntityTypeProperty' && property !== 'EntityTypePropertyId' && property !== 'EntityFilter') {
                //    errorFields.push(property);
                //}
                
                if (property === 'EntityFilter' && form[property] === '') {
                    if (form.IsEffectiveIdentityRolesRequired === true
                        || this.state.pbiFiles.some(x => x.ReportId === form.PowerBiReportId && x.IsEffectiveIdentityRolesRequired === true)) {
                        errorFields.push(localResource.filterRequired);
                    }

                }
                if ((form[property] === '' || form[property] === null) && property === 'Title') {
                    errorFields.push(localResource.titleRequired);
                }
                if ((form[property] === '' || form[property] === null) && property === 'MenuName') {
                    errorFields.push(localResource.reportNameRequired);
                }
                if (property === 'PowerBiReportId') {
                    if (form[property] === '' || form[property] === 0) {
                        errorFields.push(localResource.reportRequired);
                    }
                }
            }
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    handleModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        let active = Object.assign({}, this.state.activeReport);
        active[name] = value;
        if (name === 'PowerBiReportId') {
            if (this.isPremiumReport(active)) {
                active["IsPremiumReport"] = true;
            }
            active = this.checkIsHaveFilter(active);
        }
        this.setState({
            activeReport: active
        });
    }

    isPremiumReport(activeReport) {
        let activeRpt = activeReport || this.state.activeReport;
        if (activeRpt.PowerBiReportId && this.state.filteredPbiFiles.filter(x => x.ReportId === activeRpt.PowerBiReportId).length === 0) {
            this.setState({ formErrors: localResource.currentReportOld, operateAvaliable: false });
            return false;
        } else {
            this.setState({ formErrors: [], operateAvaliable: true });
            return true;
        }
    };

    checkIsHaveFilter(activeRpt) {
        let selectedPbiRep = this.state.filteredPbiFiles.filter(x => x.ReportId === activeRpt.PowerBiReportId);
        if (selectedPbiRep && selectedPbiRep.length > 0) {
            activeRpt.IsEffectiveIdentityRequired = selectedPbiRep[0].IsEffectiveIdentityRequired;
            activeRpt.IsEffectiveIdentityRolesRequired = selectedPbiRep[0].IsEffectiveIdentityRolesRequired;
        }
        return activeRpt;
    };

    handleSelect(eventKey) {
        this.setState({ activePage: eventKey });
    }

    getPaginationContent() {
        let actPag = this.state.activePage;
        let pagSize = this.state.pageSize;
        return this.state.reports.slice((actPag - 1) * pagSize, actPag * pagSize);
    }

    changePageSize(event) {
        saveCookiePageSize(localResource.ReportConnectCookieName, event.target.value);
        this.setState({ pageSize: event.target.value, activePage: 1 });
    }

    render() {
        return (
            <div id="admin-report-connect">
                {this.state.isAuthorized === true &&
                    <div className="content-appear">
                        <h2 className="management-title">Manage Reports</h2>
                        <button type="button" className="btn btn-primary management-action-button" onClick={this.showCreateModal.bind(this)}>Create new report</button>
                        { /*Should show table if there are no reports to connect to?*/}
                        { /*{(this.state.reports.length > 0 && this.state.pbiFiles.length > 0) &&*/}
                        {(this.state.reports.length > 0) &&
                            <div>
                                <table className="table table-striped pbi-table">
                                    <thead>
                                        <tr>
                                            <td>Report Name</td>
                                            <td>Display Name</td>
                                            <td>Description</td>
                                            <td>PBI File</td>
                                            <td>PBI Filter Name</td>
                                            <td>Filter Value</td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.getPaginationContent().map(report =>
                                            <tr key={report.Id}>
                                                <td>{report.Title}</td>
                                                <td>{report.MenuName}</td>
                                                <td>{report.Description}</td>
                                                <td>{this.findPbiFilesName(report.PowerBiReportId)}</td>
                                                <td>{report.EntityFilter}</td>
                                                <td>{report.EntityTypeProperty}</td>
                                                <td>
                                                    <span className="glyphicon glyphicon-edit edit-btn" onClick={this.showEditModal.bind(this, report)}></span>
                                                    <span className="glyphicon glyphicon-remove delete-btn" onClick={this.showDeleteModal.bind(this, report)}></span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        }


                        { /*EDIT MODAL*/}
                        <Modal show={this.state.editModalOpen} onHide={this.hideEditModal.bind(this)}>
                            <div className="modal-content">
                                <form id="editForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideEditModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Edit</h4>
                                    </div>
                                    <div className="modal-body">
                                        {
                                            this.state.activeReport !== null &&
                                            this.reportForm(false, false)
                                        }
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideEditModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button disabled={!this.state.operateAvaliable} type="button" className="btn btn-primary" onClick={this.updateReport.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : localResource.modalSave}</button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        { /*DELETE MODAL*/}
                        <Modal show={this.state.deleteModalOpen} onHide={this.hideDeleteModal.bind(this)}>
                            <div className="modal-content">
                                <form id="deleteForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideDeleteModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Delete</h4>
                                    </div>
                                    {
                                        this.state.activeReport !== null &&
                                        <div className="modal-body">
                                            {this.state.isInuse !== null && this.state.isInuse === true && localResource.reportConnectInuse}
                                            Are you sure you want to delete report:
                                                <div><strong>{this.state.activeReport.Title !== null && this.state.activeReport.Title}</strong></div>
                                        </div>
                                    }
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideDeleteModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" className="btn btn-primary" onClick={this.deleteReport.bind(this)}>{localResource.modalDelete}</button>
                                    </div>
                                </form>
                            </div>
                        </Modal>

                        { /*CREATE MODAL*/}
                        <Modal show={this.state.createModalOpen} onHide={this.hideCreateModal.bind(this)}>
                            <div className="modal-content">
                                <form id="createForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideCreateModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Create Report</h4>
                                    </div>
                                    <div className="modal-body">
                                        {
                                            this.state.activeReport !== null &&
                                            this.reportForm(false, true)
                                        }

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideCreateModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" className="btn btn-primary" onClick={this.addReport.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Add'}</button>
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
                                    items={Math.ceil(this.state.reports.length / this.state.pageSize)}
                                    activePage={this.state.activePage}
                                    onSelect={this.handleSelect.bind(this)}
                                />
                            </div>
                            <div className="pagenationPagesize">
                                <span>Page Size: </span>
                                <select name="ChangePageSize" value={this.state.pageSize} onChange={this.changePageSize.bind(this)} >
                                    <option value={localResource.pageSize.small}>{localResource.pageSize.small}</option>
                                    <option value={localResource.pageSize.mid}>{localResource.pageSize.mid}</option>
                                    <option value={localResource.pageSize.big}>{localResource.pageSize.big}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminReportConnect, state.common);
    return State;
};

export default connect(mapStateToProps, CommonActionCreators)(AdminReportConnect);

