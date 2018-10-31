import * as React from 'react';
import { Footer, FooterRow, FooterColumn, SiteMap } from '@dnvgl/veracity-common/es/components/Footer';

export class NavFooter extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            footerProperty: null
        }
    }

    componentWillMount() {
        if (this.props.footerProperty) {
            this.setState({ footerProperty: this.props.footerProperty});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.footerProperty) {
            this.setState({ footerProperty: nextProps.footerProperty });
        }
    }

    getItems() {
        let itemCollection = [];
        if (this.state.footerProperty.ContactEmail) {
            itemCollection.push(<a href={'mailto:' + this.state.footerProperty.ContactEmail}>{this.state.footerProperty.ContactEmail}</a>);
        }
        if (this.state.footerProperty.TenantInfo) {
            itemCollection.push(this.getTenantInfoLink());
            //itemCollection.push(<a href={'mailto:' + this.state.footerProperty.TenantInfoURL}>{this.state.footerProperty.TenantInfo}</a>);
        }
        //itemCollection.push(<span>Policy(In construction)</span>);
        if (this.state.footerProperty.CopyRight) {
            itemCollection.push(<span>{this.state.footerProperty.CopyRight}</span>);
        }
        return itemCollection;
    }

    getTenantInfoLink() {
        let tenantInfo = this.state.footerProperty.TenantInfo;
        let tenantUrl = this.state.footerProperty.TenantInfoURL;
        if (tenantUrl && tenantUrl.indexOf('@') > -1) {
            return (<a href={'mailto:' + tenantUrl}>{tenantInfo}</a>);
        }
        else if (tenantUrl) {
            if (tenantUrl.startsWith("http://") || tenantUrl.startsWith("https://")) {
                return (<a href={tenantUrl} target='_blank'>{tenantInfo}</a>);
            } else {
                return (<a href={'//' + tenantUrl} target='_blank'>{tenantInfo}</a>);
            }
        } else {
            return (<span>{tenantInfo}</span>);
        }
    }

    public render() {
        return (<Footer>
            <FooterRow className="content-container">
                       <FooterColumn heading="Legal">
                           <a href='https://my.dnvgl.com/PrivacyStatement'>Privacy statement</a>
                           <a href='https://my.dnvgl.com/TermsOfUse'>Terms of use</a>
                       </FooterColumn>
                       <FooterColumn heading={this.state.footerProperty.FootHeader}>
                            {this.getItems()}
                       </FooterColumn>
                       <FooterColumn heading="Contact us">
                            <a href='mailto:contact@veracity.com'>contact@veracity.com</a>
                           <span>DNV GL AS</span>
                           <span>NO-1322 Høvik, Norway</span>
                       </FooterColumn>
                   </FooterRow>
               </Footer>
            );
    }

    isReprtPage() {
        let isReportPage = window.location.pathname.split('/').filter(x => x === "reports").length > 0;
        if (isReportPage) {
            return true;
        } else {
            return false;
        }
    }
}