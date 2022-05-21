import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';
import { ListItem } from "@rneui/themed";
import { Button } from "@rneui/base";




export default class AnnouncementsScreen extends React.Component {

	state = {
		posts: []
    };

	componentDidMount() {
		firebase.database().ref('Announcements').once('value', (snapshot) => {
			var posts = []
			snapshot.forEach((childSnapshot) => {
				posts.push(childSnapshot.val());
			  });
			this.setState({posts})
		});
	};	
		
	
	
	render() {
		
		return (
			<View style={globalStyles.container}>
				<ScrollView>
					{
						this.state.posts.map((l, i) => (
							<ListItem.Swipeable key={i} bottomDivider
							
							leftContent={(reset) => (
								<Button
								  title="Info"
								  onPress={() => reset()}
								  icon={{ name: 'info', color: 'white' }}
								  buttonStyle={{ minHeight: '100%' }}
								/>
							  )}
							  rightContent={(reset) => (
								<Button
								  title="Delete"
								  onPress={() => reset()}
								  icon={{ name: 'delete', color: 'white' }}
								  buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
								/>
							  )}
							
							>
								{/* <Avatar source={{uri: l.avatar_url}} /> */}
								<ListItem.Content>
								<ListItem.Title>{l.title}</ListItem.Title>
								<ListItem.Subtitle>{l.locationLabel + ' — ' + l.locationDescription}</ListItem.Subtitle>
								</ListItem.Content>
							</ListItem.Swipeable>
						))
					}
				</ScrollView>
			</View>
		);
		
	}

}




