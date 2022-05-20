import React, { useState } from "react"; 
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import user from "../User";
import {StyleSheet, View, ScrollView, Text, Alert} from "react-native"; 
import { TouchableOpacity } from "react-native-gesture-handler";
import DropDownPicker from 'react-native-dropdown-picker';
import { Input, Icon } from '@rneui/themed';
import {Button} from '@rneui/base';
import DateTimePicker from '@react-native-community/datetimepicker';
import {globalStyles} from '../GlobalStyles';



  
export default function CreateAnnouncementScreen({navigation}) {

	const[screen, setScreen] = useState(1);

	const [openCategory, setOpenCategory] = useState(false);
	const [valueCategory, setValueCategory] = useState(null);
	const [itemsCategory, setItemsCategory] = useState([
		{label: 'Food',
		value: 'food',
		icon: () => <Icon name="food-fork-drink" type = 'material-community'/>

		},
		{label: 'Performance',
		value: 'performance',
		icon: () => <Icon name="music" type = 'font-awesome'/>

	},
		{label: 'Social',
		value: 'social',
		icon: () => <Icon name="user-friends" type = 'font-awesome-5'/>
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

	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(null);
	const [items, setItems] = useState(
		[
			{ label: "None" , value: -1 },
			{ label: "1 Brattle Street (DCE)" , value: 0 },
			{ label: "1 Story Street" , value: 1 },
			{ label: "10-20 DeWolfe St" , value: 2 },
			{ label: "103 Walker St" , value: 3 },
			{ label: "104 Mt Auburn St" , value: 4 },
			{ label: "107 Walker St (Cabot Faculty Dean's Residence)" , value: 5 },
			{ label: "1100 Mass Ave" , value: 6 },
			{ label: "113 Walker St (FAS Dean's Residence)" , value: 7 },
			{ label: "114 Western Ave (Allston)" , value: 8 },
			{ label: "1201 Mass Ave (Inn at Harvard - UG Overflow)" , value: 9 },
			{ label: "124 Mt Auburn St (Temp Admissions Office)" , value: 10 },
			{ label: "125 Mt Auburn St" , value: 11 },
			{ label: "126 Mt Auburn St" , value: 12 },
			{ label: "1280 Mass Ave" , value: 13 },
			{ label: "129 Mt Auburn St (Human Flourishing Program)" , value: 14 },
			{ label: "1306 Mass Ave (Fairfax Hall HR Swing)" , value: 15 },
			{ label: "1414 Mass Ave" , value: 16 },
			{ label: "155 Fawcett St" , value: 17 },
			{ label: "17 South St (Society of Fellows)" , value: 18 },
			{ label: "17 Sumner Rd" , value: 19 },
			{ label: "1705 Mass Ave (Dudley Community)" , value: 20 },
			{ label: "1727 Cambridge St (CGIS East)" , value: 21 },
			{ label: "2 Divinity Ave -Yenching Library" , value: 22 },
			{ label: "20 Garden St" , value: 23 },
			{ label: "20-20A Prescott St (UG Overflow)" , value: 24 },
			{ label: "21 South St (Advocate)" , value: 25 },
			{ label: "22-24 Prescott St (UG Overflow)" , value: 26 },
			{ label: "25 Mt Auburn St (Human Flourishing Program)" , value: 27 },
			{ label: "26-28 Church St" , value: 28 },
			{ label: "3 Sacramento St (Dudley Community)" , value: 29 },
			{ label: "34 Concord Ave" , value: 30 },
			{ label: "34 Kirkland St" , value: 31 },
			{ label: "38 Kirkland St" , value: 32 },
			{ label: "38 Oxford St (CEA)" , value: 33 },
			{ label: "4-12 Story St (8 Story St)" , value: 34 },
			{ label: "41 Winthrop St" , value: 35 },
			{ label: "5 Bryant St" , value: 36 },
			{ label: "5-7 Linden St" , value: 37 },
			{ label: "50 Church St" , value: 38 },
			{ label: "51 Brattle Street" , value: 39 },
			{ label: "52-54 Dunster St" , value: 40 },
			{ label: "53 Church St" , value: 41 },
			{ label: "53 Dunster St" , value: 42 },
			{ label: "60 JFK St" , value: 43 },
			{ label: "60 Oxford St" , value: 44 },
			{ label: "61 Kirkland St" , value: 45 },
			{ label: "625 Mass Ave" , value: 46 },
			{ label: "65 Mt Auburn St (Ridgely Hall HR Swing)" , value: 47 },
			{ label: "65 Rear Mt Auburn St (HUIT Space)" , value: 48 },
			{ label: "69 Dunster St" , value: 49 },
			{ label: "7 Bryant St" , value: 50 },
			{ label: "74 Mt Auburn St" , value: 51 },
			{ label: "77 Dunster St" , value: 52 },
			{ label: "78 Mt Auburn St (Society of Fellows)" , value: 53 },
			{ label: "8 Plympton St (Hampden Hall HR Swing)" , value: 54 },
			{ label: "8 Prescott St (HR Swing Faculty Dean Residence)" , value: 55 },
			{ label: "9 Kirkland Pl" , value: 56 },
			{ label: "Adams House" , value: 57 },
			{ label: "Agassiz House" , value: 58 },
			{ label: "Apley Court" , value: 59 },
			{ label: "Athletic Area" , value: 60 },
			{ label: "Barker Center (Harvard Union)" , value: 61 },
			{ label: "Bauer Life Sciences" , value: 62 },
			{ label: "Beren Tennis Pavilion" , value: 63 },
			{ label: "Biological Labs" , value: 64 },
			{ label: "Blodgett Pool" , value: 65 },
			{ label: "Boylston Hall" , value: 66 },
			{ label: "BRI" , value: 67 },
			{ label: "Bright Hockey Center" , value: 68 },
			{ label: "Cabot House" , value: 69 },
			{ label: "Canaday Hall" , value: 70 },
			{ label: "Carpenter Center" , value: 71 },
			{ label: "CES Busch Hall" , value: 72 },
			{ label: "CGIS North - Knafel Building" , value: 73 },
			{ label: "CGIS South" , value: 74 },
			{ label: "Chemical Labs" , value: 75 },
			{ label: "Child Hall" , value: 76 },
			{ label: "Claverly Hall (Adams House)" , value: 77 },
			{ label: "Conant Hall" , value: 78 },
			{ label: "Concord Field Station" , value: 79 },
			{ label: "Cooper Gallery/Hutchins Center" , value: 80 },
			{ label: "Cronkhite (FAS Admin & COVID Isolation)" , value: 81 },
			{ label: "Cruft Lab" , value: 82 },
			{ label: "Currier House" , value: 83 },
			{ label: "Dana Palmer House" , value: 84 },
			{ label: "Dillon Field House" , value: 85 },
			{ label: "Dunster House" , value: 86 },
			{ label: "Eliot House" , value: 87 },
			{ label: "Emerson Hall" , value: 88 },
			{ label: "Engineering Science Lab" , value: 89 },
			{ label: "Farkas Hall" , value: 90 },
			{ label: "Farlow Herbarium" , value: 91 },
			{ label: "Gordon McKay" , value: 92 },
			{ label: "Gordon Track & Tennis" , value: 93 },
			{ label: "Grays Hall" , value: 94 },
			{ label: "Greenough Hall" , value: 95 },
			{ label: "Harvard Hall" , value: 96 },
			{ label: "Harvard Sailing Center" , value: 97 },
			{ label: "Harvard Square Hotel (COVID Isolation)" , value: 98 },
			{ label: "Hemenway Gymnasium" , value: 99 },
			{ label: "Hilles (SOCH)" , value: 100 },
			{ label: "Hoffman Lab" , value: 101 },
			{ label: "Holden Chapel" , value: 102 },
			{ label: "Hollis Hall" , value: 103 },
			{ label: "Holworthy Hall" , value: 104 },
			{ label: "Houghton Library" , value: 105 },
			{ label: "House Operations" , value: 106 },
			{ label: "Hurlbut Hall" , value: 107 },
			{ label: "Jordan Field" , value: 108 },
			{ label: "Kirkland House" , value: 109 },
			{ label: "Lamont Library" , value: 110 },
			{ label: "Lavietes Pavilion at Briggs Cage" , value: 111 },
			{ label: "Lehman Hall (GSAS Student Center)" , value: 112 },
			{ label: "Leverett House" , value: 113 },
			{ label: "Libraries" , value: 114 },
			{ label: "Linden Street Studios" , value: 115 },
			{ label: "Lionel Hall" , value: 116 },
			{ label: "LISE" , value: 117 },
			{ label: "Littauer Center" , value: 118 },
			{ label: "Loeb Drama Center" , value: 119 },
			{ label: "Lowell House" , value: 120 },
			{ label: "Lowell Lecture Hall" , value: 121 },
			{ label: "Malkin Athletic Center" , value: 122 },
			{ label: "Massachusetts Hall" , value: 123 },
			{ label: "Mather House" , value: 124 },
			{ label: "Matthews Hall" , value: 125 },
			{ label: "Maxwell Dworkin" , value: 126 },
			{ label: "MCZ" , value: 127 },
			{ label: "MCZ Labs" , value: 128 },
			{ label: "Memorial Hall" , value: 129 },
			{ label: "Morton Prince House (6 Prescott St)" , value: 130 },
			{ label: "Mower Hall" , value: 131 },
			{ label: "Murr Center" , value: 132 },
			{ label: "Music (Paine)" , value: 133 },
			{ label: "Naito" , value: 134 },
			{ label: "Newell Boat House" , value: 135 },
			{ label: "Northwest SEAS B1" , value: 136 },
			{ label: "NW Labs" , value: 137 },
			{ label: "Oak Ridge/EPS - Seismograph Building" , value: 138 },
			{ label: "Observatory - All" , value: 139 },
			{ label: "OEB Greenhouse" , value: 140 },
			{ label: "One Bow St" , value: 141 },
			{ label: "One Brattle Square (FAS)" , value: 142 },
			{ label: "Palfrey House" , value: 143 },
			{ label: "Palmer Dixon Courts" , value: 144 },
			{ label: "Peabody Museum" , value: 145 },
			{ label: "Pennypacker Hall" , value: 146 },
			{ label: "Perkins Hall" , value: 147 },
			{ label: "Pforzheimer House" , value: 148 },
			{ label: "Phillips Brooks House" , value: 149 },
			{ label: "Physics (Lyman & Jefferson Labs)" , value: 150 },
			{ label: "Pierce Hall" , value: 151 },
			{ label: "Pusey Library" , value: 152 },
			{ label: "Quadrangle Athletic & Dance Ctr. Facility" , value: 153 },
			{ label: "Quincy House" , value: 154 },
			{ label: "Red Top" , value: 155 },
			{ label: "Richards Hall" , value: 156 },
			{ label: "Robinson Hall" , value: 157 },
			{ label: "Rosovsky Hall (Harvard Hillel)" , value: 158 },
			{ label: "Sackler" , value: 159 },
			{ label: "Science Center" , value: 160 },
			{ label: "SEC (Allston)" , value: 161 },
			{ label: "Semitic Museum (HMANE)" , value: 162 },
			{ label: "Sever Hall" , value: 163 },
			{ label: "Shannon Hall" , value: 164 },
			{ label: "Sherman Fairchild" , value: 165 },
			{ label: "Smith Campus Center" , value: 166 },
			{ label: "Soccer & Softball Fields at Soldiers Field" , value: 167 },
			{ label: "Soldiers Field Fence & Grounds" , value: 168 },
			{ label: "Stadium" , value: 169 },
			{ label: "Stoughton Hall" , value: 170 },
			{ label: "Straus Hall" , value: 171 },
			{ label: "Thayer Hall" , value: 172 },
			{ label: "Tozzer Anthropology Building" , value: 173 },
			{ label: "Two Arrow St" , value: 174 },
			{ label: "University Hall" , value: 175 },
			{ label: "University Herbaria" , value: 176 },
			{ label: "University/Geological Museum" , value: 177 },
			{ label: "Vanserg" , value: 178 },
			{ label: "Wadsworth House" , value: 179 },
			{ label: "Warren House" , value: 180 },
			{ label: "Weld Boat House" , value: 181 },
			{ label: "Weld Hall" , value: 182 },
			{ label: "Widener Library" , value: 183 },
			{ label: "Wigglesworth Hall" , value: 184 },
			{ label: "William James Hall" , value: 185 },
			{ label: "Winthrop House" , value: 186 },
			]
	);
	const [text, setText] = useState('');
	const [title, setTitle] = useState('');
	const [startDate, setStartDate] = useState(formatDate(new Date()));
	const [endDate, setEndDate] = useState(formatDate(new Date()));
	const [startTime, setStartTime] = useState(formatTime(new Date()));
	const [endTime, setEndTime] = useState(formatTime(new Date()));
	const [locationDescription, setLocationDescription] = useState('');
	const [link, setLink] = useState('');
	const [canArriveDuring, setCanArriveDuring] = useState(true);
	const [isStart, setIsStart] = useState(true);
	const [show, setShow] = useState(false);
	const [mode, setMode] = useState('time')

	function storeText() {
		firebase
		  .database()
		  .ref('Announcements')
		  .push({
			author: user.displayName,
			title: title,
			startDate: startDate,
			endDate: endDate,
			startTime: startTime,
			endTime: endTime,
			post: text,
			link: link,
			locationLabel: value,
			locationDescription: locationDescription,
			category: valueCategory,
			canArriveDuring: canArriveDuring,
		  });
		  Alert.alert('Your post has been successfully published!')
	  }
	
	  function handlePost(){
			storeText()
			navigation.navigate('Announcements Screen')
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
			if (value == null){
				Alert.alert('Please select a location.', ' If none of the locations work, select "None". This will cause your post to not appear on the map.')
			}
			else{
				setScreen(3)
			}
		}
		else if (screen == 3){
			if (startDate == null || endDate == null || startTime == null || endTime == null){
				Alert.alert('Please provide start and end dates/times for your post.')
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

	
	const changeDateTime = (event, selectedDate) => {
		const currentDateTime = selectedDate;
		setShow(false);
		if (event.type == 'set'){
			if (mode == 'date'){
				if (isStart){
					setStartDate(formatDate(currentDateTime));
				}
				else{
					setEndDate(formatDate(currentDateTime));
				}

			}
			else if (mode == 'time'){
				if (isStart){
					setStartTime(formatTime(currentDateTime));
				}
				else{
					setEndTime(formatTime(currentDateTime));
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

	  function formatDate(day) {
		var dd = String(day.getDate()).padStart(2, '0');
		var mm = String(day.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = day.getFullYear();

        return mm + '/' + dd + '/' + yyyy;;
	}

	function formatTime(day) {
		var hh = day.getHours();
		var min = day.getMinutes();
		var ampm = "AM";
		if (hh > 12){
			hh -= 12;
			ampm = "PM";
		}
		if (min < 10){
			min = "0" + min
		}

		day = hh + ":" + min + " " + ampm;
        return day;
	}
	
	
	if(screen == 1){
		return(

			<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>

				<Text style={styles.question}>Which of the following categories best describe your post?</Text>

				<DropDownPicker
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
		<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Where is the location of your post?</Text>


				<DropDownPicker
					containerStyle={{
						marginTop: '10%'
					}}
					open={open}
					value={value}
					items={items}
					setOpen={setOpen}
					setValue={setValue}
					setItems={setItems}
					searchable={true}
					/>
				</View>
				<View style={{height: 100}}>
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
			</View>	
		);
	}
	
	if (screen == 3){
		return (
			<View style={globalStyles.container}> 	
				<View style={{margin: '10%', flex: 1}}>
				<View style={{flex: 1}}>
				
				<Text style={styles.question}>Start Date and Time</Text>

				<Text onPress={() => showMode('date', true)} >{startDate}</Text>

				<Text onPress={() => showMode('time', true)}>{startTime}</Text>

				
				<Text style={styles.question}>End Date and Time</Text>

				<Text onPress={() => showMode('date', false)}>{endDate}</Text>
				<Text onPress={() => showMode('time', false)}>{endTime}</Text>

				{ show?				
				<DateTimePicker
					mode={mode}
					value = {new Date()}
					onChange={(event, date) => changeDateTime(event, date)}
				/>
				: null
				}
			

				
				</View>

				<View style={{height: 100}}>
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
			</View>	
			
		);
	}

	return ( 
		<View style={globalStyles.container}> 
			
			<View style={{marginVertical: '10%', marginHorizontal: '5%', flex: 1}}>
			<ScrollView>

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
			

			
			</ScrollView>

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
			</View>
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
	}
});
