import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as EntitiesStore from '../store/Entities';
import { EntityItem } from '../components/EntityItem';
import { Accordion, Panel } from 'react-bootstrap';
import * as PropTypes from "prop-types";

type EntitiesProps = EntitiesStore.EntitiesState & typeof EntitiesStore.actionCreators;

export class Entities extends React.Component<EntitiesProps> {
    static contextTypes = {
        router: PropTypes.object
    };
    componentWillMount() {
        this.props.requestEntities();
        document.title = 'PBI App - Entities';
        // sessionStorage.setItem('tenant', window.location.pathname.replace(/\W/g, ''));
    }

    componentWillReceiveProps(nextProps: EntitiesProps) {
        if (nextProps.entities && nextProps.entities.length === 1
            && sessionStorage.getItem('userRoles')
            && sessionStorage.getItem('userRoles').split(',').length === 1 
            && sessionStorage.getItem('userRoles').split(',').filter(x => (x === "DataReader")).length === 1) {
            let data = nextProps.entities;
            this.context.router.history.push('/' + sessionStorage.getItem('tenant') + '/entities/' + data[0].Id);
        }
    }

    public render() {
        return (
            <div className="content-appear">
                <div>{this.renderEntities()}</div>
            </div>
        );
    }

    private renderEntities() {
        return (
            <div className="component_entity-block">{
                this.props.entities && 
                this.props.entities
                    .filter(function (entity) { return entity.ParentId === 0; })
                    .map(entity =>
                        <EntityItem entity={entity} key={entity.Id} />
                    )}
            </div>
        );
    }

    private entityValues(user, prop) {
        if (typeof user[prop] === 'object') {
            return 'obj';
        }
        return user[prop];
    }
}

export default connect((state: ApplicationState) => state.entities, EntitiesStore.actionCreators)(Entities);
