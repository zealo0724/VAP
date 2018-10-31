//import * as React from 'react';
//import { Link } from 'react-router';
//import { connect } from 'react-redux';
//import { ApplicationState } from '../store';
//import * as EntityStore from '../store/Entity';

//export class EditEntity extends React.Component<any, any> {
//    constructor(props: any) {
//        super(props);
//        this.state = { entity: this.entityInfo(this.props.params.id) as EntityStore.Entity };
//        this.handleInputChange = this.handleInputChange.bind(this);
//    }
    
    


//    private entityInfo(id) {
//        return this.props.entities.find(u => u.id === id);
//    }


//    handleInputChange(event) {
//        const target = event.target;
//        const value = target.value;
//        const name = target.name;
//        let entityCopy = Object.assign({}, this.state.entity, {[name]: value});
//        this.setState({
//            entity: entityCopy
//        });
//    }

//    public render() {
//        return <div>
//            <form>
//                <strong>User with ID: {this.state.entity.id}</strong>
//                <div className="form-group">
//                    <label>
//                        Name:
//                    <input type="text" name="name" value={this.state.entity.name} onChange={this.handleInputChange} />
//                    {/*<input type="text" name="name" value={this.state.entity.name} onChange={(e)=>this.setState({entity: Object.assign({}, this.state.entity, {name: e.target.value})}) } />*/}
//                    </label>
//                </div>
//                <div className="form-group">
//                    <label>
//                        Phone:
//                    <input type="tel" name="phone" value={this.state.entity.phone} onChange={this.handleInputChange} />
//                    </label>
//                </div>
//                <div className="form-group">
//                    <label>
//                        Name:
//                    <input type="text" name="website" value={this.state.entity.website} onChange={this.handleInputChange} />
//                    </label>
//                </div>
//            </form>
//        </div>;
//    }
//}

//export default connect(
//    (state: ApplicationState) => state.entities,
//    EntityStore.actionCreators
//)(EditEntity);
