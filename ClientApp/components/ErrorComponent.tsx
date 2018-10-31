import * as React from "react";
import { Modal, Tab, Tabs } from "react-bootstrap";
import { RouteComponentProps } from "react-router-dom";

interface IErrorComponentProps {
    isModal: boolean;
}


export default class ErrorComponent extends React.Component<IErrorComponentProps, any> {
    constructor(props: IErrorComponentProps) {
        super();
        this.state = {
            errors: [],
            warnings: []
        },
        this.handleErrorEvent = this.handleErrorEvent.bind(this);
        this.handleWarningEvent = this.handleWarningEvent.bind(this);
    }

    componentDidMount() {
        var errorlistenerName = "Error";
        if (this.props.isModal) { errorlistenerName += "Modal";}
        window.addEventListener(errorlistenerName, this.handleErrorEvent);
        var warninglistenerName = "Warning";
        if (this.props.isModal) { warninglistenerName += "Modal"; }
        window.addEventListener(warninglistenerName, this.handleWarningEvent);
    }

    handleErrorEvent(e: any) {
        let current = this.state.errors;

        let detail = e.detail;
        if (detail === 'Server is not responding. ' || detail === '500 - Server error.') {
            detail = '302';
        }

        if (current.some(x => x === detail)) {
            return;
        }
        

        this.state.errors.push(detail);
        this.forceUpdate();
    }
    handleWarningEvent(e: any) {
        let current = this.state.warnings;
        if (current.some(x => x === e.detail)) {
            return;
        }
        
        this.state.warnings.push(e.detail);
        this.forceUpdate();
    }
    handleCloseErrorClick(index: number) {
        this.state.errors.splice(index, 1);
        this.forceUpdate();
    }
    handleCloseWarningClick(index: number) {
        this.state.warnings.splice(index, 1);
        this.forceUpdate();
    }
    public render() {  
        return <div className={this.props.isModal ? "" : "sticky-error"}>
        {this.state.errors.map((error: string, index: number) => {
                return (
                    <div key={index} className="alert alert-dismissible alert-danger">
                        <a onClick={() => this.handleCloseErrorClick(index)} className="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Error!</strong> {error !== "302" ? error :
                            <div>Server is not responding. Please click F5 to refresh your page or click 
                                <a href={window.location.pathname}> here</a> . This may happen if you lose network connection or your page have timed out after been open for a long time. </div>}
                    </div>
            );
            })}
            {this.state.warnings.map((warning: string, index: number) => {
                return (
                    <div key={index} className="alert alert-dismissible alert-warning">
                        <a onClick={() => this.handleCloseWarningClick(index)} className="close" data-dismiss="alert" aria-label="close">&times;</a>
                        <strong>Warning:</strong> {warning}
                    </div>
                );
            })}
        </div>
    }
}
