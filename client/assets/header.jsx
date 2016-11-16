import React from 'react';
import { Link } from 'react-router';

export default class HeaderComponent extends React.Component {

    constructor(props) {
        super(props);

        this.showSideNav = this.showSideNav.bind(this);
        this.hideSideNav = this.hideSideNav.bind(this);
    }

    showSideNav() {
        const sidenav = this.refs.sidenav;

        if (!sidenav) {
            return;
        }

        sidenav.className = 'sidenav sidenav-expanded';
    }

    hideSideNav() {
        const sidenav = this.refs.sidenav;

        if (!sidenav) {
            return;
        }

        sidenav.className = 'sidenav';
    }

    render() {
        return (<div>
                <header>
                    <Link to="/">
                        <div className="title-container">
                            <img className="icon" src="/img/raspi.png" alt="Raspberry pi"/>
                            <h1>{this.props.title}</h1>
                        </div>
                    </Link>
                    <nav>
                        <Link className="btn-nav" to="videos">Videos</Link>
                        <Link className="btn-nav" to="/user">Profile</Link>
                        <Link className="btn-nav btn-logout" to="/logout">Logout</Link>
                    </nav>
                    <img id="toggleSidenav" onClick={this.showSideNav} className="sidenav-toggle"
                         src="/img/icon-menu.svg" alt="Menu icon"/>
                </header>
                <div ref="sidenav" className="sidenav">
                    <div className="sidenav-header">
                        <h3 className="sidenav-title">Menu</h3>
                        <strong className="btn-sidenav-exit" onClick={this.hideSideNav}>x</strong>
                    </div>
                    <div className="sidenav-buttons">
                        <Link className="btn-sidenav" to="/">Home</Link>
                        <Link className="btn-sidenav" to="videos">Videos</Link>
                        <Link className="btn-sidenav" to="user">Profile</Link>
                        <Link className="btn-sidenav btn-sidenav-logout" to="logout">Logout</Link>
                    </div>
                </div>
            </div>
        );
    }
}