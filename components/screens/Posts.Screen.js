import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';
import { ListItem } from "@rneui/themed";
import { Button } from "@rneui/base";
import { SearchBar, Icon } from 'react-native-elements';


const isSearchSubstring = (string, substring) => {

	const indexes = [0];

	for (let index = 0; index < string.length; index++) {
		if (string[index] === ' ') {
			indexes.push(index);
		}
	}

	for (const index of indexes) {
		if (string.startsWith(substring, index)) {
			return true;
		}
	}
	return false;
}

const posts = [];

export default class PostsScreen extends React.Component {

	
	state = {
		posts: [],
		search: '',
    };


	componentDidMount() {
		firebase.database().ref('Posts')
		.orderByChild("end")
		.startAt(new Date().getTime())
		.once('value', (snapshot) => {
			snapshot.forEach((childSnapshot) => {
				posts.push(childSnapshot.val());
			  });
			this.setState({posts})
		});
	};	


	updateSearch(search) {
		this.setState({search: search})
		const filteredPosts = []
		for (const post of posts){
			if (isSearchSubstring(post.author, this.state.search) 
			|| isSearchSubstring(post.category, this.state.search) 
			|| isSearchSubstring(post.locationDescription, this.state.search) 
			|| isSearchSubstring(post.title, this.state.search
			|| isSearchSubstring(post.post, this.state.search)) ){
				filteredPosts.push(post)
			}
		}
		this.setState({posts: filteredPosts})
	}

	formatDate(day) {
		var d = new Date(day)
		var dd = String(d.getDate()).padStart(2, '0');
		var mm = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
		var yyyy = d.getFullYear();

        return mm + '/' + dd + '/' + yyyy;;
	}

	formatTime(day) {
		var d = new Date(day)

		var hh = d.getHours();
		var min = d.getMinutes();
		var ampm = "AM";
		if (hh > 12){
			hh -= 12;
			ampm = "PM";
		}
		if (min < 10){
			min = "0" + min
		}

        return hh + ":" + min + " " + ampm;
	}
		
	
	
	render() {
		
		return (
			<View style={globalStyles.container}>
				
				<SearchBar
					lightTheme={true}
					placeholder="Type Here..."
					onChangeText={(search) => this.updateSearch(search)}
					value={this.state.search}
				/>
				<Icon
              onPress={() => this.props.navigation.navigate('Create Post')}
              name="plus"
              type = "ant-design"
              color = '#000000'
              raised
            />

				
				<ScrollView>
					{
						this.state.posts.map((l, i) => (
							<ListItem.Swipeable key={i} bottomDivider
							
							leftContent={(reset) => (
								<Button
								  title="Info"
								  onPress={() => this.props.navigation.navigate('View Full Post', {post: this.state.posts[i]})}
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
								<ListItem.Subtitle>{ l.locationDescription}</ListItem.Subtitle>
								<ListItem.Subtitle>{ this.formatDate(l.start) + ' ' + this.formatTime(l.start) + ' - ' + this.formatDate(l.end) + ' ' + this.formatTime(l.end)}</ListItem.Subtitle>
								</ListItem.Content>
							</ListItem.Swipeable>
						))
					}
				</ScrollView>
			</View>
		);
		
	}

}




