import React, { useState } from "react"; 
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {StyleSheet, View, ScrollView, Text, Alert} from "react-native"; 
import { TouchableOpacity } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';
import { Input, Icon } from '@rneui/themed';
import {Button} from '@rneui/base';
import DateTimePicker from '@react-native-community/datetimepicker';
import {globalStyles} from '../GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import {formatTime, formatDate, getUser} from '../../helpers'


  
export default function CreatePostScreen({navigation}) {

	const[screen, setScreen] = useState(1);

	const [openCategory, setOpenCategory] = useState(false);
	const [valueCategory, setValueCategory] = useState(null);
	const [itemsCategory, setItemsCategory] = useState([
		
		{label: 'Social',
		value: 'social',
		icon: () => <Icon name="user-friends" type = 'font-awesome-5'/>
	},

		{label: 'Performance',
		value: 'performance',
		icon: () => <Icon name="music" type = 'font-awesome'/>

		},
		{label: 'Food',
		value: 'food',
		icon: () => <Icon name="food-fork-drink" type = 'material-community'/>
	},
		
		
		{label: 'Academic',
		value: 'academic',
		icon: () => <Icon name="book" type = 'entypo'/>
	},
		{label: 'Athletic',
		value: 'athletic',
		icon: () => <Icon name="running" type = 'font-awesome-5'/>
	},

	]);

	
	const NUM_MILLISECONDS_IN_HALF_HOUR = 1.8e+6
	const NUM_MILLISECONDS_IN_ONE_HOUR = NUM_MILLISECONDS_IN_HALF_HOUR * 2

	const defaultStart = Math.ceil((new Date().getTime()) / NUM_MILLISECONDS_IN_HALF_HOUR) * NUM_MILLISECONDS_IN_HALF_HOUR
	const defaultEnd = Math.ceil((new Date().getTime()) / NUM_MILLISECONDS_IN_HALF_HOUR) * NUM_MILLISECONDS_IN_HALF_HOUR + NUM_MILLISECONDS_IN_ONE_HOUR


	const [text, setText] = useState('');
	const [title, setTitle] = useState('');
	const [start, setStart] = useState(defaultStart);
	const [end, setEnd] = useState(defaultEnd);
	const [startDate, setStartDate] = useState(formatDate(defaultStart));
	const [startTime, setStartTime] = useState(formatTime(defaultStart));
	const [endDate, setEndDate] = useState(formatDate(defaultEnd));
	const [endTime, setEndTime] = useState(formatTime(defaultEnd));
	const [locationDescription, setLocationDescription] = useState('');
	const [link, setLink] = useState('');
	const [canArriveDuring, setCanArriveDuring] = useState(true);
	const [isStart, setIsStart] = useState(true);
	const [show, setShow] = useState(false);
	const [mode, setMode] = useState('time')
	const [address, setAddress] = useState('')
	const [latitude, setLatitude] = useState(null)
	const [longitude, setLongitude] = useState(null)
	const [postalAddress, setPostalAddress] = useState(null)

	
  

	async function storeText() {
		var user = await getUser();
		console.log(user)
		try{
		firebase
		  .database()
		  .ref('Posts')
		  .push({
			author: user.displayName,
			authorID: user.uid,
			title: title,
			start: start,
			end: end,
			post: text,
			link: link,
			latitude: latitude,
			longitude: longitude,
			locationDescription: locationDescription,
			category: valueCategory,
			canArriveDuring: canArriveDuring,
		  });
			Alert.alert('Your post has been successfully published!')

		} catch(e) {
			console.log(e);
		}
	  }
	
	  function handlePost(){
			storeText()
			navigation.navigate('Posts')
	}

	function verifyFieldsFilled(){
		if (screen == 1){
			if (valueCategory == null){
				Alert.alert('Please select a category.')
			}
			else{
				setScreen(2)
			}
		}
		else if (screen == 2){
			if (latitude == null || longitude == null){
				Alert.alert('Please search for a location.')
			}
			else{
				setScreen(3)
			}
		}
		else if (screen == 3){
			if (start == null || end == null){
				Alert.alert('Please provide start and end dates/times for your post.')
			}
			else if (end < start){
				Alert.alert('Please provide a start time that is after your end time.')
			}
			else if (end < new Date().getTime()){
				Alert.alert('Please provide end time that is in the future.')
			}
			else if (canArriveDuring == null){
				Alert.alert('Please specify whether people can arrive to your event during your specified time range.')
			}
			else {
				setScreen(4)
			}
		}
		else if (screen == 4){
			if (title == ''){
				Alert.alert('All posts need a title')
			}
			else if (locationDescription == ''){
				Alert.alert('Please describe where your post is located.')
			}
			else{
				Alert.alert(
					"Confirmation",
					"Press continue if you are sure.",
					[
						{
						text: "Cancel",
						style: "cancel"
						},
						{ text: "Continue", onPress: () => handlePost()}
					],
					{ cancelable: false }
					);
			}
		}
		else {
			console.log('Invalid Screen')
		}

	}


	const interpretTime = (inputTime) => {
		let time = ''
		let ampm = ''
		for (char of inputTime){
			if (!isNaN(char) && char != ' '){
				time += char
			}
			else if (['A','P','M'].includes(char)){
				ampm += char
			}
		}
		if (time.length == 3){
			time = '0' + time
		}
		if (time.length == 4){
			
			let hour = parseInt(time.slice(0,2))
			if (ampm == 'PM' && hour < 12){
				hour += 12
			}
			let minute = parseInt(time.slice(2,4))
			
			return [hour, minute]
		}
		return null
	}

	const formatStartDate = () => {
		const dateSplit = startDate.split('/')
		if (dateSplit.length == 3){
			const s = new Date(start)
			s.setFullYear(dateSplit[2])
			s.setMonth(dateSplit[0])
			s.setDate(dateSplit[1])
			setStartDate(formatDate(s))
			setStart(s)
		}
	}

	const formatStartTime = () => {
		const times = interpretTime(startTime)

		if (times !== null){
			const s = new Date(end)
			s.setHours(times[0])
			s.setMinutes(times[1])
			setStartTime(formatTime(s))
			setStart(s)
		}
	}

	const formatEndDate = () => {
		const dateSplit = endDate.split('/')
		if (dateSplit.length == 3){
			const e = new Date(end)
			e.setFullYear(dateSplit[2])
			e.setMonth(dateSplit[0])
			e.setDate(dateSplit[1])
			setEndDate(formatDate(e))
			setEnd(e)
		}
	}

	

	const formatEndTime = () => {
		const times = interpretTime(endTime)
		if (times !== null){
			const e = new Date(end)
			e.setHours(times[0])
			e.setMinutes(times[1])
			setEndTime(formatTime(e))
			setEnd(e)
		}

	}

	
	const changeDateTime = (event, selectedDate) => {
		const currentDateTime = selectedDate;
		setShow(false);
		const s = new Date(start);
		const e = new Date(end);
		if (event.type == 'set'){
			if (mode == 'date'){
				if (isStart){
					s.setFullYear(currentDateTime.getFullYear())
					s.setMonth(currentDateTime.getMonth())
					s.setDate(currentDateTime.getDate())
					setStart(s.getTime())
					setStartDate(formatDate(s.getTime()))
				}
				else{
					e.setFullYear(currentDateTime.getFullYear())
					e.setMonth(currentDateTime.getMonth())
					e.setDate(currentDateTime.getDate())
					setEnd(e.getTime())
					setEndDate(formatDate(e.getTime()))
				}

			}
			else if (mode == 'time'){
				if (isStart){
					s.setHours(currentDateTime.getHours())
					s.setMinutes(currentDateTime.getMinutes())
					setStart(s.getTime())
					setStartTime(formatTime(s.getTime()))

				}
				else{
					e.setHours(currentDateTime.getHours())
					e.setMinutes(currentDateTime.getMinutes())
					setEnd(e.getTime())
					setEndTime(formatTime(e.getTime()))

				}
			}
			else {
				console.log('Invalid mode')
			}
		}
		
	  };

	  const showMode = (currentMode, isStart) => {
		setShow(true);
		setIsStart(isStart);
		setMode(currentMode);
	  };

	
	async function search(){
		coordinates = await Location.geocodeAsync(address + " Harvard, Cambridge MA")
		if (coordinates[0] == undefined){
			var coordinates = await Location.geocodeAsync(address)	
		}


		if (coordinates[0] != undefined){
			setLatitude(coordinates[0].latitude)
			setLongitude(coordinates[0].longitude)
			var addy = await Location.reverseGeocodeAsync(coordinates[0])
			if (addy != undefined){
				setPostalAddress(addy[0].streetNumber + ' ' + addy[0].street + ' ' + addy[0].city + ', ' + addy[0].region + ' ' + addy[0].country + ' ' + addy[0].postalCode)
			}
			else{
				setPostalAddress('We found coordinates for your search, but we are unsure what the postal address is.')
			}
		}
		else{
			setLatitude(null)
			setLongitude(null)
			setPostalAddress('Location not found.')
		}
	}
	
	if(screen == 1){
		return(

			<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>

				<Text style={styles.question}>Which of the following categories best describe your post?</Text>

				<DropDownPicker
					textStyle={globalStyles.text}
					containerStyle={{
						marginTop: '10%'
					}}
					open={openCategory}
					value={valueCategory}
					items={itemsCategory}
					setOpen={setOpenCategory}
					setValue={setValueCategory}
					setItems={setItemsCategory}
					
					/>

				</View>

				<View style={{height: 100}}>
					<Button onPress = {() => verifyFieldsFilled()} title="Next" />
				</View>
				

				</View>
			</View>	
			
		);

	}

	if (screen == 2){
		return(
		<ScrollView style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Where is the location of your post?</Text>

				<Input 
				// label = ''
				placeholder="Pforzheimer House"
						style={styles.textInput} 
						onChangeText={address => setAddress(address)}
          				value={address} 
						// maxLength={25}
				/> 

				<View>
				<Button
				title="Search"
				onPress={() => search()}
				/>
				</View>


				<View style={{marginVertical: 20}}>
				<Text style={styles.postalAddress}>{postalAddress}</Text>
				</View>
				</View>
				<View style={{height: 50}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(1)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => verifyFieldsFilled()} title="Next" />
					</View>
	
				</View>
				</View>
				

				</View>
			</ScrollView>	
		
		);
	}
	
	if (screen == 3){
		return (
			<ScrollView style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Start Date and Time</Text>

				<View style={{flexDirection: 'row', flex: 3, alignItems: 'center'}}>

				<View style={{flex: 2}}>
				<Input  
				label="Start date"
				placeholder="MM/DD/YYYY"
				value={startDate}
				style={styles.textInput} 
				maxLength={10}
				onChangeText={(value) => setStartDate(value) }
				onEndEditing={() => formatStartDate()}

				/>
				</View>

			
				<View style={{flex: 1}}>
				<Button
				icon = {{
					name: "calendar",
					type: "entypo",
					color: 'white'
				}}
				
				onPress={() => showMode('date', true)}
				/>
				</View>
				</View>



				<View style={{flexDirection: 'row', flex: 3, alignItems: 'center'}}>

					<View style={{flex: 2}}>
					<Input  
						label="Start time"
						placeholder="HH:MM AM/PM"
						value={startTime}
						style={styles.textInput} 
						maxLength={8}
						onChangeText={(value) => setStartTime(value) }
						onEndEditing={() => formatStartTime()}

						/>
					</View>


					<View style={{flex: 1}}>
					<Button
					icon = {{
						name: "clock",
						type: "entypo",
						color: 'white'
					}}

					onPress={() => showMode('time', true)}
					/>
					</View>
					</View>

				


				
				
				

				
				<Text style={styles.question}>End Date and Time</Text>
				
				<View style={{flexDirection: 'row', flex: 3, alignItems: 'center'}}>
				
				<View style={{flex: 2}}>
					<Input  
					label="End Date"
					placeholder="MM/DD/YYYY"
					value={endDate}
					style={styles.textInput} 
					maxLength={10}
					onChangeText={(value) => setEndDate(value) }
					onEndEditing={() => formatEndDate()}
					/>
					</View>


					<View style={{flex: 1}}>
					<Button
					icon = {{
						name: "calendar",
						type: "entypo",
						color: 'white'
					}}

					onPress={() => showMode('date', false)}
					/>
					</View>
					</View>


				
					<View style={{flexDirection: 'row', flex: 3, alignItems: 'center'}}>
				
				<View style={{flex: 2}}>
				<Input  
				label="End Time"
				placeholder="HH:MM AM/PM"
				value={endTime}
				style={styles.textInput} 
				maxLength={8}
				onChangeText={(value) => setEndTime(value) }
				onEndEditing={() => formatEndTime()}
				
				/>
					</View>


					<View style={{flex: 1}}>
					<Button
					icon = {{
						name: "clock",
						type: "entypo",
						color: 'white'
					}}

					onPress={() => showMode('time', false)}
					/>
					</View>
					</View>
				
				
				
				

				{ show?				
				<DateTimePicker
					mode={mode}
					value = {new Date()}
					onChange={(event, date) => changeDateTime(event, date)}
				/>
				: null
				}
			

				
				</View>

				<View style={{marginTop: 50}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(2)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => verifyFieldsFilled()} title="Next" />
					</View>
	
				</View>
				</View>
				

				</View>
			</ScrollView>	
			
		);
	}

	return ( 
		<View style={globalStyles.container}> 
			
			<ScrollView style={{marginVertical: '10%', marginHorizontal: '5%', flex: 1}}>

				<Input 
				label = 'Title'
				placeholder="Free sushi"
						style={styles.textInput} 
						onChangeText={title => setTitle(title)}
          				value={title} 
						maxLength={25}
				/> 

					<Input
					label = "Specific location description"
					onChangeText={locationDescription => setLocationDescription(locationDescription)}
					placeholder='Science Center Room 206'
					leftIcon={
						<Icon
						name='location'
						type = 'entypo'
						size={24}
						color='black'
						/>
					}
					/>

				
				<Input 
						label = "Description"
						placeholder="Free sushi if you attend this club meeting!"

						multiline
						style={styles.textInput} 
						onChangeText={text => setText(text)}
						  value={text}
						  maxLength={250}
					/> 


				<Input
					label = "Website link"
					placeholder='https://example.com'
					onChangeText={link => setLink(link)}

					leftIcon={
						<Icon
						name='web'
						size={24}
						color='black'
						/>
					}
					/>
			
			<View style={{height: 100}}>
				<View style={{ flexDirection: 'row', flex: 2}}>

					<View style={{flex: 1, margin: 5}}>
					<Button onPress={() => setScreen(3)} title="Back" type="outline"/>
					</View>

					<View style={{flex: 1, margin: 5}}>
					<Button title="Post"
					onPress = {() => verifyFieldsFilled()}
					
					/>
					</View>
	
				</View>
				</View>

			
			</ScrollView>

		</View> 
	); 

}

// These are user defined styles 
const styles = StyleSheet.create({ 
	container: { 
		flex: 1, 
		alignItems: "center", 
		justifyContent: "center", 
		backgroundColor: "#ededed", 
	}, 
	textInput: { 
		width: "80%", 
		// borderRadius: 10, 
		// paddingVertical: 8, 
		// paddingHorizontal: 16, 
		// borderColor: "rgba(0, 0, 0, 0.2)", 
		// borderWidth: 1, 
		// marginBottom: 8, 
		// backgroundColor: '#FFF'
	}, 
	button: {
		backgroundColor: '#871609',
		padding: 10,
		paddingHorizontal: 30,
		alignItems: "center", 
		borderRadius: 10,
	},
	question: {
		fontSize: 20,
		fontFamily: 'Montserrat',
		textAlign: 'center'
	},
	postalAddress: {
		fontSize: 15,
		fontFamily: 'Montserrat',
	}
});
