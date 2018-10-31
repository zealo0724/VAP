import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from './store';
import * as AdminReportConnectStore from './store/AdminReportConnect';
import { Modal, Pagination } from 'react-bootstrap';

type PbiReportsProps = AdminReportConnectStore.ReportConnectState & typeof AdminReportConnectStore.actionCreators;

export class AdminReportConnect extends React.Component<PbiReportsProps, any> {
    constructor(props: PbiReportsProps) {
        super(props);
    }

    componentWillMount() {
    }

    componentDidMount() {
        document.title = sessionStorage.getItem('tenant') + ' - Not Authorized';
    }

    componentWillReceiveProps(nextProps, nextState) {

    }

    render() {
        return (
            <div id="not-authorize">
                <h3>UnAuthorized</h3>
                <p className="AlertText">We are sorry to inform you that you are Unauthorized.</p>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.adminReportConnect,
    AdminReportConnectStore.actionCreators
)(AdminReportConnect);
