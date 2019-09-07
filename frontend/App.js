import React from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, TouchableHighlight, ScrollView, Image } from 'react-native';
import { Container, Button, Item, Input, Label, Header, Left, Right, Title, Body, Form, Content, Tabs, Tab, TabHeading, Icon } from "native-base";
import DatePicker from 'react-native-datepicker'
import PropTypes from 'prop-types';

import Expo from "expo"
import { FlatList } from 'react-native';
import { ListItem, List } from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown';

import { GiftedChat } from 'react-native-gifted-chat';
import { Component } from 'react';

import { Constants, ImagePicker, Permissions } from 'expo';

PORT = '7778'
IP = '<HOST>:'
IMAGE_URL_HEADERLOGO = IP + PORT + '/www/appicon_white.png'
IMAGE_URL_LOGINLOGO = IP + PORT + '/www/appicon_white.png'

let reg = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/ ;

export default class App extends React.Component {

	constructor(props) {
		super(props);
		this.state = { 
			data: [],
			mainView: 'login', 
			tab: 0,
			token: '',
			email: '',
			userid: '', 
			first_name: '', 
			last_name: '',
			birth_date: '',
			browseGroupData: [],
			currentGroupDetails: {},
			currentGroupEventDetails: [],
			groupMembers: [],
			eventName: '',
			eventLocation: '',
			eventTime: '',
			eventRecurrency: '',
			locationNames: [],
			eventLocation: '',
			recurrencies: [ {'value': 'One time'}, {'value': 'Weekly'}, {'value': 'Bi-Weekly'}, {'value': 'Monthly'} ],
			myGroupData: [],
			alreadyJoined: 'Leave',
			backButton: 'None',
			messages: [],
			groupName: '', 
			sportsNames: [],
			description: '',
			capacity: 0,
			sport: '',
			filterView: 'None',
			filterActivate: {
				'sport': {'Basketball': false, 'Bouldering': false, 'Football': false, 'Pole dancing': false, 'Soccer': false, 'Squash': false,
				'Swimming': false, 'Swing dancing': false, 'Tennis': false, 'Volleyball': false
			},
				'gender': {'Male': false, 'Female': false},
				'skill': {'Beginners': false, 'Intermediate': false, 'Advanced': false, 'Professional': false},
				'degree_level': {'Undergraduate': false, 'Graduate': false, 'PhD': false, 'Faculty': false}

			},
			addTag: {
				'gender': {'Male': false, 'Female': false},
				'skill': {'Beginners': false, 'Intermediate': false, 'Advanced': false, 'Professional': false},
				'degree_level': {'Undergraduate': false, 'Graduate': false, 'PhD': false, 'Faculty': false}

			},
			initaltab: 0,
			userImage: '',
			groupImage: '',
			userImage_default: IP + PORT + '/www/defaultuser.png',
			groupImage_default: IP + PORT + '/www/defaultgroup.png',
			loginFailure: {first_name: false, last_name: false, birth_date: false},
			addGroupFailure: {groupName: false, sport: false, capacity: false, description:false},
			addEventFailure: {eventName: false, eventLocation: false, eventTime: false, eventRecurrency:false}
		};

		Expo.Font.loadAsync({
			Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf"),
		});

		

		//const result = Expo.Google.logInAsync({
        //iosClientId: '20965665016-oeq6harhm8c16jh5jo365tmdmjkpb09n.apps.googleusercontent.com',
        //scopes: ["profile", "email"],
        //behavior: 'system',
        //offlineAccess: true,
        //webClientId: '20965665016-n31o4g7kv3k8407cotuql91vo1vtvvcl.apps.googleusercontent.com'
    //}).then(res => {console.log(res);
    //})
	}

	 takePhoto = async (type) => {
	    const {
	      status: cameraRollPerm
	    } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

	    // only if user allows permission to camera AND camera roll
	    if (cameraRollPerm === 'granted') {
	      let pickerResult = await ImagePicker.launchImageLibraryAsync({
	        allowsEditing: true,
	        aspect: [1, 1],
	      });
	      if (!pickerResult.cancelled) {
	      	if (type == 'user') {
	      		this.setState({ userImage: pickerResult.uri })
	      	}
	      	if (type == 'group') {
	      		this.setState({ groupImage: pickerResult.uri })
	      	}
	      }
	    }
	};

	registerWithImage = () => {
		let apiUrl = IP + PORT + '/registerWithImage';
		let formData = new FormData();
		if (this.state.userImage != '') {
			let uri = this.state.userImage
			let uriParts = uri.split('.');
			let fileType = uriParts[uriParts.length - 1];
			formData.append('photo', {
				uri,
				name: `photo.${fileType}`,
				type: `image/${fileType}`,
			});
		}
		formData.append("email", this.state.email);
		formData.append("token", this.state.token);
		formData.append("first_name", this.state.first_name);
		formData.append("last_name", this.state.last_name);
		formData.append("birth_date", this.state.birth_date);
		let options = {
			method: 'POST',
			body: formData,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'multipart/form-data',
			},
		};
		return fetch(apiUrl, options).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('error')) {
					this.showError(responseJson.error);
				}
				this.setState({ mainView: responseJson.mainView })
				this.getUserProfile()
				this.getMyGroups()
				this.getGroups()
				this.getSports()
				this.getLocations()
			})
			.catch((error) => {
				console.error(error);
			});
	}

	isPositiveInteger = (n) => {
		return n >>> 0 === parseFloat(n);
	}

	testAddGroupWithImage = () => {
		bl_valid = true
		tmp_addGroupFailure = {groupName: false, sport: false, capacity: false, description:false}
		if (this.state.groupName.length==0) {
			tmp_addGroupFailure['groupName'] = true
			bl_valid = false
		}
		if (this.state.sport.length==0) {
			tmp_addGroupFailure['sport'] = true
			bl_valid = false
		}
		if (this.state.description.length==0) {
			tmp_addGroupFailure['description'] = true
			bl_valid = false
		}
		if ((!this.isPositiveInteger(this.state.capacity)) || (this.state.capacity.length==0)) {
			tmp_addGroupFailure['capacity'] = true
			bl_valid = false
		}
		if (this.isPositiveInteger(this.state.capacity)) {
			if (parseFloat(this.state.capacity)<=0) {
				tmp_addGroupFailure['capacity'] = true
				bl_valid = false
			}
		}
		this.setState({ addGroupFailure: tmp_addGroupFailure })
		if (bl_valid) {
			this.addGroupWithImage()
			this.setState({addGroupFailure: {groupName: false, sport: false, capacity: false, description:false}})
		} else {
			this.showError('Please fill out all required field. \n \n Capacity needs to be a positive integer')
		}
	}

	addGroupWithImage = () => {
		let apiUrl = IP + PORT + '/addGroupWithImage';
		let formData = new FormData();
		if (this.state.groupImage != '') {
			let uri = this.state.groupImage
			let uriParts = uri.split('.');
			let fileType = uriParts[uriParts.length - 1];
			formData.append('photo', {
				uri,
				name: `photo.${fileType}`,
				type: `image/${fileType}`,
			});
		}
		formData.append("email", this.state.email);
		formData.append("token", this.state.token);
		formData.append("groupName", this.state.groupName);
		formData.append("sport", this.state.sport);
		formData.append("capacity", this.state.capacity);
		formData.append("description", this.state.description);
		formData.append("addTag", JSON.stringify(this.state.addTag));
		let options = {
			method: 'POST',
			body: formData,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'multipart/form-data',
			},
		};
		return fetch(apiUrl, options).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('error')) {
					this.showError(responseJson.error);
				}
				if (responseJson.hasOwnProperty('msg')) {
					this.showMsg(responseJson.msg);
				}
				this.setState({ mainView: 'groupDetails' })
				this.getMyGroups(this.state.groupName)
				this.getGroups()
				this.setState({alreadyJoined: 'Leave' })
				this.setState({initaltab: 0})
				this.setState({tab: 0})
			}).catch((error) => {
				console.error(error);
			})
	}

	selectImage = (type) => {
		this.takePhoto(type)
	}

	showError = (msg) => {
		Alert.alert(
					'Error',
					msg,
					[
					{text: 'OK'},
					],
					{ cancelable: false }
					);

	};

	showMsg = (msg) => {
		Alert.alert(
					'Info',
					msg,
					[
					{text: 'OK'},
					],
					{ cancelable: false }
					);

	}

	showMsgCancel = (title, msg, fct) => {
		if (fct == 'leaveGroup') {
			Alert.alert(
						title,
						msg,
						[
						{text: 'Cancel', onPress: () => {}, style: 'cancel'},
						{text: 'OK', onPress: () => {this.leaveGroup()}},
						],
						{ cancelable: false }
						);
		}
		if (fct == 'logout') {
			Alert.alert(
						title,
						msg,
						[
						{text: 'Cancel', onPress: () => {}, style: 'cancel'},
						{text: 'OK', onPress: () => {this.logout()}},
						],
						{ cancelable: false }
						);
		}

	}

	getGroups = () => {
		fetch(IP + PORT + '/getGroups', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email,
				"appliedFilter": this.state.filterActivate
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ browseGroupData: responseJson['result'] })
			})
	}

	getGroupMessages = (gid) => {
		fetch(IP + PORT + '/getGroupMessages', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email,
				"groupid": gid,
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ messages: responseJson['result'] })
				formated_messages = [];
				for (i = 0; i < this.state.messages.length; i++) {
					msg = this.state.messages[i];
					msg_dict = {};
					msg_dict['user'] = {};
					msg_dict['_id'] = msg._id;
					msg_dict['createdAt'] = msg.createdat;
					msg_dict['text'] = msg.text;
					msg_dict['user']['_id'] = msg.userid;
					msg_dict['user']['name'] = msg.name;
					if (((msg.avatar == '') || (msg.avatar == null))) {
						msg_dict['user']['avatar'] = ''
					} else {
						msg_dict['user']['avatar'] = IP + PORT + msg.avatar;
					}
					formated_messages.push(msg_dict);
				}
				this.setState({messages: formated_messages});
			})
	}

	getMyGroups = (gname = '') => {
		fetch(IP + PORT + '/getMyGroups', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ myGroupData: responseJson['result'] })
				tmp_item = {}
				if (gname!='') {
					for (i = 0; i < this.state.myGroupData.length; i++) {
						if (this.state.myGroupData[i].name == gname) {
							tmp_item = this.state.myGroupData[i]
						}
					}
				}
				this.setState({ currentGroupDetails: tmp_item })
			})
	}

	login = (token, email) => {
		fetch(IP + PORT + '/login', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": token,
				"email": email
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('error')) {
					this.showError(responseJson.error);
				}
				this.setState({ mainView: responseJson.mainView })
				if (responseJson.mainView == 'main') {
					this.getUserProfile()
					this.getGroups()
					this.getMyGroups()
					this.getSports()
					this.getLocations()
				}
			})
			.catch((error) => {
				console.error(error);
			})
	}

	displayGroupInfo = (item, type) => {
		this.setState({mainView: 'groupDetails'})
		this.setState({currentGroupDetails: item})
		this.setState({backButton: 'BackToMain'})
		this.setState({initaltab: this.state.tab})
		this.getGroupMessages(item.gid)
	}

	joinGroup = (email, gid) => {
		fetch(IP + PORT + '/joinGroup', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"email": email,
				"token": this.state.token,
				"gid": gid
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('msg')) {
					this.showMsg(responseJson.msg);
				}
				this.setState({ mainView: 'groupDetails' })
				this.getMyGroups(this.state.currentGroupDetails.name)
				this.getGroups()
				this.setState({alreadyJoined: 'Leave' })
				this.setState({initaltab: 0})
				this.setState({tab: 0})
			})
			.catch((error) => {
				console.error(error);
			})
	}

	getEvents = (gid) => {
		fetch(IP + PORT + '/getEvents', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"gid": gid,
				"token": this.state.token,
				"email": this.state.email
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('msg')) {
					this.showMsg(responseJson.msg);
				}
					this.setState({currentGroupEventDetails: responseJson['result']})
					this.setState({ mainView: 'currentGroupEvents' })
			})
			.catch((error) => {
				console.error(error);
			})
	}

	leaveGroup = () => {
		email = this.state.email;
		gid = this.state.currentGroupDetails.gid;
		fetch(IP + PORT + '/leaveGroup', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"email": email,
				"gid": gid,
				"token": this.state.token,
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('msg')) {
					this.showMsg(responseJson.msg);
				}
				this.getMyGroups()
				this.getGroups()
				this.setState({ mainView: 'main'})
				this.setState({ backButton: 'None'})
			})
			.catch((error) => {
				console.error(error);
			})
	}

	loginWithGoogle = () => {
		const result = Expo.Google.logInAsync({
        iosClientId: '1092040825912-5p2ud8d36hrcqi21gtn3su9nnjiv854t.apps.googleusercontent.com',
        scopes: ["profile", "email"],
        behavior: 'system',
        offlineAccess: true,
        webClientId: '1092040825912-3etla59o6rokkj6c30r85n8lds3g0obd.apps.googleusercontent.com'}).then(
        	res => {
        		this.login(res['idToken'], res['user']['email'])
        		this.setState({ token: res['idToken'] })
        		this.setState({ email: res['user']['email'] })
        	}
        ).catch(() => {
				
		})
	}

	getUserProfile = () => {
		fetch(IP + PORT + '/getUserProfile', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email,
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('error')) {
					this.showError(responseJson.error);
				}
				this.setState({ first_name: responseJson.result[0].first_name })
				this.setState({ last_name: responseJson.result[0].last_name })
				this.setState({ birth_date: responseJson.result[0].birth_date })
				this.setState({ userid: responseJson.result[0].userid })
				this.setState({ userImage: responseJson.result[0].image_url })
			})
			.catch((error) => {
				console.error(error);
			})
	}

	cancelSignUp = () => {
		this.setState({ mainView: 'login' })
		this.logout()
	}

	signUp = () => {
		if (this.testSignUp()) {
			this.registerWithImage()
			this.setState({ loginFailure: {first_name: false, last_name: false, birth_date: false} })
		}
	}

	testSignUp = () => {
		bl_valid = true
		tmp_loginFailure = {first_name: false, last_name: false, birth_date: false}
		if (this.state.first_name.length==0) {
			tmp_loginFailure['first_name'] = true
			bl_valid = false
		}
		if (this.state.last_name.length==0) {
			tmp_loginFailure['last_name'] = true
			bl_valid = false
		}
		if (!reg.test(this.state.birth_date)) {
			tmp_loginFailure['birth_date'] = true
			bl_valid = false
		}
		if (!bl_valid) {
			this.showError('Please fill out all required field. \n \n The birthdate format is yyyy-mm-dd')
		}
		this.setState({ loginFailure: tmp_loginFailure })
		return(bl_valid)
	}

	logout = () => {
		this.setState(this.state = { 
			data: [],
			mainView: 'login', 
			tab: 0,
			token: '',
			email: '',
			userid: '', 
			first_name: '', 
			last_name: '',
			birth_date: '',
			browseGroupData: [],
			currentGroupDetails: {},
			currentGroupEventDetails: [],
			groupMembers: [],
			eventName: '',
			eventLocation: '',
			eventTime: '',
			eventRecurrency: '',
			locationNames: [],
			eventLocation: '',
			recurrencies: [ {'value': 'One time'}, {'value': 'Weekly'}, {'value': 'Bi-Weekly'}, {'value': 'Monthly'} ],
			myGroupData: [],
			alreadyJoined: 'Leave',
			backButton: 'None',
			messages: [],
			groupName: '', 
			sportsNames: [],
			description: '',
			capacity: 0,
			sport: '',
			filterView: 'None',
			filterActivate: {
				'sport': {'Basketball': false, 'Bouldering': false, 'Football': false, 'Pole dancing': false, 'Soccer': false, 'Squash': false,
				'Swimming': false, 'Swing dancing': false, 'Tennis': false, 'Volleyball': false
			},
				'gender': {'Male': false, 'Female': false},
				'skill': {'Beginners': false, 'Intermediate': false, 'Advanced': false, 'Professional': false},
				'degree_level': {'Undergraduate': false, 'Graduate': false, 'PhD': false, 'Faculty': false}

			},
			addTag: {
				'gender': {'Male': false, 'Female': false},
				'skill': {'Beginners': false, 'Intermediate': false, 'Advanced': false, 'Professional': false},
				'degree_level': {'Undergraduate': false, 'Graduate': false, 'PhD': false, 'Faculty': false}

			},
			initaltab: 0,
			userImage: '',
			groupImage: '',
			userImage_default: IP + PORT + '/www/defaultuser.png',
			groupImage_default: IP + PORT + '/www/defaultgroup.png',
			loginFailure: {first_name: false, last_name: false, birth_date: false}
		})
	}

	backtomain = () => {
		this.setState({ mainView: 'main' })
		this.setState({backButton: 'None'})
	}

	backtomygroup = () => {
		this.setState({ mainView: 'groupDetails' })
		this.setState({backButton: 'BackToMain'})
	}

	backtogroupevents = () => {
		this.setState({ mainView: 'currentGroupEvents' })
		this.setState({backButton: 'BackToMyGroup'})
		this.setState({addEventFailure: {eventName: false, eventLocation: false, eventTime: false, eventRecurrency:false}})
	}
	
	changeToMessages = () => {
		this.setState({ mainView: 'chat' })
		this.setState({ backButton: 'BackToMyGroup' })
	}

	createGroup = () => {
		this.setState({backButton: 'BackToMain'})
		this.setState({mainView: 'createGroup'})
		this.setState({initaltab: this.state.tab})
		this.setState({addTag: {
			'gender': {'Male': false, 'Female': false},
			'skill': {'Beginners': false, 'Intermediate': false, 'Advanced': false, 'Professional': false},
			'degree_level': {'Undergraduate': false, 'Graduate': false, 'PhD': false, 'Faculty': false}}
		})
		this.setState({addGroupFailure: {groupName: false, sport: false, capacity: false, description:false}})
		this.setState({groupImage: ''})
	}

	viewEvents = () => {
		this.getEvents(this.state.currentGroupDetails.gid)
		this.setState({backButton: 'BackToMyGroup'})
		this.setState({mainView: 'groupEvents'})
	}

	addEvent = () => {
		this.setState({ mainView: 'addEvent' })
		this.setState({backButton: 'BackToGroupEvents'})
	}

	viewMembers = () => {
		this.getUsers(this.state.currentGroupDetails.gid)
		this.setState({ mainView: 'viewMembers' })
		this.setState({backButton: 'BackToMyGroup'})
	}

	getLocations = () => {
		fetch(IP + PORT + '/getLocations', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ locationNames: responseJson['result'] })
			})
	}

	testCreateEvent = () => {
		bl_valid = true
		tmp_addGroupFailure = {eventName: false, eventLocation: false, eventTime: false, eventRecurrency:false}
		if (this.state.eventName.length==0) {
			tmp_addGroupFailure['eventName'] = true
			bl_valid = false
		}
		if (this.state.eventLocation.length==0) {
			tmp_addGroupFailure['eventLocation'] = true
			bl_valid = false
		}
		if (this.state.eventTime.length==0) {
			tmp_addGroupFailure['eventTime'] = true
			bl_valid = false
		}
		if (this.state.eventRecurrency.length==0) {
			tmp_addGroupFailure['eventRecurrency'] = true
			bl_valid = false
		}
		this.setState({ addEventFailure: tmp_addGroupFailure })
		if (bl_valid) {
			this.createEvent()
			this.setState({addEventFailure: {eventName: false, eventLocation: false, eventTime: false, eventRecurrency:false}})
		} else {
			this.showError('Please fill out all required field.')
		}
	}

	createEvent = () => {
		fetch(IP + PORT + '/createEvent', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"eventName": this.state.eventName,
				"eventLocation": this.state.eventLocation,
				"time": this.state.eventTime,
				"recurrency": this.state.eventRecurrency,
				"gid": this.state.currentGroupDetails.gid,
				"email": this.state.email,
				"token": this.state.token
			}),
		}).then((response) => response.json())
			.then((responseJson) => {
				if (responseJson.hasOwnProperty('error')) {
					this.showError(responseJson.error);
				}
				if (responseJson.hasOwnProperty('msg')) {
					this.showMsg(responseJson.msg);
				}
				this.viewEvents()
			})
			.catch((error) => {
				console.error(error);
			})
	}

	getSports = () => {
		fetch(IP + PORT + '/getSports', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": this.state.token,
				"email": this.state.email
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ sportsNames: responseJson['result'] })
			})
	}

	getUsers = () => {
		fetch(IP + PORT + '/getUsers', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"gid": this.state.currentGroupDetails.gid,
				"token": this.state.token,
				"email": this.state.email
			}),
		}).then((response) => response.json())
			.then((responseJson) => { 
				this.setState({ groupMembers: responseJson['result'] })
			})
	}

	showFilters = () => {
		this.setState({filterView: 'FilterView'})
	}

	hideFilters = () => {
		this.setState({filterView: 'None'})
		this.getGroups()
	}

	applyFilter = (filter_type, filter_value) => {
		tmp_state = this.state.filterActivate
		tmp_state[filter_type][filter_value] = !tmp_state[filter_type][filter_value]
		this.setState({filterActivate: tmp_state})
	}

	applyTag = (filter_type, filter_value) => {
		tmp_state = this.state.addTag
		tmp_state[filter_type][filter_value] = !tmp_state[filter_type][filter_value]
		this.setState({addTag: tmp_state})
	}

	onSend(messages = []) {
		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, messages),
		}))
		this.sendMessages(messages)
	}

	setTab(i) {
		this.setState({ tab: i.i });
	}

	sendMessages = (messages) => {
		fetch(IP + PORT + '/addMessage', {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"groupid": this.state.currentGroupDetails.gid,
				"msg": messages[0].text,
				"email": this.state.email,
				"token": this.state.token
			}),
		})
	}

	render() {
		return (
			<Container>
			<Header>
					{ this.state.backButton == 'BackToMain' &&
					<TouchableOpacity onPress={ this.backtomain } hitSlop={{top: 20, bottom: 20, left: 50, right: 100}}>
						<View>
							<Icon name={'arrow-back'} style={{marginLeft: 8, marginTop: 5}}/>
						</View>
					</TouchableOpacity>
					}
					{ this.state.backButton == 'BackToMyGroup' &&
					<TouchableOpacity onPress={ this.backtomygroup } hitSlop={{top: 20, bottom: 20, left: 50, right: 100}}>
						<View>
							<Icon name={'arrow-back'} style={{marginLeft: 8, marginTop: 5}}/>
						</View>
					</TouchableOpacity>
					}
					{ this.state.backButton == 'BackToGroupEvents' &&
					<TouchableOpacity onPress={ this.backtogroupevents } hitSlop={{top: 20, bottom: 20, left: 50, right: 100}}>
						<View>
							<Icon name={'arrow-back'} style={{marginLeft: 8, marginTop: 5}}/>
						</View>
					</TouchableOpacity>
					}
				<Left/>
				<Body>
					<View style={((this.state.mainView == 'main') && (this.state.tab == 1)) ? 
													styles.header_right : 
													((this.state.backButton == 'BackToGroupEvents') || (this.state.backButton == 'BackToMyGroup') || (this.state.backButton == 'BackToMain')) ? styles.header_left : styles.header_no}>
					<Image 
							style={{width: 25, height: 25}}
							source={{uri: IMAGE_URL_HEADERLOGO}}
					/>
					<Title style={{marginTop: 2}}>UNYSport</Title>
					</View>
				</Body>
				<Right />
					{ this.state.mainView == 'main' && this.state.tab == 1 &&
					<TouchableOpacity onPress={ this.createGroup } hitSlop={{top: 20, bottom: 20, left: 100, right: 50}}>
						<View>
							<Icon name={'ios-add'} style={{marginRight: 10, marginTop: 5}} />
						</View>
					</TouchableOpacity>
					}
			</Header>
			<View style={styles.container}>
				{ this.state.mainView == 'login' &&
					[<View key={1111}>
						<Image 
							style={styles.logo_image}
							source={{uri: IMAGE_URL_LOGINLOGO}}
							/>
					</View>,
					<Button key={1} full bordered rounded dark style={{ margin: 20 }} onPress={ this.loginWithGoogle }>
						<Text>Login with Google</Text>
					</Button>]
				},
				{ this.state.mainView == 'register' &&
					<Content style={{ marginRight: 5 }}>
						<Form style={styles.form}>
							<View key={802} style={{flexDirection: 'row'}}>
							<TouchableHighlight onPress={this.selectImage.bind(this, 'user')}>
							<Image
							style={styles.profile_image}
							source={{uri: ((this.state.userImage == '') || (this.state.userImage == null)) ? this.state.userImage_default : this.state.userImage}}
							/>
							</TouchableHighlight>
							<View style={{marginLeft: 15, marginTop: 20}}>	
							<Label style={styles.label}>E-mail:</Label>
							<Text style={styles.text}>{this.state.email}</Text>
							</View>	
							</View>
							<Item floatingLabel error={ this.state.loginFailure.first_name }>
							<Label>First name:</Label>
							<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ first_name: text })}}/>
							{ (this.state.loginFailure.first_name) && <Icon name='close-circle' /> }
							</Item>
							<Item floatingLabel error={ this.state.loginFailure.last_name }>
							<Label>Last name:</Label>
							<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ last_name: text })}}/>
							{ (this.state.loginFailure.last_name) && <Icon name='close-circle' /> }
							</Item>
							<Item floatingLabel error={ this.state.loginFailure.birth_date }>
							<Label>Birthdate:</Label>
							<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ birth_date: text })}}/>
							{ (this.state.loginFailure.birth_date) && <Icon name='close-circle' /> }
							</Item>
						</Form>
						<Button key={2} full bordered rounded dark style={styles.buttonStyle1} onPress={ this.signUp }>
							<Text>Sign Up</Text>
						</Button>,
						<Button key={3} full bordered rounded dark style={styles.buttonStyle2} onPress={ this.cancelSignUp }>
							<Text>Cancel</Text>
						</Button>
					</Content>
				},
				{ this.state.mainView == 'main' &&
					<View style={{ height: 30}}>
						<Tabs 
							onChangeTab={(i) => {
								if (i.i === parseInt(i.i, 10)) {
									this.setTab(i) 
									if (i.i == 0) {
										this.setState({ alreadyJoined: 'Leave' });
										this.setState({ filterView: 'None' });
									}
									if (i.i == 1) {
										this.setState({ alreadyJoined: 'Join' });
									}
									if (i.i == 2) {
										this.setState({ filterView: 'None' });
									}
								}  
							}}
							initialPage={this.state.initaltab}
							>
							<Tab heading={ <TabHeading><Icon name="heart" /></TabHeading>}  />
							<Tab heading={ <TabHeading><Icon name="search" /></TabHeading>} />
							<Tab heading={ <TabHeading><Icon name="md-person" /></TabHeading>} />
						</Tabs>
					</View>
				},
				{ this.state.mainView == 'main' && this.state.tab == 0 &&
					<View style={{ flex: 1, marginBottom: 10}}>
						<List contentContainerStyle={{ marginTop: 100}}>
						<FlatList
							data = { this.state.myGroupData }
							keyExtractor={item => item.gid.toString() + item.name}
							renderItem = {({ item }) => (
								<ListItem
								title={ item.name }
								avatar={{uri: ((item.group_image_url == '') || (item.group_image_url == null)) ? this.state.groupImage_default : IP + PORT + item.group_image_url}}
								button onPress={() => this.displayGroupInfo(item, 'myGroup')}
								subtitleNumberOfLines={2}
											hideChevron
											/>
										)}
									/>
							</List>
					</View>
				},
				{ this.state.mainView == 'main' && this.state.tab == 1 &&
					<View style={{ flex: 1, marginBottom: 90}}>
					{ this.state.filterView == 'None' &&
						[<TouchableHighlight key={901} style={{width:100}} onPress={ this.showFilters }>
						<View style={{flexDirection: 'row'}}>
							<Icon name={'arrow-down'} style={{marginLeft: 10, marginTop: 30}}/><Text style={{marginLeft: 5, marginTop: 36, fontSize: 16}}>Filter</Text>
						</View>
						</TouchableHighlight>,
						<List key={902} containerStyle={{marginTop: 0, paddingTop:0}} automaticallyAdjustContentInsets={false}>
						<FlatList
							data = { this.state.browseGroupData }
							keyExtractor={item => item.name}
							renderItem = {({ item }) => (
								<ListItem
								title={ item.name }
								avatar={{uri: ((item.group_image_url == '') || (item.group_image_url == null)) ? this.state.groupImage_default : IP + PORT + item.group_image_url}}
								button onPress={() => this.displayGroupInfo(item, 'otherGroup')}
								subtitleNumberOfLines={2}
											hideChevron
											/>
										)}
									/>
							</List>]
				   },
				   { this.state.filterView == 'FilterView' &&
				   		[<TouchableHighlight key={903} style={{width:100}} onPress={ this.hideFilters }>
						<View style={{flexDirection: 'row'}}>
							<Icon name={'arrow-up'} style={{marginLeft: 10, marginTop: 30}}/><Text style={{marginLeft: 5, marginTop: 36, fontSize: 16}}>Filter</Text>
						</View>
						</TouchableHighlight>,
						<Label key={801} style={styles.label}>Sport:</Label>,
						<View key={802} style={{flexDirection: 'row'}}>
							<Button key={803}bordered dark onPress={this.applyFilter.bind(this, 'sport', 'Basketball') } style={!this.state.filterActivate['sport']['Basketball'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Basketball</Text>
							</Button>
							<Button key={804} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Bouldering') } style={!this.state.filterActivate['sport']['Bouldering'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Bouldering</Text>
							</Button>
							<Button key={805} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Football') } style={!this.state.filterActivate['sport']['Football'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Football</Text>
							</Button>
						</View>,
						<View key={806} style={{flexDirection: 'row'}}>
							<Button key={807} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Pole dancing') } style={!this.state.filterActivate['sport']['Pole dancing'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Pole dancing</Text>
							</Button>
							<Button key={808} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Soccer') } style={!this.state.filterActivate['sport']['Soccer'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Soccer</Text>
							</Button>
							<Button key={809} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Squash') } style={!this.state.filterActivate['sport']['Squash'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Squash</Text>
							</Button>
						</View>,
						<View key={810} style={{flexDirection: 'row'}}>
							<Button key={811} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Swimming') } style={!this.state.filterActivate['sport']['Swimming'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Swimming</Text>
							</Button>
							<Button key={812} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Swing dancing') } style={!this.state.filterActivate['sport']['Swing dancing'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Swing dancing</Text>
							</Button>
							<Button key={813} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Tennis') } style={!this.state.filterActivate['sport']['Tennis'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Tennis</Text>
							</Button>
						</View>,
						<Button key={813} bordered dark onPress={ this.applyFilter.bind(this,'sport', 'Volleyball') } style={!this.state.filterActivate['sport']['Volleyball'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Volleyball</Text>
						</Button>,
						<Label key={904} style={styles.label2}>Gender:</Label>,
						<View key={905} style={{flexDirection: 'row'}}>
							<Button key={101}bordered dark onPress={this.applyFilter.bind(this, 'gender', 'Male') } style={!this.state.filterActivate['gender']['Male'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Male</Text>
							</Button>
							<Button key={102} bordered dark onPress={ this.applyFilter.bind(this,'gender', 'Female') } style={!this.state.filterActivate['gender']['Female'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Female</Text>
							</Button>
						</View>,
						<Label key={906} style={styles.label2}>Skill:</Label>,
						<View key={907} style={{flexDirection: 'row'}}>
							<Button key={103} bordered dark onPress={ this.applyFilter.bind(this,'skill', 'Beginners') } style={!this.state.filterActivate['skill']['Beginners'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Beginners</Text>
							</Button>
							<Button key={104} bordered dark onPress={ this.applyFilter.bind(this,'skill', 'Intermediate') } style={!this.state.filterActivate['skill']['Intermediate'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Intermediate</Text>
							</Button>
							<Button key={105} bordered dark onPress={ this.applyFilter.bind(this,'skill', 'Advanced') } style={!this.state.filterActivate['skill']['Advanced'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Advanced</Text>
							</Button>
						</View>,
						<Button key={106} bordered dark onPress={ this.applyFilter.bind(this,'skill', 'Professional') } style={!this.state.filterActivate['skill']['Professional'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Professional</Text>
						</Button>,
						<Label key={910} style={styles.label2}>Degree:</Label>,
							<View key={911} style={{flexDirection: 'row'}}>
							<Button key={107} bordered dark onPress={ this.applyFilter.bind(this,'degree_level', 'Undergraduate') } style={!this.state.filterActivate['degree_level']['Undergraduate'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Undergraduate</Text>
							</Button>
							<Button key={108} bordered dark onPress={ this.applyFilter.bind(this,'degree_level', 'Graduate') } style={!this.state.filterActivate['degree_level']['Graduate'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Graduate</Text>
							</Button>
							<Button key={109} bordered dark onPress={ this.applyFilter.bind(this,'degree_level', 'PhD') } style={!this.state.filterActivate['degree_level']['PhD'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>PhD</Text>
							</Button>
						</View>,
						<Button key={110} bordered dark onPress={ this.applyFilter.bind(this,'degree_level', 'Faculty') } style={!this.state.filterActivate['degree_level']['Faculty'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Faculty</Text>
						</Button>
						]
				   }
				   </View>
				},
				{ this.state.mainView == 'main' && this.state.tab == 2 &&
					<View style={styles.form}>
						<View style={{flexDirection: 'row'}}>
							<Image
							style={styles.profile_image}
							source={{uri: ((this.state.userImage == '') || (this.state.userImage == null)) ? this.state.userImage_default : IP + PORT + this.state.userImage}}
							/>
							<View style={{marginLeft: 15, marginTop: 20}}>	
								<Label style={styles.label}>E-mail:</Label>
								<Text style={styles.text}>{this.state.email}</Text>
							</View>
						</View>
						<Label style={styles.label2}>First name:</Label>
						<Text style={styles.text}>{this.state.first_name}</Text>
						<Label style={styles.label2}>Last name:</Label>
						<Text style={styles.text}>{this.state.last_name}</Text>
						<Label style={styles.label2}>Birthdate:</Label>
						<Text style={styles.text}>{this.state.birth_date}</Text>
						<Button key={4} full bordered rounded style={styles.buttonStyle_red} 
							onPress={() => this.showMsgCancel('Logout?', 'Do you want to logout?', 'logout')}
						>
							<Text style={{color: "#990000"}}>Logout</Text>
						</Button>
					</View>
				},
				{ this.state.mainView == 'groupDetails' &&
					<View style={styles.form}>
						<View style={{flexDirection: 'row'}}>
							<Image
							style={styles.profile_image}
							source={{uri: ((this.state.currentGroupDetails.group_image_url == '') || (this.state.currentGroupDetails.group_image_url == null)) ? this.state.groupImage_default : IP + PORT + this.state.currentGroupDetails.group_image_url}}
							/>
							<View style={{marginLeft: 15, marginTop: 20}}>	
								<Label style={styles.label}>Name:</Label>
								<Text style={styles.text}>{this.state.currentGroupDetails.name}</Text>
							</View>
						</View>
						<Label style={styles.label2}>Sport:</Label>
						<Text style={styles.text}>{this.state.currentGroupDetails.sport}</Text>
						<Label style={styles.label2}>Capacity:</Label>
						<Text style={styles.text}>{this.state.currentGroupDetails.capacity}</Text>
				        { this.state.alreadyJoined == 'Join' &&
				        	[
				       		<Button key={6} full bordered rounded dark style={styles.buttonStyle1}
				       			onPress={() => this.joinGroup(this.state.email, this.state.currentGroupDetails.gid)}
				       		>
								<Text>Join Group</Text>
							</Button>]
						},
						{ this.state.alreadyJoined == 'Leave' &&
							[<Button key={5} full bordered rounded dark style={styles.buttonStyle1}
				       			onPress={() => this.changeToMessages()}>
								<Text>Message</Text>
							</Button>,
							<Button key={768} full bordered rounded dark style={styles.buttonStyle2}
				       			onPress={() => this.viewMembers()}>
								<Text>View Members</Text>
							</Button>,
							<Button key={9} full bordered rounded dark style={styles.buttonStyle2}
				       			onPress={() => this.viewEvents()}>
								<Text>Events</Text>
							</Button>,
				       		<Button key={7} full bordered rounded style={styles.buttonStyle_red}
				       			onPress={() => this.showMsgCancel('Leaving group?', 'Do you want to leave the group ' + this.state.currentGroupDetails.name + ' ?', 'leaveGroup')}
				       		>
								<Text style={{color: "#990000"}}>Leave Group</Text>
							</Button>]
						}
					</View>
				},
				{ this.state.mainView == 'chat' &&
					<View style={{ flex: 1}}>
					      <GiftedChat
					        messages={this.state.messages}
					        onSend={messages => this.onSend(messages)}
					        user={{
					          _id: this.state.userid,
					        }}
					      />
					</View>
				},
				{ this.state.mainView == 'createGroup' &&
					<View style={styles.form}>
					<ScrollView style={{height: 500}}>
							<Form>
								<View key={802} style={{flexDirection: 'row', width:200}}>
									<TouchableHighlight onPress={this.selectImage.bind(this, 'group')}>
									<Image
										style={styles.profile_image}
										source={{uri: this.state.groupImage == '' ? this.state.groupImage_default : this.state.groupImage}}
									/>
									</TouchableHighlight>
									<View style={{marginLeft: 15, marginTop: 0, marginRight: 0, width:275}}>	
										<Item floatingLabel error={ this.state.addGroupFailure.groupName }>
										<Label>Group Name:</Label>
										<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ groupName: text })}}/>
										{ (this.state.addGroupFailure.groupName) && <Icon name='close-circle' /> }
										</Item>
									</View>
								</View>	
								<Label style={(this.state.addGroupFailure.sport) ? styles.label2_red : styles.label2}>Sport:</Label>
								    	<Dropdown
								    		containerStyle={styles.dropdown}
								    		label='Pick a sport'
								    		data={this.state.sportsNames}
								    		onChangeText={(text) => { this.setState({ sport: text })}}
								      	/>
								<Item floatingLabel error={ this.state.addGroupFailure.capacity }>
								<Label>Capacity:</Label>
								<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ capacity: text })}}/>
								{ (this.state.addGroupFailure.capacity) && <Icon name='close-circle' /> }
								</Item>
								<Item floatingLabel error={ this.state.addGroupFailure.description }>
								<Label>Description:</Label>
								<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ description: text })}}/>
								{ (this.state.addGroupFailure.description) && <Icon name='close-circle' /> }
								</Item>
							</Form>
						<Label key={904} style={styles.label2}>Gender:</Label>,
						<View key={905} style={{flexDirection: 'row'}}>
							<Button key={101}bordered dark onPress={this.applyTag.bind(this, 'gender', 'Male') } style={!this.state.addTag['gender']['Male'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Male</Text>
							</Button>
							<Button key={102} bordered dark onPress={ this.applyTag.bind(this,'gender', 'Female') } style={!this.state.addTag['gender']['Female'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Female</Text>
							</Button>
						</View>,
						<Label key={906} style={styles.label2}>Skill:</Label>,
						<View key={907} style={{flexDirection: 'row'}}>
							<Button key={103} bordered dark onPress={ this.applyTag.bind(this,'skill', 'Beginners') } style={!this.state.addTag['skill']['Beginners'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Beginners</Text>
							</Button>
							<Button key={104} bordered dark onPress={ this.applyTag.bind(this,'skill', 'Intermediate') } style={!this.state.addTag['skill']['Intermediate'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Intermediate</Text>
							</Button>
							<Button key={105} bordered dark onPress={ this.applyTag.bind(this,'skill', 'Advanced') } style={!this.state.addTag['skill']['Advanced'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Advanced</Text>
							</Button>
						</View>,
						<Button key={106} bordered dark onPress={ this.applyTag.bind(this,'skill', 'Professional') } style={!this.state.addTag['skill']['Professional'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Professional</Text>
						</Button>,
						<Label key={910} style={styles.label2}>Degree:</Label>,
							<View key={911} style={{flexDirection: 'row'}}>
							<Button key={107} bordered dark onPress={ this.applyTag.bind(this,'degree_level', 'Undergraduate') } style={!this.state.addTag['degree_level']['Undergraduate'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Undergraduate</Text>
							</Button>
							<Button key={108} bordered dark onPress={ this.applyTag.bind(this,'degree_level', 'Graduate') } style={!this.state.addTag['degree_level']['Graduate'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>Graduate</Text>
							</Button>
							<Button key={109} bordered dark onPress={ this.applyTag.bind(this,'degree_level', 'PhD') } style={!this.state.addTag['degree_level']['PhD'] ? styles.buttonStyle4_2 : styles.buttonStyle4_2_act}>
								<Text style={styles.textTag}>PhD</Text>
							</Button>
						</View>,
						<Button key={110} bordered dark onPress={ this.applyTag.bind(this,'degree_level', 'Faculty') } style={!this.state.addTag['degree_level']['Faculty'] ? styles.buttonStyle4 : styles.buttonStyle4_act}>
								<Text style={styles.textTag}>Faculty</Text>
						</Button>
						</ScrollView>
						<Button key={8} full bordered rounded dark style={styles.buttonStyle2} onPress={() => this.testAddGroupWithImage()}>
							<Text>Create Group</Text>
						</Button>
					</View>
				}, 
				{ this.state.mainView == 'currentGroupEvents' &&
					<View>
					<List containerStyle={{marginTop: 0, paddingTop:0}} automaticallyAdjustContentInsets={false}>
						<FlatList
							data = { this.state.currentGroupEventDetails }
							keyExtractor={ item => item.name }
							renderItem = {({ item }) => (
								<ListItem
								title={ item.name }
								subtitle={ '\nTime:  ' + item.time + '\n' + 'Recurrency:  ' + item.recurrency  + '\nLocation:  ' + item.location}
								subtitleNumberOfLines={4}
											hideChevron
								/>
							)}
						/>
					</List>
					<Button key={5} full bordered rounded dark style={styles.buttonStyle1} onPress={() => this.addEvent()}>
						<Text>Add Event</Text>
					</Button>
					</View>
				},
				{ this.state.mainView == 'addEvent' &&
					<View style={styles.form}>
					<ScrollView style={{height: 500}}>
							<Form>
								<Item floatingLabel error={ this.state.addEventFailure.eventName }>
								<Label>Event Name:</Label>
								<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ eventName: text })}}/>
								{ (this.state.addEventFailure.eventName) && <Icon name='close-circle' /> }
								</Item>
								<Label style={(this.state.addEventFailure.eventLocation) ? styles.label2_red : styles.label2}>Location:</Label>
								    	<Dropdown
								    		containerStyle={styles.dropdown}
								    		label='Location'
								    		data={this.state.locationNames}
								    		onChangeText={(text) => { this.setState({ eventLocation: text })}}
								      	/>
								<Item floatingLabel error={ this.state.addEventFailure.eventTime }>
								<Label>Time:</Label>
								<Input autoCapitalize='none' onChangeText={(text) => { this.setState({ eventTime: text })}}/>
								{ (this.state.addEventFailure.eventTime) && <Icon name='close-circle' /> }
								</Item>
								<Label style={(this.state.addEventFailure.eventRecurrency) ? styles.label2_red : styles.label2}>Reccurency:</Label>
								    	<Dropdown
								    		containerStyle={styles.dropdown}
								    		label='Set recurrency'
								    		data={ this.state.recurrencies }
								    		onChangeText={(text) => { this.setState({ eventRecurrency: text })}}
								      	/>
							</Form>
						</ScrollView>
					<Button key={5} full bordered rounded dark style={styles.buttonStyle2} onPress={() => this.testCreateEvent()}>
						<Text>Create Event</Text>
					</Button>
					</View>
				},
				{ this.state.mainView == 'viewMembers' &&
					<View>	
					<List containerStyle={{marginTop: 0, paddingTop:0}} automaticallyAdjustContentInsets={false}>
						<FlatList
							data = { this.state.groupMembers }
							keyExtractor={ item => item.userid.toString() }
							renderItem = {({ item }) => (
								<ListItem
								title={ item.first_name + ' ' + item.last_name }
								avatar={{uri: ((item.image_url == '') || (item.image_url == null)) ? this.state.userImage_default : IP + PORT + item.image_url}}
								subtitleNumberOfLines={2}
											hideChevron
								/>
							)}
						/>
					</List>
					</View>
				}
			</View>
			</Container>
			);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
	buttonStyle1: {
        marginTop: 40,
        marginLeft: 20,
        marginRight: 20
    },
    buttonStyle2: {
        marginTop: 10,
        marginLeft: 20,
        marginRight: 20
    },
    buttonStyle3: {
        marginTop: 30,
        marginLeft: 20,
        marginRight: 20
    },
    buttonStyle4: {
    	marginTop: 5,
    	height: 35,
    	marginLeft: 15
    },
    buttonStyle4_act: {
    	marginTop: 5,
    	height: 35,
    	marginLeft: 15,
    	backgroundColor: "#0061ff"
    },
    buttonStyle4_2: {
    	marginTop: 5,
    	height: 35,
    	marginLeft: 5
    },
    buttonStyle4_2_act: {
    	marginTop: 5,
    	height: 35,
    	marginLeft: 5,
    	backgroundColor: "#0061ff"
    },
    buttonStyle_red: {
        marginTop: 40,
        marginLeft: 20,
        marginRight: 20,
        borderColor: "#990000"
    },
    label: {
    	marginLeft: 15,
    	color: '#8c8c8c'
    },
    label2: {
    	marginTop: 20,
    	marginLeft: 15,
    	color: '#8c8c8c'
    },
    label2_red: {
    	marginTop: 20,
    	marginLeft: 15,
    	color: '#c83e44'
    },
    text: {
    	marginLeft: 15,
    	color: '#000000',
    	fontSize: 16,
    	marginTop: 4
    },
    textTag: {
    	marginLeft: 10,
    	marginRight: 10,
    	color: '#000000',
    	fontSize: 16
    },
    form: {
    	marginTop: 30
    },
    dropdown: {
    	marginLeft: 15,
    	marginRight: 15,
    },
    profile_image: {
    	width: 75, 
    	height: 75,
    	marginLeft: 15
    },
    logo_image: {
    	width: 150, 
    	height: 150,
    	marginLeft: 110,
    	marginTop: 20
    },
    header_no: {
    	flexDirection: 'row'
    },
    header_left: {
    	flexDirection: 'row',
    	marginRight: 20
    },
    header_right: {
    	flexDirection: 'row',
    	marginLeft: 25
    }
});
