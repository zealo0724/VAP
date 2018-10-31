import 'core-js/shim';
import './sass/site.scss';
import './css/site.css';
import 'bootstrap';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import routes from './routes';
import configureStore from './configureStore';
import { ApplicationState } from './store';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'react-router-redux';
import { BrowserRouter, Route } from 'react-router-dom';

// Get the application-wide store instance, prepopulating with state from the server where available.
const initialState = (window as any).initialReduxState as ApplicationState;
const history = createBrowserHistory();
const store = configureStore(history, initialState);

// This code starts up the React app when it runs in a browser. It sets up the routing configuration
// and injects the app into a DOM element.
ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history} children={routes} />
    </Provider>,
    document.getElementById('react-app')
);
