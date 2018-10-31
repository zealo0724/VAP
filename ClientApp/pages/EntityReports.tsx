import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as pbi from 'powerbi-client';
import * as ReportsStore from '../store/Reports';
import { localResource } from '../PublicFunctions';
import { Report } from '../components/Report';

type ReportProps = ReportsStore.ReportsState & typeof ReportsStore.actionCreators;

export class EntityReports extends React.Component<ReportProps, any> {
    accessToken: string;
    embedUrl: string;
    reportId: string;
    constructor(props: any) {
        super(props);
        this.state = {
            pages: [],
            entity: null,
            reportId: '',
            activeReport: 0,
            pbiReport: null,
            pageInLoading: true,
            fullScreenMode: undefined,
            noReport: false,
            currentReport: null
    };
    }

    componentWillMount() {
        this.entityInfo();
        this.addFullScreenListener();
    }

    componentDidMount() {
        document.title = 'PBI App - Reports';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.pbiReport) {
            this.setState({
                pbiReport: nextProps.pbiReport
            });
        }
        if (nextProps.RequestDone && nextProps.entity) {
            if (nextProps.entity.Reports.length === 0) {
                this.setState({ noReport: true });
            } else {
                if (this.state.entity === null &&
                    nextProps.entity &&
                    nextProps.entity.Reports !== null &&
                    nextProps.entity.Reports !== undefined &&
                    nextProps.entity.Reports.length > 0) {
                    this.setActiveReport(0, nextProps.entity.Reports[0], nextProps.entity.Id);
                }
            }
        }
        
        this.setState({
            entity: nextProps.entity ? nextProps.entity : this.state.entity,
            pageInLoading: false
        });
        if (sessionStorage.getItem('userRoles') !== null) {
            let auth = sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1 ||
                sessionStorage.getItem('userRoles').indexOf('ReportAdmin') > -1 ||
                sessionStorage.getItem('userRoles').indexOf('DataReader') > -1;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }
        }
    }

    entityInfo() {
        this.props.requestEntity(this.props.match.params.id);
    }

    handleReportChange(activeReport, event) {
        this.setState({ pages: [] });
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        this.setActiveReport(index, activeReport, this.state.entity.Id); //entity.Id : EntityTree Id
    }

    setActiveReport(index, activeReport, entityTreeId) {
        this.props.requestReport(activeReport.Id, entityTreeId);
        this.setState({ activeReport: index, reportId: activeReport.Id, currentReport: activeReport });
    }

    isActive(index) {
        return index === this.state.activeReport ? 'active activeReportMenu' : '';
    }

    existFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    enterFullscreen() {
        let elem = document.body.querySelector('.fullscreenContainer');
        let methodToBeInvoked = elem.requestFullscreen ||
            elem.webkitRequestFullScreen ||
            elem['mozRequestFullscreen'] ||
            elem['msRequestFullscreen'];
        if (methodToBeInvoked)
            methodToBeInvoked.call(elem);
    }

    changeFullscreenSize() {
        if (this.state.fullScreenMode) { //document.webkitIsFullScreen) {
            document.body.querySelector(".powerbi-frame").setAttribute("style", "height: " + (screen.height - (document.body.querySelector(".navbar-dnvgl").clientHeight + 73
                + (document.body.querySelector(".report-tabs").clientHeight == 0 ? 22 : document.body.querySelector(".report-tabs").clientHeight)) + "px"));
        } else {
            document.body.querySelector(".powerbi-frame").setAttribute("style", "height: 644px");
        }
    }

    fullScreenClick() {
        if (this.state.fullScreenMode === undefined) {
            this.enterFullscreen();
        }
        else if (this.state.fullScreenMode) {
            this.existFullScreen();
        } else {
            this.enterFullscreen();
        }
    }

    excuteFullscreen() {
        this.setState({ fullScreenMode: !this.state.fullScreenMode });
        this.changeFullscreenSize();
    }

    addFullScreenListener() {
        document.addEventListener("fullscreenchange", this.excuteFullscreen.bind(this), true);
        document.addEventListener('webkitfullscreenchange', this.excuteFullscreen.bind(this), true);
        document.addEventListener('mozfullscreenchange', this.excuteFullscreen.bind(this), true);
        document.addEventListener('MSFullscreenChange', this.excuteFullscreen.bind(this), true);
    }

    getFullScreenClass() {
        if (this.state.fullScreenMode === true) {
            return "container fullScreenMode";
        } else {
            return "container";
        }
    }

    render() {
        let home = sessionStorage.getItem('tenant');
        return (this.state.entity !== null &&
            <div className="fullscreenContainer content-appear">
            <nav className="navbar navbar-dnvgl report-tab-menu">
                    <div className="container">
                        {<div id="navbar" className="navbar-collapse collapse" aria-expanded="false">
                            {/*<div href="#" className="dropdown-toggle notification-item pull-right" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <div className="badge badge-info">3</div> Tore Tang <span className="caret"></span>
                            </div>*/}
                            <div className="dropdown-menu"><p>Hello</p></div>
                            <ul className="nav navbar-nav report-nav">
                            <li><a href={'/' + home} className={this.isActive(-1)}>Home</a></li>
                                {this.state.entity.Reports.map(function (report, index) {
                                return <li><a key={index} data-index={index} className={this.isActive(index)} onClick={this.handleReportChange.bind(this, report)}> {report.MenuName} </a></li>;
                                }.bind(this))}
                                <div>
                                    <a onClick={this.fullScreenClick.bind(this)} id="toggle_fullscreen">{this.state.fullScreenMode ? 'Exit Full screen' : 'Full screen'}<span className="fullscreen pull-right glyphicon glyphicon-fullscreen"></span></a>
                                </div>
                            </ul>
                        </div>}
                    </div>
                </nav>
                <div className={this.getFullScreenClass()}>
                    <div className="col-sm-12">
                    <div id="entity-reports">
                        {this.state.noReport
                            ? <div><p className="noReportError">{localResource.emptyEntity}</p></div>
                            : <Report entityName={this.state.entity.EntityName} report={this.state.pbiReport} currentReport={this.state.currentReport}/>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    (state: ApplicationState) => state.reports,
    ReportsStore.actionCreators
)(EntityReports);

// export default connect(
//     (state: ApplicationState) => state.report,
//     ReportStore.actionCreators
// )(EntityReports);
