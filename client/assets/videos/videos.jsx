import React, { Component } from 'react';

import HeaderComponent from '../header.jsx';

export default class VideosComponent extends Component {

    render() {
        return <div className="content">
            <HeaderComponent title="PiServer" />
            <h2 className="sub-title">Videos</h2>

            <section>
                <h3 className="sub-title">Movies</h3>
            </section>

            <section>
                <h3 className="sub-title">TV-shows</h3>
            </section>
        </div>;
    }
}