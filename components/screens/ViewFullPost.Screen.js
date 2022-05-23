import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import {Input, Icon, ListItem, Avatar} from 'react-native-elements';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {globalStyles} from '../GlobalStyles';

export default class ViewFullPost extends React.Component {
  
  state = {
    comment: '',
    comments: [],
  }

  // get ref(){
  //   return firebase.database().ref('Announcements/' + this.props.route.params.id  + '/comments');
  // }

  componentDidMount(){
    //get all previous comments
    // this.ref.on('child_added', (snapshot) =>{
    //   if (snapshot.exists()){
    //     let comment = snapshot.val().comment
    //     let uid = snapshot.val().uid
    //     let date = snapshot.val().date
    //     firebase.database().ref('Users/' + uid).on('value', (snapshot) =>{
    //         let name = snapshot.val().name
    //         let pfp = snapshot.val().pfp
    //         let comments = this.state.comments.concat({
    //           uid: uid,
    //           comment: comment,
    //           name: name,
    //           pfp: pfp,
    //           date: date
    //         })
    //         this.state.comments = comments
    //         this.forceUpdate()
    //     })
        
    //   }
    // })

  }


  // onComment(){
  //   this.setState({ comment: ''})
  //   this.saveComment(this.state.comment)
  // }

  // saveComment(comment){
  //   let today = formatTime()
  //   this.ref.push({
  //     comment: comment,
  //     date: today,
  //     uid: user.uid
  //   })
  // }

  render() {
    // We reverse the list so that recent comments are at the top instead of the bottom
    // let commentsReversed = this.state.comments.map((x) => x).reverse()


    var post = this.props.route.params.post
    return (
      <View style={globalStyles.container}>
        <View style={{margin: '10%'}}>
          <Text>{post.category}</Text>
          <Text  style={styles.title}>{post.title}</Text>

        { post.startDate == post.endDate?
          <View style={{ 
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 10
            }}>
          <Icon 
          name = "calendar"
          type="entypo"
          />
          <Text>{post.startDate}</Text>
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
          <Text>{post.startDate + ' - ' + post.endDate}</Text>
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
        <Text>{post.startTime + ' - ' + post.endTime}</Text>
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

          <Text style={styles.description}>{'This post was made by ' + post.author + '.'}</Text>

          
          

          {/* {
            commentsReversed.map((l, i) => (
              <ListItem key={i} bottomDivider>
                <Avatar source={{uri: l.pfp}} />
                <ListItem.Content>
                <ListItem.Subtitle>{l.name + " " + l.date}</ListItem.Subtitle>
                  <ListItem.Title>{l.comment}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))
          } */}


      {/* <View style={styles.inputContainer}>
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
          </View> */}
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
		position: 'absolute',
    bottom: 0, 
	},
  label: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
  }

});
