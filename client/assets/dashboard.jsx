import React from 'react';

import HeaderComponent from './header.jsx';
import LoginComponent from './login/login.jsx';

export default class DashboardComponent extends React.Component{

    render() {
        return <div className="content">
            <HeaderComponent title="PiServer" />
            <h2 className="sub-title">Dashboard</h2>

            <section>
                <h3 className="sub-title">Login</h3>
                <LoginComponent />
            </section>
        </div>;
    }
}