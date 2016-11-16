import React from 'react';
import { render} from 'react-dom';
import { Router, Route, IndexRoute, browserHistory} from 'react-router';

import FooterComponent from './footer.jsx';
import DashboardComponent from './dashboard.jsx';
import VideosComponent from './videos/videos.jsx';

class App extends React.Component {
    constructor() {
        super();
        this.state = {title: 'PiServer'};
    }

    render() {
        return <div>
            <Router history={browserHistory}>
                <Route path="/" component={DashboardComponent} />
                <Route path="videos">
                    <IndexRoute component={VideosComponent} />
                </Route>
            </Router>
            <FooterComponent/>
        </div>;
    }
}

render(
    <App/>,
    document.getElementById('app'));