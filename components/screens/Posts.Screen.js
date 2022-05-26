import React from 'react';
import { ScrollView, Text, StyleSheet, View} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';
import { ListItem } from "@rneui/themed";
import { Button } from "@rneui/base";
import { SearchBar, Icon, Avatar } from 'react-native-elements';
import {formatTime, formatDate} from '../../helpers'
import { TouchableHighlight } from 'react-native-gesture-handler';

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

let posts = [];

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
			const p = []
			snapshot.forEach((childSnapshot) => {
				var post = childSnapshot.val()
				post['id'] = childSnapshot.key
				p.push(post);

			  });
			posts = p;
			this.setState({posts: p})
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
			

				
				<ScrollView>
					{
						this.state.posts.map((l, i) => (
							<TouchableHighlight
							key={i}
							onPress={() => this.props.navigation.navigate('View Full Post', {post: this.state.posts[i]})}
							>
							<View>
							<ListItem  bottomDivider	>
								
								{l.category == 'food'?  <Icon name="food-fork-drink" type = 'material-community'/>: null}
								{l.category == 'performance'? <Icon name="music" type = 'font-awesome'/>: null}
								{l.category == 'social'? <Icon name="user-friends" type = 'font-awesome-5'/>: null}
								{l.category == 'academic'? <Icon name="book" type = 'entypo'/>: null}
								{l.category == 'athletic'? <Icon name="running" type = 'font-awesome-5'/>: null}

								<ListItem.Content>
								<ListItem.Title style={globalStyles.title}>{l.title}</ListItem.Title>
								<ListItem.Subtitle style={globalStyles.text}>{ l.locationDescription}</ListItem.Subtitle>
								<ListItem.Subtitle style={globalStyles.text}>{ formatDate(l.start) + ' ' + formatTime(l.start) + ' - ' + formatDate(l.end) + ' ' + formatTime(l.end)}</ListItem.Subtitle>
								</ListItem.Content>
							</ListItem>
							</View>
							</TouchableHighlight>
							

						))
					}
				</ScrollView>
			<View style={{alignItems: 'flex-end', margin: 20}}>
			<Button
			containerStyle={{
				borderRadius: 10,
              }}
			  buttonStyle={{
                // backgroundColor: 'rgba(111, 202, 186, 1)',
                // borderColor: 'transparent',
                // borderWidth: 0,
                // borderRadius: 5,
                padding: 15,
				paddingHorizontal: 20,
              }}
			icon={{
                name: 'plus',
                type: 'font-awesome',
                type: "ant-design",
              	color: 'white',
				size: 20
              }}
			title="Create post"
			onPress={() => this.props.navigation.navigate('Create Post', {post: {}})}
              name="plus"
            />
			
			</View>

			</View>
		);
		
	}

}




