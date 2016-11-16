import React, { Component } from 'react';

export default class LoginComponent extends Component {

    render() {
        return <form action="" className="form form-login">
            <div className="input-divider">
                <label htmlFor="userEmail">Email</label>
                <input id="userEmail" type="email" name="email" placeholder="john.snow@westeros.com" required autoFocus/>
            </div>
            <div className="input-divider">
                <label htmlFor="userPassword">Password</label>
                <input id="userPassword" type="password" name="password" placeholder="S3cr3T" required/>
            </div>
            <button className="btn btn-submit">Login</button>
        </form>;
    }
}