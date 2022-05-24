import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import {Input, Icon, ListItem, Avatar} from 'react-native-elements';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';
import {formatTime, formatDate} from '../../helpers'

const comments = [];

export default class ViewFullPost extends React.Component {
  
  state = {
    comment: '',
    comments: [],
  }

  get ref(){
    return firebase.database().ref('Posts/' + this.props.route.params.id  + '/comments');
  }

  componentDidMount(){
    //get all previous comments
    this.ref.once('value', (snapshot) => {
      if (snapshot.exists()){
        snapshot.forEach((childSnapshot) => {

          var comment = childSnapshot.val()
          comment['id'] = childSnapshot.key
          comments.push(comment);

          });
        this.setState({comments})
      }

		});      
      

  }


  onComment(){
    this.setState({ comment: ''})
    this.saveComment(this.state.comment)
  }

  saveComment(comment){
    let today = formatTime()
    this.ref.push({
      comment: comment,
      date: today,
      uid: user.uid
    })
  }

  render() {
    // We reverse the list so that recent comments are at the top instead of the bottom
    let commentsReversed = this.state.comments.map((x) => x).reverse()

    var post = this.props.route.params.post
    return (
      <View style={globalStyles.container}>
        <View style={{margin: '10%'}}>
          <Text>{post.category}</Text>
          <Text  style={styles.title}>{post.title}</Text>

        { post.start == post.end?
          <View style={{ 
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10
            }}>
          <Icon 
          name = "calendar"
          type="entypo"
          />
          <Text>{formatDate(post.start)}</Text>
          </View>
          :

          <View style={{ 
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10
            }}>
          <Icon 
          name = "calendar"
          type="entypo"
          />
          <Text>{formatDate(post.start) + ' - ' + formatDate(post.end)}</Text>
          </View>
        }

        <View style={{ 
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 10
          }}>
        <Icon 
        name = "clock"
        type="evilicon"
        />
        <Text>{formatTime(post.start) + ' - ' + formatTime(post.end)}</Text>
        </View>
          
          <View style={{ 
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10}}>
          <Icon 
          name = "location"
          type="entypo"
          />
          <Text>{post.locationDescription}</Text>
          </View>

          <View style={{ 
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10
            }}>
          <Icon 
          name = "link"
          type="entypo"
          />
          <Text>{post.link}</Text>
          </View>

          <View style={{marginVertical: 20}}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{post.post}</Text>
          </View>

            <View>
          <Text style={styles.description}>{'This post was made by ' + post.author + '.'}</Text>
            </View>
          
          

          {
            commentsReversed.map((l, i) => (
              <ListItem key={i} bottomDivider>
                <Avatar source={{uri: l.pfp}} />
                <ListItem.Content>
                <ListItem.Subtitle>{l.name + " " + l.date}</ListItem.Subtitle>
                  <ListItem.Title>{l.comment}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))
          }


      <View style={styles.inputContainer}>
      <Input placeholder="Type a comment..."
						onChangeText={comment => this.setState({ comment })}
						value={this.state.comment}
            rightIcon={
              <Icon
                name='send'
                size={24}
                color='#278adb'
                onPress={() => this.onComment()}
              />
            }
					/> 
          </View>
          </View>
        </View>

          
      
    )
  }
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Montserrat',
    fontSize: 30,
    fontWeight: 'bold',
  },
  description: {
    fontFamily: 'Montserrat',
    fontSize: 15
  },
	inputContainer: {
    backgroundColor: 'white',
    width: '100%',

	},
  label: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
  }

});
