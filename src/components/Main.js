import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect_to_socket, disconnect } from '../socket/socket';
import { get, post } from '../api';
import { SERVER_PORT, SERVER_URL, TOKEN_NAME } from '../consts/app-config';
const url = `${SERVER_URL}:${SERVER_PORT}`;

class Routes extends Component {
	constructor(props) {
		super(props);
		const socket = connect_to_socket(url);
		if (props.session_id) socket.on(props.session_id, this.subAction);
		this.state = {
			socket,
			actions: [],
		};
	}

	componentDidMount = async () => {
		const { session_id } = this.props;
		let response = {};
		if (session_id) response = await get(`/${session_id}`);
		else response = await get('/base');
		this.setState(response);
	};

	subAction = action => {
		this.setState({ actions: [...this.state.actions, JSON.parse(action)] });
	};

	componentWillUnmount = () => {
		disconnect(this.state.socket);
	};

	joinUser = () => {
		const { session_id } = this.state;
		const value = document.getElementById('name').value;
		post('/user', { user: value }).then(response => {
			if (response.token) window.localStorage.setItem(TOKEN_NAME, response.token);
			if (session_id)
				this.state.socket.emit(
					'joinstream',
					JSON.stringify({
						user: value,
						session_id,
					}),
				);
			this.setState(response);
		});
	};

	createChannel = (movie_id, history) => {
		get(`/stream/${movie_id}`).then(response => {
			history.push(`/party/${response.session_id}`);
			this.state.socket.on(response.session_id, this.subAction);
			this.setState(response);
		});
	};

	buttonAction = action => {
		this.state.socket.emit(
			'socketstream',
			JSON.stringify({
				session_id: this.state.session_id,
				user: this.state.user,
				moviedata: { action, time: 1 },
			}),
		);
	};

	render() {
		const { session_id, history } = this.props;
		const { server, user, movieSession, movies, actions } = this.state || {};
		const { movie_name, user: movie_user } = movieSession || {};
		return (
			<>
				<b>Server: </b>
				{server}
				<br />
				{user ? (
					<>
						<b>User: </b>
						<label id="user">{user}</label>
					</>
				) : (
					<div id="ask" className="bordered">
						Name: <input type="text" id="name" />
						<button onClick={this.joinUser}>
							<span>Join!</span>
						</button>
					</div>
				)}
				<br />
				{session_id ? (
					<>
						<b>Session: </b>
						{session_id}
						<br />
						<b>Movie: </b>
						{movie_name}
						<br />
						<b>Creator: </b>
						{movie_user}
						<br />
						<br />
						<div id="channel" className="bordered">
							<div id="input">
								<button onClick={() => this.buttonAction('play')}>Play</button>
								<button onClick={() => this.buttonAction('pause')}>Pause</button>
							</div>
							<span className="message">
								{actions.map((action, key) => (
									<div key={`action${key}`}>
										{action.user} : <b> {action.msg} </b> {(action.moviedata || {}).action}
									</div>
								))}
							</span>
						</div>
					</>
				) : (
					<div id="channel">
						{(movies || []).map(({ data, key }) => (
							<div key={key}>
								{data.movie_name}{' '}
								<button onClick={() => this.createChannel(key, history)}>stream</button>
							</div>
						))}
					</div>
				)}
			</>
		);
	}
}

Routes.propTypes = {
	session_id: PropTypes.string,
	history: PropTypes.shape({}),
};

export default Routes;
