import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as AdminPbiReportsStore from '../../store/AdminPbiReports';
import * as CommonStore from '../../store/Common';
import { Modal, Pagination, OverlayTrigger, Tooltip, Radio } from 'react-bootstrap';
import { localResource, getDefaultOrCookiePageSize, saveCookiePageSize, commonFunctions } from '../../PublicFunctions';
import Loading from '../../components/Loading';

let CommonActionCreators = Object.assign({}, AdminPbiReportsStore.actionCreators, CommonStore.actionCreators);
type PbiReportsProps = AdminPbiReportsStore.PBIReportsState & CommonStore.CommonState & typeof CommonActionCreators;

export class AdminPbiReports extends React.Component<PbiReportsProps, any> {
    accessToken: string;
    embedUrl: string;
    reportId: string;
    constructor(props: PbiReportsProps) {
        super(props);
        this.state = {
            uploadModalIsOpen: false,
            deleteModalIsOpen: false,
            activeReport: null,
            location: null,
            reports: [],
            isInuse: false,
            inLoading: false,
            showConnectionStringInput: false,
            activePage: localResource.defaultActivePage,
            pageSize: getDefaultOrCookiePageSize(localResource.pbiReportCookieName),
            tooltips: [],
            errors: [],
            warnings: [],
            startup: true,
            IsPagesHidden: false
    };
    }

    componentWillMount() {
        if (sessionStorage.getItem('userRoles') === null) {
            this.props.getUserRoles();
        }
        this.props.getPbiReports();
        if (this.props.tooltips) {
            this.setState({ tooltips: this.props.tooltips });
        } else {
            this.props.getTooltips();
        }
        this.props.getLocation();
    }

    componentDidMount() {
        document.title = 'PBI App - Admin PBI Reports';
    }

    componentWillReceiveProps(nextProps, nextState) {
        //let rol = sessionStorage.getItem('userRoles') === null ? 
        let rolesList = sessionStorage.getItem('userRoles');
        if (rolesList) {
            this.setState({ userRoles: rolesList.split(',') });
        } else {
            if (nextProps.userRoles) {
                this.setState({ userRoles: nextProps.userRoles });
            }
        }
        if (this.state.userRoles || rolesList) {
            let userRoles = this.state.userRoles || rolesList.split(',');
            let auth = userRoles.filter(x => x === localResource.SystemAdmin).length > 0 ||
                userRoles.filter(x => x === localResource.ReportAdmin).length > 0 ||
                userRoles.filter(x => x === localResource.DataAdmin).length > 0;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }
            if (nextProps.tooltips) {
                this.setState({ tooltips: nextProps.tooltips });
            }
            if (nextProps.reportAdded) {
                this.props.getPbiReports();
                this.setState({ uploadModalIsOpen: false, inLoading: false, showConnectionStringInput: false, warnings: [] });
            }
            if (nextProps.reportAdded === false) {
                let errors = [];
                errors.push(nextProps.uploadPbiReportMessage);
                this.setState({ inLoading: false, errors: errors });
            }
            if (nextProps.reportDeleted) {
                this.props.getPbiReports();
                this.setState({ deleteModalIsOpen: false, inLoading: false, reportDeleted: false });
            }
            if (nextProps.pbiReportInused) {
                this.setState({ isInuse: nextProps.pbiReportInused });
            } else {
                this.setState({ isInuse: false });
            }
            this.setState({ reports: nextProps.reports });
            this.setState({ location: nextProps.location });
            this.setState({ startup: false });
        }
    }

    inputSelectChanged(e) {
        let fileName = e.target.files[0].name;
        let extentionName = fileName.substring(fileName.lastIndexOf('.'));
        if (extentionName.toLowerCase() !== '.pbix') {
            let errors = [];
            errors.push(localResource.pbiFileExtensionWarning);
            this.setState({
                warnings: errors
            });
        } else {
            this.setState({
                warnings: []
            });
        }
    }

    uploadModalBody() {
        return (
            <div>
                <div className="form-group">
                    <label htmlFor="file">Choose a pbix file: </label>
                    <input id="file" className="wide" onChange={this.inputSelectChanged.bind(this)} accept=".pbix" type="file" name="file" ref="file" required />
                </div>

                <div className="form-group">
                    <label htmlFor="reportName">Name: </label>
                    <input id="reportName" className="wide" name="reportName" type="text" />
                </div>
                <div className="form-group">
                    <label htmlFor="connectionstring">Custom connection: {this.getTooltipHtml('PbiReportConnectionStringTooltip')}</label>
                    <input id="connectionstringCheckbox" name="connectionstringCheckbox" type="checkbox" checked={this.state.showConnectionStringInput} onChange={this.showConnectionStringInput.bind(this)} />
                    {this.state.showConnectionStringInput && <input id="connectionstring" type="text" name="connectionstring" />}
                </div>
                <div className="form-group location">
                    <label htmlFor="IsPagesHidden">Show Report Page Menus: {this.getTooltipHtml('IsPagesHiddenTooltip')}</label>
                    <Radio name="IsPagesHidden" checked={!this.state.IsPagesHidden} onClick={this.handleSelectChange.bind(this, false)} value="false">Show</Radio>
                    <Radio name="IsPagesHidden" checked={this.state.IsPagesHidden} onClick={this.handleSelectChange.bind(this, true)} value="true">Hide</Radio>
                </div>
                {this.state.warnings.length > 0 && this.state.warnings.map(x => <p className="errors">{x}</p>)}
                {this.state.errors.length > 0 && <p className="errors">{this.state.errors.join(',')}</p>}
            </div>
        );
    }

    showConnectionStringInput() {
        this.state.showConnectionStringInput ? this.setState({ showConnectionStringInput: false }) : this.setState({ showConnectionStringInput: true });
    }


    handleSelectChange(isPagesHidden) {
        this.setState({ IsPagesHidden: isPagesHidden});
    }

    hideUploadModal() {
        if (this.state.inLoading) { return; }
        let uploadForm = document.getElementById('uploadForm') as HTMLFormElement;
        uploadForm.reset();
        this.setState({ uploadModalIsOpen: false, inLoading: false, errors: [], warnings: [] });
    }

    showUploadModal() {
        this.setState({ uploadModalIsOpen: true });
    }

    uploadFile(e) {
        this.setState({ inLoading: true, errors: [] });
        let reportFile = e.target.form.file.value;
        let reportName = e.target.form.elements.reportName.value;
        let connectionstring = e.target.form.elements.connectionstring ? encodeURIComponent(e.target.form.elements.connectionstring.value) : null;
        let errors = [];
        errors = this.validateAddedPBIFile(reportFile, reportName);
        if (errors.length === 0) {
            this.props.uploadPbiReport(e.target.form, reportName, connectionstring, this.state.IsPagesHidden);
        } else {
            this.setState({ errors: errors, inLoading: false });
        }
    }

    validateAddedPBIFile(reportFile, reportName) {
        let errors = [];
        if (reportFile === null || reportFile.length === 0) {
            errors.push(localResource.PBIfileUnavaliable);
        }

        if (reportName === null || reportName.trim().length === 0) {
            errors.push(localResource.PBIfileNameUnavaliable);
        }
        return errors;
    }

    hideDeleteModal() {
        this.setState({ deleteModalIsOpen: false });
    }

    showDeleteModal(report) {
        this.props.checkFileInuse(report.ReportId);
        this.setState({ deleteModalIsOpen: true, activeReport: report });
    }

    deleteReport() {
        this.setState({ inLoading: true });
        this.props.deletePBIReport(this.state.activeReport.DatasetId, this.state.activeReport.IsPremium);
    }

    handleSelect(eventKey) {
        this.setState({ activePage: eventKey });
    }

    getPaginationContent() {
        let actPag = this.state.activePage;
        let pagSize = this.state.pageSize;
        return this.state.reports.slice((actPag - 1) * pagSize, actPag * pagSize);
    }

    changePageSize(event) {
        saveCookiePageSize(localResource.pbiReportCookieName, event.target.value);
        this.setState({ pageSize: event.target.value, activePage: 1 });
    }

    getTooltipHtml(elementId) {
        let tooltipTxt = commonFunctions.getCommonTooltip(elementId, this.state.tooltips);
        if (tooltipTxt.length > 0)
            return (
                <OverlayTrigger placement="top" overlay={<Tooltip className={ tooltipTxt.length > 200 && 'myTooltip' } id="reportConnectTitleTooltip">{tooltipTxt}</Tooltip>}>
                    <span className="glyphicon tooltipAfterText glyphicon-question-sign"></span>
                </OverlayTrigger>
            );
        return (<span></span>);
    }

    render() {
        return (
            <div id="admin-pbi-reports">
                {this.state.startup === true &&
                    <div className="loading-animation">
                        <Loading />
                    </div>
                }
                {this.state.isAuthorized === true &&
                    <div className="content-appear">

                            <h2 className="management-title">Manage Files</h2>
                            <p className="pbi-report-location">The location of your files is {this.state.location}</p>
                            <div>
                                <button type="button" className="btn btn-primary management-action-button" onClick={this.showUploadModal.bind(this)}>Upload file</button>
                                <table className="table table-striped pbi-table">
                                    <thead>
                                        <tr>
                                            <td>File name</td>
                                            <td>File</td>
                                            <td className="text-align">Used in reports</td>
                                            <td className="text-align">Version</td>
                                            <td>Direct Query</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.getPaginationContent().map(report =>
                                            <tr key={report.ReportId}>
                                                <td>{report.ReportName}</td>
                                                <td>{report.ReportId}</td>
                                                <td className={report.UsedInReports > 0 ? "used-in-reports" : "no-report"}>{report.UsedInReports}</td>
                                                <td className="text-align">{report.Version}</td>
                                                <td>{report.Externaldata && <span className="glyphicon glyphicon-ok"></span>}</td>
                                                <td><span className="glyphicon glyphicon-remove delete-btn" onClick={this.showDeleteModal.bind(this, report)}></span></td>
                                                <td>{report.ReportLocationShortName}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/*Upload modal*/}
                            <Modal onHide={this.hideUploadModal.bind(this)} show={this.state.uploadModalIsOpen} >
                                <div className="modal-content">
                                    <form id="uploadForm">
                                        <div className="modal-header">
                                            <button type="button" className="close" aria-label="Close" onClick={this.hideUploadModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                            <h4 className="modal-title">Upload pbi report</h4>
                                        </div>
                                        <div className="modal-body">
                                            {this.uploadModalBody()}
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" onClick={this.hideUploadModal.bind(this)}>{localResource.modalCancel}</button>
                                            <button type="button" className="btn btn-primary" onClick={(e) => this.uploadFile(e)}>{this.state.inLoading ? <div className="loader"></div> : localResource.modalSave}</button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>

                            {/*Delete mdoal*/}
                            <Modal show={this.state.deleteModalIsOpen} onHide={this.hideDeleteModal.bind(this)}>
                                <div className="modal-content">
                                    <form id="uploadForm">
                                        <div className="modal-header">
                                            <button type="button" className="close" aria-label="Close" onClick={this.hideDeleteModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                            <h4 className="modal-title">Delete pbi report</h4>
                                        </div>
                                        <div className="modal-body">
                                            {this.state.isInuse != null && this.state.isInuse === true && localResource.fileInuse} Are you sure you want to delete file :
                                            <div><strong> {this.state.activeReport != null && this.state.activeReport.ReportName} </strong></div>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-default" onClick={this.hideDeleteModal.bind(this)}>{localResource.modalCancel}</button>
                                            <button type="button" className="btn btn-primary" onClick={this.deleteReport.bind(this)} >{this.state.inLoading ? <div className="loader"></div> : 'Delete'}</button>
                                        </div>
                                    </form>
                                </div>
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

//export default connect(
//    (state: ApplicationState) => state.adminPbiReports,
//    AdminPbiReportsStore.actionCreators
//)(AdminPbiReports);

const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminPbiReports, state.common);
    return State;
};
export default connect(mapStateToProps, CommonActionCreators)(AdminPbiReports);