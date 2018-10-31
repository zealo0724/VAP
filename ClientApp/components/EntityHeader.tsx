import * as React from 'react';
import { Link } from 'react-router-dom';
import * as EntityStore from '../store/Entity';

type EntityProps = EntityStore.EntityState;
export class EntityHeader extends React.Component<EntityProps, any> {
    constructor(props: EntityProps) {
        super(props);
    }
    public render() {
        return (
            <div className="entity-header">
                <div className="row">
                    <div className="col-xs-12">
                        <h2>{this.props.entity.EntityName}</h2>
                        <div className="row">
                            {this.props.entity.EntityTypeProperties.map(function (prop, index) {
                                return <div key={index} className="col-xs-6 col-md-4 entity-prop"><strong>{prop.EntityTypePropertyName}:</strong> {prop.Value}</div>;
                            })}
                        </div>


                        <div className="row">
                            <div className="col-xs-12">
                                {this.props.entity.Reports.length > 0 &&
                                    <Link to={'/' + sessionStorage.getItem('tenant') + '/entities/' + this.props.entity.Id + '/reports'}>
                                        <button type="button" className="btn btn-primary reports-button">Reports</button>
                                    </Link>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }
}

export default EntityHeader;
