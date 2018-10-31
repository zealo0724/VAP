import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import * as CommonStore from '../../store/Common';
import * as AdminTenantsStore from '../../store/AdminTenants';
import * as AdminConfigStore from '../../store/AdminConfig';
import { Modal, Nav, NavItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { localResource, optionType, commonFunctions } from '../../PublicFunctions';
import * as ReactCrop from 'react-image-crop';
import 'react-image-crop/lib/ReactCrop.scss';

type AdminConfigProps = AdminConfigStore.AdminConfigState & CommonStore.CommonState & AdminTenantsStore.TenantsAdminState & typeof CommonActionCreators;

export class AdminConfig extends React.Component<AdminConfigProps, any> {
    accessToken: string;
    embedUrl: string;
    reportId: string;
    constructor(props: AdminConfigProps) {
        super(props);
        this.state = {
            entityTypes: [],
            propertyTypes: [],
            entityTypeProperties: [],
            tenantProperties: [],
            footProperties: [],
            BusinessAreas: [],
            entityTypePropertyAdded: false,
            addTypeModalOpen: false,
            addPropertyModalOpen: false,
            addBusinessAreaModalOpen: false,
            eidtPropertyModalOpen: false,
            deletePropertyModalOpen: false,
            deleteBusinessAreaModalOpen: false,
            eidtTenantPropertyModalOpen: false,
            eidtFootPropertyModalOpen: false,
            eidtBusinessAreaModalOpen: false,
            headIconEditOpen: false,
            activeType: null,
            activePropertyType: null,
            activeTenantProperty: null,
            activeFootProperty: null,
            activeBusinessArea: null,
            typeAdded: false,
            formErrors: [],
            //tooltip Modale
            editTooltipModalOpen: false,
            tooltips: [],
            activeTooltip: [],
            inLoading: false,
            crop: null,
            src: null,
            cropResult: null
        };
    }

    componentWillMount() {
        this.props.getEntityTypes();
        this.props.getPropertyTypes();
        this.props.getEntityTypeProperties();
        this.props.getTooltips();
        this.props.getTenants(true);
        this.props.getBusinessAreas();
        this.props.getFoot();
        if (sessionStorage.getItem('userRoles') === null) {
            this.props.getUserRoles();
        }
    }

    componentDidMount() {
        document.title = 'PBI App - Config';
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (this.state.activeType === null && nextProps.entityTypes.length > 0) {
            this.setState({ activeType: nextProps.entityTypes[0] });
        }
        if (nextProps.typeAdded) {
            this.setState({ addTypeModalOpen: false, inLoading: false });
            this.props.getEntityTypes();
        }
        if (nextProps.entityTypePropertyDeleted) {
            this.props.getEntityTypeProperties();
            this.setState({
                deletePropertyModalOpen: false
                , activePropertyType: null
                , entityTypePropertyDeleted: false,
                inLoading: false
            });
        }
        if (nextProps.entityTypePropertyEdited) {
            this.props.getEntityTypeProperties();
            this.setState({
                editPropertyModalOpen: false
                , activePropertyType: null
                , entityTypePropertyEdited: false,
                inLoading: false
            });
        };
        if (nextProps.entityTypePropertyAdded) {
            this.props.getEntityTypeProperties();
            this.setState({
                activePropertyType: null
                , addPropertyModalOpen: false
                , entityTypePropertyAdded: false,
                inLoading: false
            });
        };
        if (nextProps.tooltipsEdited) {
            this.props.getTooltips();
            this.setState({
                activeTooltip: null, editTooltipModalOpen: false,
                inLoading: false
            });
        }
        this.setState({
            entityTypes: nextProps.entityTypes,
            typeAdded: nextProps.typeAdded,
            propertyTypes: nextProps.propertyTypes,
            entityTypeProperties: nextProps.entityTypeProperties === undefined
                ? this.state.entityTypeProperties
                : nextProps.entityTypeProperties,
            tooltips: nextProps.tooltips === undefined ? this.state.tooltips : nextProps.tooltips
        });
        if (sessionStorage.getItem('userRoles') === null) {
            if (nextProps.userRoles !== null && nextProps.userRoles !== undefined) {
                this.setState({ userRoles: nextProps.userRoles });
            }
        } else {
            this.setState({ userRoles: sessionStorage.getItem('userRoles').split(',') });
        }
        if (this.state.userRoles !== undefined) {
            let auth = this.state.userRoles.filter(x => x === localResource.SystemAdmin).length > 0 ||
                this.state.userRoles.filter(x => x === localResource.SuperTenantAdmin).length > 0;
            let tenantAuth = this.state.userRoles.filter(x => x === localResource.SuperTenantAdmin).length > 0;
            if (!auth) {
                window.location.href = '../NotAuthorize';
            } else {
                this.setState({ isAuthorized: auth, isTenantAdmin: tenantAuth });
            }
        }
        if (nextProps.tenants && nextProps.tenants.length > 0) {
            if (nextProps.operationType && nextProps.operationType === optionType.updateTenant.iconUpdate) {
                this.setState({
                    tenantProperties: nextProps.tenants
                    , headIconEditOpen: false
                    , inLoading: false
                });
            }
            else if (nextProps.operationType && nextProps.operationType === optionType.updateTenant.tenantPropertyUpdate) {
                this.setState({
                    tenantProperties: nextProps.tenants
                    , eidtTenantPropertyModalOpen: false
                    , inLoading: false
                });
            } else {
                this.setState({
                    tenantProperties: nextProps.tenants

                });
            }
        }
        if (nextProps.footer) {
            let nextFooter = nextProps.footer;
            if (nextFooter.length > 0 && nextFooter[0] === null) {
                let nullFooter = {
                    Id: 0,
                    FootHeader: '',
                    ContactEmail: '',
                    TenantInfo: '',
                    TenantInfoURL: '',
                    CopyRight: ''
                };
                nextFooter[0] = nullFooter;
            }
            this.setState({ footProperties: nextProps.footer });
        }
        if (nextProps.updateFootSuccess) {
            this.props.getFoot();
            this.setState({ inLoading: false, eidtFootPropertyModalOpen: false, formErrors: [] });
        }
        if (nextProps.businessAreas && nextProps.businessAreas.length > 0) {
            this.setState({ BusinessAreas: nextProps.businessAreas });
        }
        if (nextProps.baOprationSuccessfull) {
            this.props.getBusinessAreas();
            this.setState({ addBusinessAreaModalOpen: false, eidtBusinessAreaModalOpen: false, deleteBusinessAreaModalOpen: false });
        }
    }

    showAddTypeModal() {
        this.setState({ addTypeModalOpen: true, activeType: {} });
    }

    showAddPropertyModal() {
        this.setState({
            addPropertyModalOpen: true, activePropertyType: {
                Id: null,
                Name: '',
                PropertyTypeId: null,
                entityTypeProperties: []
            }
        });
    }

    showEditTooltipModal(entity) {
        this.setState({
            editTooltipModalOpen: true, activeTooltip: entity
        });
    }
    showEditTenantPropertyModal(property) {
        this.setState({ eidtTenantPropertyModalOpen: true, activeTenantProperty: property });
    }

    showEditFootPropertyModal(property) {
        this.setState({ eidtFootPropertyModalOpen: true, activeFootProperty: property });
    }

    showEditPropertyModal(entity) {
        this.setState({ editPropertyModalOpen: true, activePropertyType: entity });
    }
    showDeletePropertyModal(entity) {
        this.setState({ deletePropertyModalOpen: true, activePropertyType: entity });
    }

    showAddBusinessAreaModal() {
        this.setState({
            addBusinessAreaModalOpen: true, activeBusinessArea: {
                Id: null,
                Name: ''
            }
        });
    }

    showEditBusinessAreaModal(businessArea) {
        this.setState({ eidtBusinessAreaModalOpen: true, activeBusinessArea: businessArea });
    }
    showDeleteBusinessAreaModal(businessArea) {
        this.setState({ deleteBusinessAreaModalOpen: true, activeBusinessArea: businessArea });
    }

    addPropertyModal() {
        if (this.activeEntityTypePropertyIsValid()) {
            this.setState({ inLoading: true });
            this.props.addEntityTypeProperty(this.state.activePropertyType);
        }
    }

    editPropertyModal() {
        if (this.activeEntityTypePropertyIsValid()) {
            this.setState({ inLoading: true });
            this.props.editEntityTypeProperty(this.state.activePropertyType);
        }
    }

    editTenantPropertyModal() {
        if (this.activeTenantPropertyIsValid()) {
            this.setState({ inLoading: true });
            this.props.updateTenant(this.state.activeTenantProperty, optionType.updateTenant.tenantPropertyUpdate);
        }
    }

    editFootPropertyModal() {
        if (this.activeFootPropertyIsValid()) {
            this.setState({ inLoading: true });
            this.props.updateFoot(this.state.activeFootProperty);
        }
    }

    editActiveBusinessAreaModal() {
        if (this.activeBusinessAreaIsValid()) {
            this.setState({ inLoading: true });
            this.props.updateBusinessArea(this.state.activeBusinessArea);
        }
    }

    addActiveBusinessAreaModal() {
        if (this.activeBusinessAreaIsValid()) {
            this.setState({ inLoading: true });
            this.props.addBusinessArea(this.state.activeBusinessArea);
        }
    }

    deleteActiveBusinessAreaModal() {
        this.setState({ inLoading: true });
        this.props.deleteBusinessArea(this.state.activeBusinessArea);
    }

    editTooltipModal() {
        this.setState({ inLoading: true });
        this.props.editTooltip(this.state.activeTooltip);
    }

    deletePropertyModal() {
        this.setState({ inLoading: true });
        this.props.deleteEntityTypeProperty(this.state.activePropertyType);
    }

    hideAddTypeModal() {
        this.setState({ addTypeModalOpen: false });
    }
    hideAddPropertyModal() {
        this.setState({ addPropertyModalOpen: false, formErrors: [] });
    }
    hideAddBusinessAreaModal() {
        this.setState({ addBusinessAreaModalOpen: false, formErrors: [] });
    }
    hideEditPropertyModal() {
        this.setState({ editPropertyModalOpen: false, formErrors: [] });
    }
    hideDeletePropertyModal() {
        this.setState({ deletePropertyModalOpen: false, formErrors: [] });
    }
    hideDeleteBusinessAreaModal() {
        this.setState({ deleteBusinessAreaModalOpen: false, formErrors: [] });
    }
    hideEditTenantPropertyModal() {
        this.setState({ eidtTenantPropertyModalOpen: false, formErrors: [] });
    }
    hideEditFootPropertyModal() {
        this.setState({ eidtFootPropertyModalOpen: false, formErrors: [] });
    }
    hideHeadIconEditModal() {
        this.setState({ headIconEditOpen: false, formErrors: [] });
    }
    showHeadIconEditModal() {
        this.setState({ headIconEditOpen: true, formErrors: [] });
    }
    hideEditBusinessAreaModal() {
        this.setState({ eidtBusinessAreaModalOpen: false, formErrors: [] });
    }
    hideEditTooltipModal() {
        this.setState({ editTooltipModalOpen: false });
    }

    handleMultiSelectChange(val) {
        this.setState({ selectedPropertiessObject: val });
    }

    handleModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        let active = Object.assign({}, this.state.activeType);
        if (target.name === 'entityTypeId') {
            active.entityTypeName = target.textContent;
        }
        active[name] = value;
        this.setState({
            activeType: active
        });
    }

    handlePropertiesModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ formErrors: [] });
        let active = Object.assign({}, this.state.activePropertyType);
        active[name] = value;
        this.setState({
            activePropertyType: active
        });
    }

    handleTenantPropertiesModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ formErrors: [] });
        let active = Object.assign({}, this.state.activeTenantProperty);
        active[name] = value;
        this.setState({
            activeTenantProperty: active
        });
    }

    handleFootPropertiesModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ formErrors: [] });
        let active = Object.assign({}, this.state.activeFootProperty);
        active[name] = value;
        this.setState({
            activeFootProperty: active
        });
    }

    handleBusinessAreaModalInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ formErrors: [] });
        let active = Object.assign({}, this.state.activeBusinessArea);
        active[name] = value;
        this.setState({
            activeBusinessArea: active
        });
    }

    handleTooltipInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ formErrors: [] });
        let active = Object.assign({}, this.state.activeTooltip);
        active[name] = value;
        this.setState({
            activeTooltip: active
        });
    }

    addType() {
        this.setState({ inLoading: true });
        this.props.addType(this.state.activeType.Name);
    }

    activeEntityTypePropertyIsValid() {
        let form = this.state.activePropertyType;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                if ((form[property] === '' || form[property] === null || (form[property] === 0 && property === 'PropertyTypeId')) && property !== 'Id') {
                    errorFields.push(property);
                }
            }
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    activeTenantPropertyIsValid() {
        let form = this.state.activeTenantProperty;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                if (form[property] !== null && property === 'InvoiceContact' && form[property].trim().length > 0 && form[property].indexOf('@') === -1) {
                    errorFields.push(localResource.invoiceEmailWrong);
                }

                if (form[property] !== null && property === 'ServiceOwner' && form[property].trim().length > 0 && form[property].indexOf('@') === -1) {
                    errorFields.push(localResource.serviceOwnerWrong);
                }
            }
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    activeFootPropertyIsValid() {
        let form = this.state.activeFootProperty;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                if (form[property] !== null && property === 'ContactEmail' && form[property].trim().length > 0 && form[property].indexOf('@') === -1) {
                    errorFields.push(localResource.contactEmailWrong);
                }
            }
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    activeBusinessAreaIsValid() {
        let form = this.state.activeBusinessArea;
        let errorFields = [];
        for (let property in form) {
            if (form.hasOwnProperty(property)) {
                if (form[property] !== null && property === 'Name' && form[property].trim().length === 0) {
                    errorFields.push(localResource.businessAreaRequired);
                }
            }
        }
        this.setState({ formErrors: errorFields });
        return !(errorFields.length > 0);
    }

    setActiveEntityType(entityType: AdminConfigStore.EntityType) {
        this.setState({ activeType: entityType });
    }

    entityTypePropertyForm(isDisabled) {
        return (
            <div>
                <div className="form-group">
                    <label>Name: </label>
                    <input disabled={isDisabled} name="Name" type="text" className="wide" value={this.state.activePropertyType.Name} onChange={this.handlePropertiesModalInputChange.bind(this)} required />
                </div>

                <div className="form-group">
                    <label>Property Type: </label>
                    <select disabled={isDisabled} name="PropertyTypeId" value={this.state.activePropertyType.PropertyTypeId} onChange={this.handlePropertiesModalInputChange.bind(this)} required>
                        <option value=""></option>
                        {this.state.propertyTypes.map(tp => <option key={tp.Id} value={tp.Id}>{tp.Name}</option>)}
                    </select>
                </div>
                {this.state.formErrors.length > 0 && <p className="errors">{localResource.requiedFieldsMissing}</p>}
            </div>
        );
    }

    getTooltipHtml(elementId) {
        let tooltipTxt = commonFunctions.getCommonTooltip(elementId, this.state.tooltips);
        if (tooltipTxt.length > 0)
            return (
                <OverlayTrigger placement="top" overlay={<Tooltip className={tooltipTxt.length > 200 && 'myTooltip'} id="reportConnectTitleTooltip">{tooltipTxt}</Tooltip>}>
                    <span className="glyphicon exclamation glyphicon-question-sign"></span>
                </OverlayTrigger>
            );
        return (<span></span>);
    }

    tenantPropertyForm(isDisabled) {
        return (
            <div>
                <div className="form-group">
                    <label>Invoice Detail: {this.getTooltipHtml('InvoiceDetailTooltip')}</label>
                    <input disabled={isDisabled} name="InvoiceDetail" type="text" className="wide" value={this.state.activeTenantProperty.InvoiceDetail} onChange={this.handleTenantPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Invoice Contact Email: {this.getTooltipHtml('InvoiceContactEmailTooltip')}</label>
                    <input disabled={isDisabled} name="InvoiceContact" type="text" className="wide" value={this.state.activeTenantProperty.InvoiceContact} onChange={this.handleTenantPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Service Owner: {this.getTooltipHtml('ServiceOwnerTooltip')}</label>
                    <input disabled={isDisabled} name="ServiceOwner" type="text" className="wide" value={this.state.activeTenantProperty.ServiceOwner} onChange={this.handleTenantPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Client: {this.getTooltipHtml('ClientTooltip')}</label>
                    <select name="BusinessAreaId" disabled={isDisabled} value={this.state.activeTenantProperty.BusinessAreaId} onChange={this.handleTenantPropertiesModalInputChange.bind(this)} required>
                        <option value=""></option>
                        {this.state.BusinessAreas && this.state.BusinessAreas.map(tp => <option key={tp.Id} value={tp.Id}>{tp.Name}</option>)}
                    </select>
                </div>

                {this.state.formErrors.length > 0 && this.state.formErrors.map(m =>
                    <p className="errors">{m}</p>)}
                <p>{localResource.reflashRequest}</p>
            </div>
        );
    }

    footPropertyForm(isDisabled) {
        return (
            <div>
                <div className="form-group">
                    <label>Footer Header: {this.getTooltipHtml('FootHeaderTooltip')}</label>
                    <input disabled={isDisabled} name="FootHeader" className="wide" type="text" value={this.state.activeFootProperty.FootHeader} onChange={this.handleFootPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Support Contact Email: {this.getTooltipHtml('SupportContactEmailTooltip')}</label>
                    <input disabled={isDisabled} name="ContactEmail" className="wide" type="text" value={this.state.activeFootProperty.ContactEmail} onChange={this.handleFootPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Tenant Information: {this.getTooltipHtml('TenantInformationTootip')}</label>
                    <textarea disabled={isDisabled} name="TenantInfo" className="wide" rows={3} value={this.state.activeFootProperty.TenantInfo} onChange={this.handleFootPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Tenant Information URL: {this.getTooltipHtml('TenantInformationURLTooltip')}</label>
                    <input disabled={isDisabled} name="TenantInfoURL" className="wide" type="text" value={this.state.activeFootProperty.TenantInfoURL} onChange={this.handleFootPropertiesModalInputChange.bind(this)} />
                </div>
                <div className="form-group">
                    <label>Copy Right: {this.getTooltipHtml('CopyRightTooltip')}</label>
                    <input disabled={isDisabled} name="CopyRight" className="wide" type="text" value={this.state.activeFootProperty.CopyRight} onChange={this.handleFootPropertiesModalInputChange.bind(this)} />
                </div>

                {this.state.formErrors.length > 0 && this.state.formErrors.map(m =>
                    <p className="errors">{m}</p>)}
                <p>{localResource.reflashRequest}</p>
            </div>
        );
    }

    cropOnClick(crop, pixelCrop) {
        let cropAspect = { aspect: localResource.headIcon.width / localResource.headIcon.height };
        crop = Object.assign({}, crop, cropAspect);
        this.setState({ crop: crop });
    }

    getCroppedImg(imageSrc, percentageCrop, fileName) {
        if (percentageCrop) {
            let image = new Image(imageSrc.width, imageSrc.height);
            image.src = imageSrc;
            let pixelCrop = this.getPixelCrop(image, percentageCrop);
            const canvas = document.createElement('canvas');
            canvas.width = localResource.headIcon.width;
            canvas.height = localResource.headIcon.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                localResource.headIcon.width,
                localResource.headIcon.height
            );

            // As Base64 string
            let base64Image = canvas.toDataURL('image/jpeg');
            // As a blob
            //let testImage = new Promise((resolve, reject) => {
            //    canvas.toBlob(file => { resolve(file);}, 'image/jpeg');
            //});
            this.setState({ cropResult: base64Image, formErrors: [] });
        } else {
            let errors = [];
            errors.push(localResource.selectPicture);
            this.setState({ formErrors: errors });
        }
    }

    getPixelCrop(image, percentCrop) {
        var x = Math.round(image.naturalWidth * (percentCrop.x / 100));
        var y = Math.round(image.naturalHeight * (percentCrop.y / 100));
        var width = Math.round(image.naturalWidth * (percentCrop.width / 100));
        var height = Math.round(image.naturalHeight * (percentCrop.height / 100));

        return {
            x: x,
            y: y,
            // Clamp width and height so rounding doesn't cause the crop to exceed bounds.
            width: this.clamp(width, 0, image.naturalWidth - x),
            height: this.clamp(height, 0, image.naturalHeight - y)
        };
    }

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }

    pictureSelected(e) {
        e.preventDefault();
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        const reader = new FileReader();
        reader.onload = () => {
            let image = new Image();
            image.src = reader.result;
            image.onload = () => {
                let iw = image.width;
                let ih = image.height;
                let scropW;
                let scropH;
                if (iw * localResource.headIcon.height > ih * localResource.headIcon.width) {
                    scropH = 100;
                    scropW = ih * 100 * localResource.headIcon.width / localResource.headIcon.height / iw;
                } else {
                    scropW = 100;
                    scropH = iw * 100 * localResource.headIcon.height / localResource.headIcon.width / ih;
                }
                let initCrop = {
                    aspect: localResource.headIcon.width / localResource.headIcon.height,
                    height: scropH,
                    width: scropW,
                    x: 0,
                    y: 0
                };
                this.setState({ crop: initCrop });
            };

            this.setState({ src: reader.result, formErrors: [] });
        };
        reader.readAsDataURL(files[0]);
    }

    uploadHeadIcon() {
        if (this.state.cropResult) {
            if (this.state.tenantProperties && this.state.tenantProperties.length === 1) {
                let currentTenant = this.state.tenantProperties[0];
                currentTenant.HeadIcon = this.state.cropResult;
                this.props.updateTenant(currentTenant, optionType.updateTenant.iconUpdate);
                this.setState({
                    formErrors: [], inLoading: true
                });
            }
        } else {
            let errorFields = [];
            if (this.state.src) {
                errorFields.push(localResource.cropPicture);

            } else {
                errorFields.push(localResource.selectPicture);
            }
            this.setState({
                formErrors: errorFields
            });
        }
    }

    removeIcon() {
        if (this.state.tenantProperties && this.state.tenantProperties.length === 1) {
            let currentTenant = this.state.tenantProperties[0];
            currentTenant.HeadIcon = null;
            this.props.updateTenant(currentTenant, optionType.updateTenant.iconUpdate);
            this.setState({
                formErrors: []
            });
        }
    }

    render() {
        return (
            <div id="admin-config">
                <div hidden={this.state.isTenantAdmin || this.state.isAuthorized === undefined || this.state.isAuthorized === false}>
                    <h2 className="text-uppercase">Header Icon</h2>
                    <div className="panel panel-default">
                        <div className="panel-heading clearfix">
                            {this.state.tenantProperties && this.state.tenantProperties.length === 1 && this.state.tenantProperties[0].HeadIcon
                                ? <div className='headIcon'><img src={this.state.tenantProperties[0].HeadIcon} alt="current image" /></div>
                                : <div className='header-dnvgl'><a className="logo logo-responsive"><div className='logo-image'></div></a></div>}
                            <button type="button" className="btn btn-primary pull-right headIconButton" onClick={this.removeIcon.bind(this)}>Reset to default icon</button>
                            <button type="button" className="btn btn-primary pull-right headIconButton" onClick={this.showHeadIconEditModal.bind(this)}>Edit Head Icon</button>
                        </div>
                    </div>
                    <Modal show={this.state.headIconEditOpen} onHide={this.hideHeadIconEditModal.bind(this)}>
                        <form id="editHeadIconEdit">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideHeadIconEditModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit Header Icon</h4>
                            </div>
                            <div className="modal-body">
                                <input type="file" accept="image/*" onChange={this.pictureSelected.bind(this)} />
                                {this.state.src && <ReactCrop onChange={(crop, pixelCrop) => { this.cropOnClick(crop, pixelCrop) }} crop={this.state.crop} src={this.state.src} />}
                                {this.state.src && <div className='clopBtn'>
                                    <button type="button" className="btn btn-primary padding-right-16" onClick={this.getCroppedImg.bind(this, this.state.src, this.state.crop, '')}>Crop</button>
                                </div>}
                                {this.state.cropResult && <img src={this.state.cropResult} alt="cropped image" />}
                                {this.state.formErrors.length > 0 && this.state.formErrors.map(m =>
                                    <p className="errors">{m}</p>)}
                                <p>{localResource.reflashRequest}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideHeadIconEditModal.bind(this)}>{localResource.modalCancel}</button>
                                <button type="button" className="btn btn-primary pull-right padding-right-16" onClick={this.uploadHeadIcon.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                            </div>

                        </form>
                    </Modal>
                    <br />
                    <h2 className="text-uppercase">Configure</h2>
                    <div className="panel panel-default">
                        <div className="panel-heading clearfix"><strong>Entity types</strong><button type="button" className="btn btn-primary pull-right" onClick={this.showAddTypeModal.bind(this)}>Add</button></div>
                        <div className="panel-body">
                            <Nav bsStyle="tabs" activeKey="1" onSelect={this.setActiveEntityType.bind(this)}>
                                {this.state.entityTypes.map((entityType, index) =>
                                    <NavItem key={entityType.Id} eventKey={entityType} active={entityType.Id === this.state.activeType.Id}>{entityType.Name}</NavItem>
                                )}
                            </Nav>
                        </div>
                    </div>
                    <br />
                    {/*TenantProperties*/}
                    <h2 className="text-uppercase">Tenant Properties</h2>
                    <div>
                        <table className="table table-striped pbi-table">
                            <thead>
                                <tr>
                                    <td>InvoiceDetail</td>
                                    <td>InvoiceContact</td>
                                    <td>ServiceOwner</td>
                                    <td>BusinessArea</td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.tenantProperties.map(property =>
                                    <tr key={property.Id}>
                                        <td>{property.InvoiceDetail || 'Undefined'}</td>
                                        <td>{property.InvoiceContact || 'Undefined'}</td>
                                        <td>{property.ServiceOwner || 'Undefined'}</td>
                                        <td>{(property.BusinessAreaId && property.BusinessArea.Name) || 'Undefined'}</td>
                                        <td><span className="glyphicon glyphicon-edit edit-btn cursor" onClick={this.showEditTenantPropertyModal.bind(this, property)}></span></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <br />
                    {/*Entity Type Property*/}
                    <div hidden={this.state.isTenantAdmin}>
                        <h2 className="text-uppercase">Entity Type Property<button type="button" className="btn btn-primary pull-right padding-right-16" onClick={this.showAddPropertyModal.bind(this)}>Add</button></h2>
                        <div>
                            <table className="table table-striped pbi-table">
                                <thead>
                                    <tr>
                                        <td>Name</td>
                                        <td>Property Type</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.entityTypeProperties.map(entity =>
                                        <tr key={entity.Id}>
                                            <td>{entity.Name}</td>
                                            <td>{entity.PropertyType !== null ? entity.PropertyType.Name : ""}</td>
                                            <td><span className="glyphicon glyphicon-edit edit-btn cursor" onClick={this.showEditPropertyModal.bind(this, entity)}></span></td>
                                            <td><span className="glyphicon glyphicon-remove delete-btn cursor" onClick={this.showDeletePropertyModal.bind(this, entity)}></span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/*ADD ENTITY TYPE MODAL*/}
                        <Modal show={this.state.addTypeModalOpen} onHide={this.hideAddTypeModal.bind(this)}>
                            <div className="modal-content">
                                <form id="createForm">
                                    <div className="modal-header">
                                        <button type="button" className="close" aria-label="Close" onClick={this.hideAddTypeModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                        <h4 className="modal-title">Add Entity Type</h4>
                                    </div>
                                    <div className="modal-body">
                                        {
                                            this.state.activeType !== null &&
                                            <div>
                                                <div className="form-group">
                                                    <label htmlFor="Name">Name: </label>
                                                    <input name="Name" type="text" className="wide" value={this.state.activeType.Name} onChange={this.handleModalInputChange.bind(this)} required />
                                                </div>
                                            </div>
                                        }

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-default" onClick={this.hideAddTypeModal.bind(this)}>{localResource.modalCancel}</button>
                                        <button type="button" className="btn btn-primary" onClick={this.addType.bind(this)} >{this.state.inLoading ? <div className="loader"></div> : 'Add'}</button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                    </div>
                    <br />
                    {/*EDIT TenantProperty MODAL*/}
                    <Modal show={this.state.eidtTenantPropertyModalOpen} onHide={this.hideEditTenantPropertyModal.bind(this)}>
                        <form id="editEntityTypeProperty">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideEditTenantPropertyModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit Tenant Property</h4>
                            </div>
                            <div className="modal-body">
                                {
                                    this.state.activeTenantProperty !== null && this.tenantPropertyForm(false)
                                }
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideEditTenantPropertyModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.editTenantPropertyModal.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/*ADD ENTITY TYPE PROPERTY MODAL*/}
                    <Modal show={this.state.addPropertyModalOpen} onHide={this.hideAddPropertyModal.bind(this)}>
                        <form id="createEntityTypeProperty">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideAddPropertyModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Add Entity Type Property</h4>
                            </div>
                            <div className="modal-body">
                                {
                                    this.state.activePropertyType !== null && this.entityTypePropertyForm(false)
                                }
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideAddPropertyModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.addPropertyModal.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Add'}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/*EDIT ENTITY TYPE PROPERTY MODAL*/}
                    <Modal show={this.state.editPropertyModalOpen} onHide={this.hideEditPropertyModal.bind(this)}>
                        <form id="editEntityTypeProperty">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideEditPropertyModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit Entity Type Property</h4>
                            </div>
                            <div className="modal-body">
                                {
                                    this.state.activePropertyType !== null && this.entityTypePropertyForm(false)
                                }
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideEditPropertyModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.editPropertyModal.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/*DELETE ENTITY TYPE PROPERTY MODAL*/}
                    <Modal show={this.state.deletePropertyModalOpen} onHide={this.hideDeletePropertyModal.bind(this)}>
                        <form id="deleteEntityTypeProperty">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideDeletePropertyModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Delete Entity Type Property</h4>
                            </div>
                            <div className="modal-body">
                                {
                                    this.state.activePropertyType !== null && this.entityTypePropertyForm(true)
                                }
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideDeletePropertyModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.deletePropertyModal.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Delete'}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>
                </div>
                <br />
                {/*FootConfig*/}
                <h2 className="text-uppercase">Footer Properties</h2>
                <div>
                    <table className="table table-striped pbi-table">
                        <thead>
                            <tr>
                                <td>Service footer header</td>
                                <td>Support contact e-mail</td>
                                <td>Tenant information</td>
                                <td>Tenant information URL</td>
                                <td>Copyright</td>
                                <td></td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.footProperties.map(property =>
                                <tr key={property.Id}>
                                    <td>{property.FootHeader || 'Undefined'}</td>
                                    <td>{property.ContactEmail || 'Undefined'}</td>
                                    <td>{property.TenantInfo || 'Undefined'}</td>
                                    <td>{property.TenantInfoURL || 'Undefined'}</td>
                                    <td>{property.CopyRight || 'Undefined'}</td>
                                    <td><span className="glyphicon glyphicon-edit edit-btn cursor" onClick={this.showEditFootPropertyModal.bind(this, property)}></span></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/*EDIT FootConfig MODAL*/}
                <Modal show={this.state.eidtFootPropertyModalOpen} onHide={this.hideEditFootPropertyModal.bind(this)}>
                    <form id="editEntityTypeProperty">
                        <div className="modal-header">
                            <button type="button" className="close" aria-label="Close" onClick={this.hideEditFootPropertyModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">Edit Foot Property</h4>
                        </div>
                        <div className="modal-body">
                            {
                                this.state.activeFootProperty !== null && this.footPropertyForm(false)
                            }
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={this.hideEditFootPropertyModal.bind(this)}>{localResource.modalCancel}</button>
                                <button type="button" className="btn btn-primary" onClick={this.editFootPropertyModal.bind(this)}>{this.state.inLoading ? <div className="loader"></div> : 'Save'}</button>
                            </div>
                        </div>
                    </form>
                </Modal>
                <br />
                {this.state.isTenantAdmin && <div>
                    {/*BusinessArea*/}
                    <h2 className="text-uppercase">Client<button type="button" className="btn btn-primary pull-right padding-right-16" onClick={this.showAddBusinessAreaModal.bind(this)}>Add</button></h2>
                    <div>
                        <table className="table table-striped pbi-table">
                            <thead>
                                <tr>
                                    <td>Name</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.BusinessAreas.map(busineesArea =>
                                    <tr key={busineesArea.Id}>
                                        <td>{busineesArea.Name}</td>
                                        <td><span className="glyphicon glyphicon-edit edit-btn cursor" onClick={this.showEditBusinessAreaModal.bind(this, busineesArea)}></span></td>
                                        <td><span className="glyphicon glyphicon-remove delete-btn cursor" onClick={this.showDeleteBusinessAreaModal.bind(this, busineesArea)}></span></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/*ADD BusinessArea MODAL*/}
                    <Modal show={this.state.addBusinessAreaModalOpen} onHide={this.hideAddBusinessAreaModal.bind(this)}>
                        <form id="editTooltip">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideAddBusinessAreaModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Add Client</h4>
                            </div>
                            <div className="modal-body">
                                {this.state.activeBusinessArea &&
                                    <div>
                                        <div className="form-group">
                                        <label>Client Name: </label>
                                            <input name="Name" value={this.state.activeBusinessArea.Name} className="wide" onChange={this.handleBusinessAreaModalInputChange.bind(this)} required />
                                        </div>
                                    </div>}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideAddBusinessAreaModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.addActiveBusinessAreaModal.bind(this)}>Add</button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/*EDIT BusinessArea MODAL*/}
                    <Modal show={this.state.eidtBusinessAreaModalOpen} onHide={this.hideEditBusinessAreaModal.bind(this)}>
                        <form id="editTooltip">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideEditBusinessAreaModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit</h4>
                            </div>
                            <div className="modal-body">
                                {this.state.activeBusinessArea &&
                                    <div>
                                        <div className="form-group">
                                            <label>{this.state.activeTooltip.Name}</label>
                                        </div>

                                        <div className="form-group">
                                        <label>Client Name: </label>
                                            <input name="Name" value={this.state.activeBusinessArea.Name} className="wide" onChange={this.handleBusinessAreaModalInputChange.bind(this)} required />
                                        </div>
                                    </div>}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideEditBusinessAreaModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.editActiveBusinessAreaModal.bind(this)}>{localResource.modalSave}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>

                    {/*DELETE BusinessArea MODAL*/}
                    <Modal show={this.state.deleteBusinessAreaModalOpen} onHide={this.hideDeleteBusinessAreaModal.bind(this)}>
                        <form id="editTooltip">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideDeleteBusinessAreaModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit</h4>
                            </div>
                            <div className="modal-body">
                                {this.state.activeBusinessArea &&
                                    <div>
                                        <div className="form-group">
                                            <label>{this.state.activeTooltip.Name}</label>
                                        </div>

                                        <div className="form-group">
                                        <label>Client Name: </label>
                                            <input className="fullWidthInput" disabled={true} name="Name" value={this.state.activeBusinessArea.Name} onChange={this.handleBusinessAreaModalInputChange.bind(this)} required />
                                        </div>
                                    </div>}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideDeleteBusinessAreaModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.deleteActiveBusinessAreaModal.bind(this)}>{localResource.modalDelete}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>
                </div>}
                <br />
                <div hidden={this.state.isTenantAdmin !== undefined && this.state.isTenantAdmin === false}>
                    {/*Tooltip*/}
                    <div>
                        <h2 className="text-uppercase">Tooltip Manage</h2>
                        <div>
                            <table className="table table-striped pbi-table">
                                <thead>
                                    <tr>
                                        <td>Menu</td>
                                        <td>Tooltip</td>
                                        <td></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.tooltips.map(entity =>
                                        <tr key={entity.Id}>
                                            <td>{entity.Name}</td>
                                            <td>{entity.Value}</td>
                                            <td><span className="glyphicon glyphicon-edit edit-btn cursor" onClick={this.showEditTooltipModal.bind(this, entity)}></span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/*EDIT Tooltip MODAL*/}
                    <Modal show={this.state.editTooltipModalOpen} onHide={this.hideEditTooltipModal.bind(this)}>
                        <form id="editTooltip">
                            <div className="modal-header">
                                <button type="button" className="close" aria-label="Close" onClick={this.hideEditTooltipModal.bind(this)}><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Edit</h4>
                            </div>
                            <div className="modal-body">
                                {this.state.activeTooltip != null &&
                                    <div>
                                        <div className="form-group">
                                            <label>{this.state.activeTooltip.Name}</label>
                                        </div>

                                        <div className="form-group">
                                            <label>Tooltip: </label>
                                            <input className="tooltipInput wide" name="Value" value={this.state.activeTooltip.Value} onChange={this.handleTooltipInputChange.bind(this)} required />
                                        </div>
                                    </div>}
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" onClick={this.hideEditTooltipModal.bind(this)}>{localResource.modalCancel}</button>
                                    <button type="button" className="btn btn-primary" onClick={this.editTooltipModal.bind(this)}>{localResource.modalSave}</button>
                                </div>
                            </div>
                        </form>
                    </Modal>
                </div>
                {this.state.isAuthorized !== undefined && this.state.isAuthorized === false && <div className="AlertText">{localResource.NoPermision}</div>}
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) => {
    const State = Object.assign({}, state.adminConfig, state.common, state.adminTenants);
    return State;
}

let CommonActionCreators = Object.assign({}, AdminConfigStore.actionCreators, CommonStore.actionCreators, AdminTenantsStore.actionCreators);

export default connect(mapStateToProps, CommonActionCreators)(AdminConfig);




