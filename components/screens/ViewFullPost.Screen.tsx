/* eslint-disable no-console */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert, TouchableHighlight,
} from 'react-native';
import {
  Input, Icon, ListItem, Avatar,
} from '@rneui/themed';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { Button } from '@rneui/base';
import PropTypes from 'prop-types';
import * as Linking from 'expo-linking';
import globalStyles from '../GlobalStyles';
import { formatTime, formatDate, formatDateWithMonthName } from '../../helpers';
import {
  food, performance, social, academic, athletic,
} from '../icons';
import {Post, Category} from '../../types/Post';

type Comment = {
  id: string | null,
  comment: string,
  date: number,
  uid: string,
  pfp: string,
  name: string,
}


const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: '5%',
  },
  label: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default function ViewFullPostScreen({
  navigation, route, setUndo, setArchive,
}: {navigation: any, route: any, setUndo: any, setArchive: any}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [starred, setStarred] = useState(false);

  const { post }: {post: Post} = route.params;


  const saveComment = (comment: string) => {
    try {
      const ref = firebase.database().ref(`Posts/${post.id}/comments`).ref.push();
      const commentObject : Comment = {
        id: ref.key,
        comment,
        date: new Date().getTime(),
        uid: global.user.uid,
        pfp: global.user.photoURL,
        name: global.user.displayName,
      };
      firebase.database().ref(`Posts/${post.id}/comments/${ref.key}`).set(commentObject);
      setComments([...comments, commentObject]);
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  const onComment = () => {
    if (comment !== '') {
      saveComment(comment);
    }
    setComment(comment);
  }

  const determineIfIsOwnPost = async() => {
    if (global.user.uid === post.authorID) {
      setIsOwnPost(true);
    }
  }

  const editPost = () => {
    navigation.navigate('Create Post', {
      post: post,
    });
  }

  const deletePost = () => {
    try {
      firebase
        .database()
        .ref(`Posts/${post.id}`)
        .remove();
      Alert.alert('Your post has been successfully deleted.');
      navigation.navigate('Posts');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    // remove post from upcomingUnarchivedPosts and from posts and upcomingposts
    global.posts = global.posts.filter(
      (p: Post) => p.id !== post.id,
    );
  }

  const deletePostWarning = () => {
    Alert.alert(
      'Are you sure?',
      'Your post, along with its associated comments, will be permanently deleted if you continue.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => deletePost() },
      ],
    );
  }

  const viewOnMap = () => {
    navigation.navigate('Map Preview', {
      latitude: post.latitude,
      longitude: post.longitude,
      postalAddress: post.postalAddress,
    });
  }

  const interested = async(interest: boolean) => {
    if (interest) {
      setStarred(true);
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).set(true);
        if (!global.starred.find((p) => p.id === post.id)) {
          global.starred.push({ ...post, isStarred: true });
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } else {
      setStarred(false);
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).remove();
        global.starred = global.starred.filter((item) => item.id !== post.id);
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  }

  const archive = async() => {
    const { goBack } = navigation;
    try {
      firebase.database().ref(`users/${global.user.uid}/archive/${post.id}`).set(true);
      if (!global.archive.find((p) => p.id === post.id)) {
        global.archive.push(post);
      }
      setUndo({
        show: true,
        post,
      });
      setArchive(post.id);
      goBack();
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  useEffect(() => {
    determineIfIsOwnPost();
    setStarred(post.isStarred);
    // get all previous comments
    firebase.database().ref(`Posts/${post.id}/comments`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const postComments : Comment[] = [];
        snapshot.forEach((childSnapshot) => {
          const postComment : Comment = {...childSnapshot.val(), id: childSnapshot.key};
          if (postComment.comment !== '') {
            postComments.push(postComment);
          }
        });
        setComments(postComments);
      }
    });
  },[])

  
    // We reverse the list so that recent comments are at the top instead of the bottom
    const commentsReversed = comments.map((x) => x).reverse();

    return (
      <ScrollView style={globalStyles.container}>
        <View style={{
          marginHorizontal: '7%', marginVertical: '5%', flex: 1,
        }}
        >

          <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{flex: 1}}>
                  {post.category === Category.Food ? food() : null}
                  {post.category === Category.Performance ? performance() : null}
                  {post.category === Category.Social ? social() : null}
                  {post.category === Category.Academic ? academic() : null}
                  {post.category === Category.Athletic ? athletic() : null}
          </View>

            {isOwnPost&&
           <View >
            
            <Icon
            // color="#a76af7"
            onPress={() => editPost()}
              name="edit"
              containerStyle={{ marginRight: 10 }}      
              // reverse          
            />
          </View>
          }
          {isOwnPost &&         
          <View>
                
                        <Icon name="trash" type="font-awesome"
                        containerStyle={{ marginRight: 10 }}  
                      onPress={() => deletePostWarning()}
                      // reverse
                      // color="#a76af7"
                        />
                    </View>
          }

            <View>
              <TouchableHighlight style={{ marginLeft: 5 }}>
                <View>
                  <Icon
                    onPress={() => archive()}
                    name="archive"
                  />
                </View>
              </TouchableHighlight>
            </View>

            <View style={{ marginLeft: 10 }}>
              <TouchableHighlight style={{ marginLeft: 5 }}>
                <View>
                  {starred
                    ? <Icon name="star" type="entypo" color="#a76af7" onPress={() => interested(false)} />
                    : (
                      <Icon
                        onPress={() => interested(true)}
                        name="star-outlined"
                        type="entypo"
                      />
                    )}
                </View>

              </TouchableHighlight>
            </View>

          </View>

          <View style={{ marginTop: '5%' }}>
            <Text style={globalStyles.title}>{post.title}</Text>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
                marginRight: '10%',
              }}
            >
              <View style={{ marginRight: 10, marginTop: '5%' }}>
                <Icon name="calendar" type="entypo" />
              </View>

              {formatDateWithMonthName(post.start) === formatDateWithMonthName(post.end)
                ? <Text style={globalStyles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(new Date(post.start))} - ${formatTime(new Date(post.end))}`}</Text>
                : <Text style={globalStyles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(new Date(post.start))} - ${formatTime(new Date(post.end))} ${formatDateWithMonthName(post.end)}`}</Text>}
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
              marginRight: '10%',
            }}
          >
            <View style={{ marginRight: 10 }}>
              <Icon name="location" type="entypo" />
            </View>
            <Text
              onPress={() => viewOnMap()}
              style={[globalStyles.text, { color: 'blue', textDecorationLine: 'underline' }]}
            >
              {post.locationDescription}

            </Text>
          </View>

          {post.link !== '' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
                marginRight: '10%',
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Icon name="link" type="entypo" />
              </View>
              <Text
                onPress={() => Linking.openURL(post.link)}
                style={[globalStyles.text, { color: 'blue', textDecorationLine: 'underline' }]}
              >
                {post.link}

              </Text>
            </View>
          ) : null}

          {post.post !== '' ? (
            <View style={{
              marginVertical: 10,
              backgroundColor: 'lightgray',
              padding: 20,
              borderRadius: 20,
            }}
            >
              <Text style={globalStyles.title}>Description</Text>
              <Text style={globalStyles.text}>{post.post}</Text>
            </View>
          ) : null}

          {isOwnPost ? (
            <View style={{ marginVertical: 10, flexDirection: 'row', flex: 3}}>
              <Text style={globalStyles.text}>This is your post.</Text>
            </View>
          ) : (
            <View style={{ marginVertical: 10 }}>
              <Text style={globalStyles.text}>{`This post was made by ${post.author}.`}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Input
            inputStyle={globalStyles.text}
            placeholder="Type a comment..."
            onChangeText={(value) => setComment(value)}
            value={comment}
            rightIcon={
              <Icon name="send" size={24} color="#278adb" onPress={() => onComment()} />
            }
          />
        </View>

        <View  style={{marginHorizontal: '5%'}}>
        {
          commentsReversed.map((l) => (
            <ListItem key={l.id} bottomDivider>
              <Avatar rounded source={{ uri: l.pfp }} />
              <ListItem.Content>
                <ListItem.Subtitle style={globalStyles.smallText}>
                  {`${l.name} ${formatDate(new Date(l.date))} ${formatTime(new Date(l.date))}`}
                </ListItem.Subtitle>
                <ListItem.Title style={globalStyles.text}>{l.comment}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
        </View>
      </ScrollView>
    );
}

ViewFullPostScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      post: PropTypes.shape({
        title: PropTypes.string.isRequired,
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        locationDescription: PropTypes.string.isRequired,
        postalAddress: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
        post: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
        id: PropTypes.string.isRequired,
        authorID: PropTypes.string.isRequired,
        isStarred: PropTypes.bool.isRequired,
      }).isRequired,
      setUndo: PropTypes.func.isRequired,
      setArchive: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
