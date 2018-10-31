import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import {OverlayTrigger,Tooltip} from 'react-bootstrap'
import { ApplicationState } from '../../store';
import * as CommonStore from '../../store/Common';
import { commonFunctions } from '../../PublicFunctions';

type AdminProps = CommonStore.CommonState
    & typeof CommonStore.actionCreators;

export class Administration extends React.Component<AdminProps, any> {

    constructor(props: AdminProps) {
        super(props);
        this.state = {
            tooltips: []
        };
    }
    componentWillMount() {
        document.title = sessionStorage.getItem('tenant') + ' - Administration';
        if (this.props.tooltips === undefined) {
            this.props.getTooltips();
        } else {
            this.setState({ tooltips: this.props.tooltips });
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.tooltips !== undefined && nextProps.tooltips !== null && nextProps.tooltips.length > 0) {
            this.setState({ tooltips: nextProps.tooltips });
        }
    }

    getTooltipHtml(elementId) {
        let tooltipTxt = commonFunctions.getCommonTooltip(elementId, this.state.tooltips);
        if (tooltipTxt.length > 0)
            return (
                <OverlayTrigger placement="top" overlay={<Tooltip className={tooltipTxt.length > 200 && 'myTooltip'} id="reportConnectTitleTooltip">{tooltipTxt}</Tooltip>}>
                    <span className="glyphicon exclamation glyphicon-question-sign"></span>
                </OverlayTrigger>
            );
        return (<span></span>);
    }

    public render() {
        return (
            <div id="admin-page">
                <div className="row admin-block-row content-appear">
                    {sessionStorage.getItem('userRoles') !== null && (
                    sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('ReportAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('DataAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('SuperTenantAdmin') > -1
                    )
                    &&
                    <div className="col-md-3 col-xs-6">
                        <NavLink exact to={'/' + sessionStorage.getItem('tenant') + '/administration/pbi-reports'}>
                            <div className="admin-block ">{this.getTooltipHtml('pbiReportsTooltip')}
                                <span className="glyphicon glyphicon-signal r-content"></span>
                                    <h3>Manage Files</h3>
                                    <p>Upload and delete Power BI files</p>
                                </div>
                        </NavLink>
                    </div>}
                    {sessionStorage.getItem('userRoles') !== null && (
                    sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('ReportAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('DataAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('SuperTenantAdmin') > -1
                    )
                    &&
                    <div className="col-md-3 col-xs-6">
                        <NavLink exact to={'/' + sessionStorage.getItem('tenant') + '/administration/report-connect'}>
                            <div className="admin-block">
                                {this.getTooltipHtml('manageReportsTooltip')}
                                <span className="glyphicon glyphicon-link r-content"></span>
                                <h3>Manage Reports</h3>
                                <p>Create reports and connect them to Power BI files</p>
                            </div>
                        </NavLink>
                    </div>}

                    {sessionStorage.getItem('userRoles') !== null && (
                    sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('DataAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('SuperTenantAdmin') > -1
                    )
                    &&
                    <div className="col-md-3 col-xs-6">
                        <NavLink exact to={'/' + sessionStorage.getItem('tenant') + '/administration/entity-connect'}>
                            <div className="admin-block">{this.getTooltipHtml('manageEntitiesTooltip')}
                                <span className="glyphicon glyphicon-eye-open r-content"></span>
                                <h3>Manage Entities</h3>
                                <p>Create entities and connect to reports</p>
                            </div>
                        </NavLink>
                    </div>}

                    {sessionStorage.getItem('userRoles') !== null && (
                           sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1
                        || sessionStorage.getItem('userRoles').indexOf('UserAdmin') > -1
                        || sessionStorage.getItem('userRoles').indexOf('SuperTenantAdmin') > -1
                    )
                    &&
                    <div className="col-md-3 col-xs-6">
                        <NavLink exact to={'/' + sessionStorage.getItem('tenant') + '/administration/user-access'}>
                            <div className="admin-block">{this.getTooltipHtml('manageUsersTooltip')}
                                <span className="glyphicon glyphicon-user r-content"></span>
                                <h3>Manage Users</h3>
                                <p>Create users and assign access</p>
                            </div>
                        </NavLink>
                    </div>}
                    {sessionStorage.getItem('userRoles') !== null && (sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1
                    || sessionStorage.getItem('userRoles').indexOf('SuperTenantAdmin') > -1)
                    &&
                    <div className="col-md-3 col-xs-6">
                        <NavLink exact to={'/' + sessionStorage.getItem('tenant') + '/administration/config'}>
                            <div className="admin-block">{this.getTooltipHtml('configureTooltip')}
                                <span className="glyphicon glyphicon-cog r-content"></span>
                                <h3>Configure</h3>
                                <p>Configure scaffolding and properties</p>
                            </div>
                        </NavLink>
                    </div>}
                </div>
            </div>);
    }
}

//const mapStateToProps = (state: ApplicationState) => {
//    const State = Object.assign({}, state.entities, state.common);
//    return State;
//};

//export default Administration;

 export default connect(
    (state: ApplicationState) => state.common,
     CommonStore.actionCreators
 )(Administration);
