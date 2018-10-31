import * as React from 'react';
import { ApplicationState } from '../store';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { UserNav, UserNavMenu, UserNavMenuSection, UserNavButton } from '@dnvgl/veracity-common/es/components/UserNav';
import {SvgIcon} from '@dnvgl/veracity-common/es/components/SvgIcon';
import UserBusinessCard from '@dnvgl/veracity-common/es/components/UserBusinessCard';
import PipeSeparatedList from '@dnvgl/veracity-common/es/components/PipeSeparatedList';
import MenuButton from '@dnvgl/veracity-common/es/components/MenuButton';

//import Svg from '@veracity/ui-react/Svg';
//import Button, { ButtonType } from '@veracity/ui-react/Button';
//import BusinessCard from '@veracity/ui-react/BusinessCard';
//import { iSupport, iAlert, iServices, iProfile } from '@veracity/ui-react/icons';
//import MenuList, { Menu, Section } from '@veracity/ui-react/MenuList';


export class NavMenu extends React.Component<any, any> {
    //closeMenu?: (id?: string) => void;

    constructor(props) {
        super(props);
        this.state = {
            services: [],
            isShowMenu: true,
            user: {}
        };
    }
    componentWillMount() {
        this.setState({ isShowMenu: this.props.isShowMenu });

        if (this.props.user) {
            this.setState({ user: this.props.user });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user) {
            this.setState({ user: nextProps.user });
        }

        this.setState({ isShowMenu: nextProps.isShowMenu });
    }

    showNavbar() {
        let theUser = this.state.user;
        if (theUser.Roles === undefined || theUser.Roles.length === 0)
            return false;
        if (theUser.Roles.indexOf('DataReader') > -1 && theUser.Roles.length === 1)
            return false;
        if (theUser.Roles.lengh === 0)
            return false;
        return true;
    }

    userNavOnclick() {
        window.open('https://my.dnvgl.com/Notifications') ;
    }

    //recevieCloseFunction = (closeMenuFunc: any) => {
    //    this.closeMenu = closeMenuFunc;
    //}


    //linkClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    //    evt.preventDefault();
    //    if (this.closeMenu) {
    //        this.closeMenu();
    //    }
    //}

    public render() {
        let home = sessionStorage.getItem('tenant');
        return <header className="header header-dnvgl">
            <div className="container space-stack">
                <div className="pull-left branding">
                    <NavLink to={'/' + home} activeClassName="logo logo-responsive">
                        {this.state.user.HeadIcon ? <div><img src={this.state.user.HeadIcon} /></div> : <div className="logo-image" />}
                    </NavLink>
                </div>
                <div className="navbar-header pull-right headRightDiv">
                    <div className="site-title"><span className="hidden-xs">{this.state.user.TenantName}</span></div>
                    <div className="verticalLine"></div>
                    <div className="hidden-xs site-title">
                        {/*<span className="badge badge-info">3</span>*/}
                        {/*<span className="caret"></span>*/}
                    </div>
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    {
                    //<div className="basicmenu-demo">
                    //    <MenuList receiveCloseFunction={this.recevieCloseFunction}>
                    //        <a href="http://ulv.no" className="vui-button" data-type="transparent" data-id="support">
                    //            <Svg src={iSupport} alt="Icon for support" />
                    //        </a>
                    //        <Button type={ButtonType.transparent} count="5" onClick={this.userNavOnclick} data-id="notifications">
                    //            <Svg src={iAlert} alt="icon" />
                    //        </Button>
                    //        <Menu buttonContent={<Svg src={iServices} alt="Icon for My Services button" />} id="MyServices">
                    //            <Section heading="PowerBI Framework">
                    //                <a href={"/" + home} onClick={this.linkClick}>Home</a>
                    //                <a href={"/" + home + "/administration"} onClick={this.linkClick}>Admin</a>
                    //            </Section>
                    //            <Section heading="My Services">
                    //                {this.state.user.Services && this.state.user.Services.map(service =>
                    //                    <a href={service.serviceUrl} >{service.name}</a>
                    //                )}
                    //            </Section>
                    //        </Menu>
                    //        <Menu buttonContent={<Svg src={iProfile} alt="Icon for Profile button" />} id="Profile">
                    //            <Section heading="Your profile" strong>
                    //                <BusinessCard name="Ola Nordmann" company="Norge AS" />
                    //            </Section>
                    //            <Section heading="Manage account">
                    //                <a href="/" onClick={this.linkClick}>Settings</a>
                    //                <a href="/" onClick={this.linkClick}>Log out</a>
                    //            </Section>
                    //        </Menu>
                    //    </MenuList>
                    //</div>
                    }

                    <PipeSeparatedList>
                        <MenuButton onClick={() => { this.setState({ menuOpen: !this.state.menuOpen }) }} />
                    </PipeSeparatedList>
                    <UserNav>
                        <a href="https://my.dnvgl.com/form/Support" target="_blank"><SvgIcon name={SvgIcon.ICON.support} /></a>
                        <UserNavButton icon={SvgIcon.ICON.alert} title="Notifications" onClick={this.userNavOnclick} counter={this.state.user.MessageCount}/>
                        <UserNavMenu icon={SvgIcon.ICON.services} title="Apps">
                            {this.state.services && this.state.services.length>0 && <UserNavMenuSection heading="My Services" strong={true} />}
                            <UserNavMenuSection heading="PowerBI Framework">
                                <NavLink exact to={"/" + home } activeClassName="active" data-usernav-closemenu="">Home</NavLink>
                                <NavLink exact to={"/" + home + "/administration"} activeClassName="active" data-usernav-closemenu="">Admin</NavLink>
                            </UserNavMenuSection>
                            <UserNavMenuSection heading="My Services">
                                {this.state.user.Services && this.state.user.Services.map(service =>
                                    <a href={service.serviceUrl} >{service.name}</a>
                                    )}
                            </UserNavMenuSection>
                        </UserNavMenu>
                        <UserNavMenu icon={SvgIcon.ICON.profile} title="This is the title of the button">
                            <UserNavMenuSection heading="Your profile" strong={true}>
                                <UserBusinessCard name={this.state.user.Name} />
                            </UserNavMenuSection>
                            <UserNavMenuSection heading="Manage account">
                                <a href='/Home/Logout'>Log Out</a>
                            </UserNavMenuSection>
                        </UserNavMenu>
                    </UserNav>
                </div>
            </div>
            {
                this.state.isShowMenu &&
                <nav className="navbar navbar-dnvgl ">
                    {this.showNavbar() && 
                    <div className="container">
                        {
                            <div id="navbar" className="navbar-collapse collapse" aria-expanded="false">
                            {/*<div href="#" className="dropdown-toggle notification-item pull-right" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                            <div className="badge badge-info">3</div> Tore Tang <span className="caret"></span>
                        </div>*/}
                            <div className="dropdown-menu"><p>Hello</p></div>
                            <ul className="nav navbar-nav">
                                <li>
                                        <NavLink exact to={'/' + home} activeClassName="active"><span className="glyphicon glyphicon-home"></span> Home</NavLink>
                                </li>
                                <li>
                                        <NavLink to={'/' + home + '/administration'} activeClassName="active"><span className="glyphicon glyphicon-cog"></span> Admin</NavLink>
                                </li>
                            </ul>
                        </div>}
                    </div>}
                </nav>
            }


        </header>;
    }
}