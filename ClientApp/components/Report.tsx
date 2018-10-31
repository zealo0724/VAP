import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as ReportStore from '../store/Report';
import * as pbi from 'powerbi-client';
import { localResource, getCustomTitleStyle } from '../PublicFunctions';
//import * as Powerbiclient from "powerbi-client";
declare var powerbi: pbi.service.Service;

export class Report extends React.Component<any, any> {
    component: pbi.Embed;
    rootElement: HTMLElement;
    config: pbi.IEmbedConfiguration;
    report: pbi.Report;
    constructor(props) {
        super(props);
        this.config = {};
        this.config.settings = {};
        this.state = {
            pages: [],
            activePage: 0,
            entityName: null,
            reportInLoading: false,
            IsPagesHidden: false,
            currentReport: null,
            activePageTitle: null,
            report: null
        };
    }

    componentWillMount() {
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.entityName) {
            this.setState({ entityName: nextProps.entityName });
        }

        if (nextProps.report) {
            let newReport = nextProps.report;
            
            if (newReport.Id !== this.config.id || nextProps.currentReport !== this.state.currentReport) {

                //if switch between old report and premium report
                if (this.config.embedUrl
                    && newReport.EmbededUrl
                    && newReport.EmbededUrl.split('/').filter(x => x.indexOf('.com') >= 0)[0] !== this.config.embedUrl.split('/').filter(x => x.indexOf('.com') >= 0)[0]) {
                    powerbi.reset(this.rootElement);
                }

                this.setState({ IsPagesHidden: newReport.IsPagesHidden });
                this.setConfig(newReport);
            }

            this.setState({ report: newReport });
        }

        if (nextProps.currentReport) {
            this.setState({ currentReport: nextProps.currentReport });
        }
    }

    componentDidUpdate() {
       
    }

    setConfig(report) {
        this.config.type = report.ReportType;
        this.config.tokenType = pbi.models.TokenType.Embed;
        this.config.accessToken = report.AccessToken;
        this.config.embedUrl = report.EmbededUrl;
        this.config.id = report.Id;
        this.config.permissions = pbi.models.Permissions.All;
        this.config.settings.filterPaneEnabled = false;
        this.config.settings.navContentPaneEnabled = false;
        //this.config.settings.background = pbi.models.BackgroundType.Transparent;

        // this.updateState(this.props);
        this.loadReport();

    }

    loadReport() {
        this.setState({ reportInLoading: true });
        this.report = this.embed(this.config) as pbi.Report;
        this.report.on('loaded', (e) => {
                this.loadPages(this.report);
            });
    }

    loadPages(report: pbi.Report) {
        report.getPages().then(pages => {
            pages = pages.filter(x => x.visibility !== 1);
            let activePages = pages.filter(x => x.isActive === true);
            if (activePages.length === 0) {
                activePages = pages;
            }
            let defaultPage = activePages[0];
            
            defaultPage.setActive();
                // this.setState(nextState);
            this.setState({ pages: pages, reportInLoading: false, activePage: pages.findIndex(x => x.isActive === true) });

            //load the Report Title
            if (pages.length > 0 && this.state.currentReport) {
                let currentRep = this.state.currentReport;
                if (!currentRep.ShowEntityName && !currentRep.ShowReportName && !currentRep.ShowPageName)
                    this.setState({ activePageTitle: null });
                let result = getCustomTitleStyle(currentRep.ShowEntityName, this.state.entityName, currentRep.ShowReportName, currentRep.MenuName, currentRep.ShowPageName, this.state.pages[this.state.activePage].displayName);
                this.setState({ activePageTitle: result });
            } else {
                this.setState({ activePageTitle: null });
            }
        });
    }

    embed(config: pbi.IEmbedConfiguration): pbi.Embed {
        this.validateConfig(config);
        this.component = powerbi.embed(this.rootElement, config);
        return this.component;
    }

    validateConfig(config: pbi.IEmbedConfiguration) {
        const errors = pbi.models.validateReportLoad(config);
        // tslint:disable-next-line:no-console
        if (errors) { console.log(errors); }
        return (errors === undefined);
    }

    handlePageChange(reportName, event) {
        const target = event.target;
        const index = parseInt(target.dataset.index, 10);
        this.report.setPage(reportName);
        this.setActivePage(index);
    }

    handleFullscreenClick() {
        this.component.fullscreen();
    }

    isActive(index) {
        return index === this.state.activePage ? 'activeTab' : '';
    }

    setActivePage(index) {
        this.setState({activePage: index});
    }

    render() {
        return (
            <div>
                <div className="report-tabs">
                    {//!this.state.reportInLoading &&
                        this.state.IsPagesHidden ===  false &&
                        this.state.pages.map(function (page, index) {
                            return <span>{index !== 0 && <span className="tab-vl"></span>}<a key={index} data-index={index} className={this.isActive(index)} onClick={this.handlePageChange.bind(this, page.name)}>
                                {/*<span className="glyphicon glyphicon-play"></span>*/}
                                {page.displayName}</a></span>;
                        }.bind(this))
                    }
                    {//<span className="fullscreen pull-right glyphicon glyphicon-fullscreen" onClick={this.handleFullscreenClick.bind(this)}></span>
                    }
                </div>
                {this.state.activePageTitle && <div className="report-title"><span>{this.state.activePageTitle}</span></div>}
                <div className="powerbi-frame" ref={(ref) => this.rootElement = ref}></div>
            </div>
        );
    }
}


export default connect(
    (state: ApplicationState) => state.report,
    ReportStore.actionCreators
)(Report);