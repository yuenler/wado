import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';
import { ListItem } from "@rneui/themed";
import { Button } from "@rneui/base";
import { SearchBar, Icon } from 'react-native-elements';
import {formatTime, formatDate} from '../../helpers'

const isSearchSubstring = (string, substring) => {

	const indexes = [-1];

	for (let index = 0; index < string.length; index++) {
		if (string[index] === ' ') {
			indexes.push(index);
		}
	}

	for (const index of indexes) {
		if (string.startsWith(substring, index+1)) {
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
				var post = childSnapshot.val()
				post['id'] = childSnapshot.key
				posts.push(post);

			  });
			this.setState({posts})
		});
	};	


	updateSearch(search) {
		this.setState({search: search})
		const filteredPosts = []
		const s = search.trim()
		for (const post of posts){
			if (
			search == ''
			|| isSearchSubstring(post.author, s) 
			|| isSearchSubstring(post.category, s) 
			|| isSearchSubstring(post.locationDescription, s) 
			|| isSearchSubstring(post.title, s
			|| isSearchSubstring(post.post, s)) ){
				filteredPosts.push(post)
			}
		}
		this.setState({posts: filteredPosts})
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
								<ListItem.Subtitle>{ formatDate(l.start) + ' ' + formatTime(l.start) + ' - ' + formatDate(l.end) + ' ' + formatTime(l.end)}</ListItem.Subtitle>
								</ListItem.Content>
							</ListItem.Swipeable>
						))
					}
				</ScrollView>
			</View>
		);
		
	}

}




