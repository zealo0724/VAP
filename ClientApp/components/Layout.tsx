import * as React from 'react';
import { NavMenu } from './NavMenu';
import { Footer, FooterRow, FooterColumn, SiteMap } from '@dnvgl/veracity-common/es/components/Footer';
import { NavFooter } from './NavFooter';
import ErrorComponent from "./ErrorComponent";

export interface LayoutProps {
    //body: React.ReactElement<any>;
    children?: React.ReactElement<any>;
}



export class Layout extends React.Component<LayoutProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            services: [],
            isReportPage: false,
            isStorageReady: false,
            footerProperty: [],
            errors: []
        };

        this.handleErrorEvent = this.handleErrorEvent.bind(this);
    }

    handleErrorEvent(e: any) {
        this.state.errors.push(e.detail);
        this.forceUpdate();
    }

    componentDidMount() {
        window.addEventListener("Error", this.handleErrorEvent);
    }

    componentWillMount() {
        this.checkIsReportPage();

        // sessionStorage.setItem('tenant', window.location.pathname.replace(/\W/g, ''));
        let currentUrltenant = window.location.pathname.split('/')[1].replace(/\W/g, '');
        sessionStorage.setItem('tenant', currentUrltenant);
        // TODO: Delete FedAuth cookies if tenant url changes ( currentUrltenant != sessionStorage)
        // if (currentUrltenant !== sessionStorage.getItem('tenant')) {
        //     fetch('/' + sessionStorage.getItem('tenant') + `/webapi/Dashboard/ExpireAllCookies`, { credentials: 'same-origin' })
        //     .then(response => location.reload());
        // }
        fetch('/' + currentUrltenant + `/webapi/Dashboard/ValidUserCookie`, { credentials: 'same-origin' })
            .then(response => response.json())
            .then(data => {
                if (data.validUser) {
                    fetch('/' + currentUrltenant + `/webapi/Dashboard/MyInfo`, { credentials: 'same-origin' })
                        .then(response => response.json())
                        .then(data => {
                            sessionStorage.setItem('userRoles', data.Roles);
                            sessionStorage.setItem('myDNVGLUserID', data.MyGNVDLUserId);
                            this.setState({ user: data, isStorageReady: true});
                        });
                    fetch('/' + currentUrltenant + `/webapi/admin/ConfigAdmin/GetPageFooter`, {
                        credentials: 'same-origin',
                        method: 'GET',
                        headers: { 'Content-type': 'application/json' }
                    })
                        .then(response => response.json())
                        .then(data => {
                            this.setState({ footerProperty: data });
                        });
                } else {
                    fetch('/' + currentUrltenant + `/webapi/Dashboard/ExpireAllCookies`, { credentials: 'same-origin' })
                        .then(response => location.reload());
                }
            });

        // THIS AINT RIGHT! FIX: Use MyDnvGlUserStore
    }

    componentWillReceiveProps(nextProps) {
        this.checkIsReportPage();
    }

    checkIsReportPage() {
        let isReportPage = window.location.pathname.split('/').filter(x => x.toLowerCase() === 'reports').length > 0;
        if (isReportPage) {
            this.setState({ isReportPage: true });
        } else {
            this.setState({ isReportPage: false });
        }
    }

    public render() {
        return (
            this.state.isStorageReady &&
            <div className="container-fluid">
                <ErrorComponent isModal={false} />
                <div id="page-error"></div>
                <div id="page-warning"></div>
                <div className="row header-row">
                    <div className="col-sm-12">
                        {<NavMenu isShowMenu={!this.state.isReportPage} user={this.state.user}/>}
                    </div>
                </div>
                <div className="row content-body">
                    {
                        this.state.isReportPage ?
                        this.props.children
                        :
                        <div className="container">
                            <div className="col-sm-12">
                                {/*{this.props.body}*/}
                                {this.props.children}
                            </div>
                        </div>
                    }
                </div>
                <div id="footer">
                    <NavFooter footerProperty={this.state.footerProperty} />
                </div>
            </div>
        );
    }
}
