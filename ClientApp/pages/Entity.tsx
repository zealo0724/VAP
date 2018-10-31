import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as EntityStore from '../store/Entity';
import { EntityHeader } from '../components/EntityHeader';
import { localResource } from '../PublicFunctions';
import * as queryString from 'query-string';
import * as PropTypes from "prop-types";

type EntityProps = EntityStore.EntityState & typeof EntityStore.actionCreators;

export class Entity extends React.Component<EntityProps, any> {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props: EntityProps) {
        super(props);
        this.state = {
            entity: null,
            entities: null,
            pageInLoading: true
        };
    }

    componentWillMount() {
        this.entityInfo(this.props.match.params.id);
    }
    componentDidMount() {
        document.title = 'PBI App - Entities';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (this.props.match.params.id !== nextProps.match.params.id) {
            this.entityInfo(nextProps.match.params.id);
        }
        this.setState({
            entity: nextProps.entity
        });
        if (nextProps.entities) {
            this.setState({
                entities: nextProps.entities
            });
        }
        if(nextProps.RequestDone)
        {
            this.setState({
            pageInLoading: false
            });
        }
        if (sessionStorage.getItem('userRoles') !== null) {
            let auth = sessionStorage.getItem('userRoles').indexOf('SystemAdmin') > -1 ||
                sessionStorage.getItem('userRoles').indexOf('ReportAdmin') > -1 ||
                sessionStorage.getItem('userRoles').indexOf('DataAdmin') > -1 ||
                sessionStorage.getItem('userRoles').indexOf('DataReader') > -1;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth });
            }
        }
    }

    private entityInfo(id) {
        let parsed = queryString.parse(this.props.location.search);
        if (!parsed.noSkip) {
            this.context.router.history.push('/' + sessionStorage.getItem('tenant') + '/entities/' + id + '/reports');
        }
        parsed.noSkip
            ? this.props.requestEntity(id, parsed)
            : this.props.requestEntity(id);
        // Get children if parent
        this.props.requestEntities(id);

        // Fetch entityinfo unless its already loaded
        // if (this.props.entity.id !== parseInt(id, 10)) {
        //     this.props.requestEntity(id);

        //     // Get children if parent
        //     this.props.requestEntities(id);
        // } else {
        //     this.setState({
        //         entity: this.props.entity
        //     });
        // }
    }

    public render() {
        return (<div className="component_entity-info">
                    {
                        (this.state.entity !== null && this.state.entity.EntityId > 0) &&
                            <div>
                        <EntityHeader entity={this.state.entity}/>
                        {
                            <div>
                                {
                                    this.state.entities.map(entity => {
                                        return (
                                            <NavLink key={entity.Id} to={'/' + sessionStorage.getItem('tenant') + '/entities/' + entity.id} activeClassName="child-entity">
                                                <div className="entity">
                                                    <p>{entity.entityTypeName}</p>
                                                    <h3>{entity.entityName}</h3>
                                                </div>
                                            </NavLink>
                                        );
                                    })
                                }
                            </div>
                        }
                    </div>
                    }
                </div>);
    }
}

export default connect((state: ApplicationState) => state.entity, EntityStore.actionCreators)(Entity);

