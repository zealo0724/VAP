import * as React from 'react'

export class Loading extends React.Component {
    public render() {
        return (
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="lds-eclipse">
                <path ng-attr-d="{{config.pathCmd}}" ng-attr-fill="{{config.color}}" stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#36a0dc" transform="rotate(113.707 50 51)">
                    <animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform>
                </path>
            </svg>
        );
    }
}

export default Loading;
