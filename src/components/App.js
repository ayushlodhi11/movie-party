import React from 'react';
import { hot } from 'react-hot-loader';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import MainPage from './Main';

class App extends React.Component {
	render() {
		return (
			<>
				<h1> Movie Mafiya </h1>
				<Router>
					<Switch>
						<Route exact path="/" render={({ history }) => <MainPage history={history} />} />
						<Route
							exact
							path="/party/:session"
							render={({ match, history }) => (
								<MainPage session_id={match.params.session} history={history} />
							)}
						/>
					</Switch>
				</Router>
			</>
		);
	}
}

export default hot(module)(App);
