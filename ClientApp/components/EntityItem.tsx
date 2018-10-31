import * as React from 'react';
import { NavLink } from 'react-router-dom';
import * as EntityStore from '../store/Entity';

type EntityProps = EntityStore.EntityState;

export class EntityItem extends React.Component<EntityProps, any> {
    constructor(props: EntityProps) {
        super(props);
    }
    public render() {
        return (
            <NavLink to={'/' + sessionStorage.getItem('tenant') + '/entities/' + this.props.entity.Id} activeClassName="active">
                <div className="block block-bordered">
                    <h2>{this.props.entity.EntityName}</h2>
                    <p>{this.props.entity.EntityTypeName}</p>
                    {this.props.entity.EntityTypeProperties.map(function (prop, index) {
                        return <p key={index}>{prop.EntityTypePropertyName}: {prop.Value}</p>;
                    })}
                </div>
            </NavLink>);
    }
}

export default EntityItem;
