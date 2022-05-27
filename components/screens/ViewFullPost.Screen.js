/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Alert,
} from 'react-native';
import {
  Input, Icon, ListItem, Avatar,
} from 'react-native-elements';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { Button } from '@rneui/base';
import globalStyles from '../GlobalStyles';
import { formatTime, formatDate, getUser } from '../../helpers';

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: 'white',
    width: '100%',
  },
  label: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

let user = {};

export default class ViewFullPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      comments: [],
      isOwnPost: false,
    };
  }

  componentDidMount() {
    this.determineIfIsOwnPost();
    // get all previous comments
    this.ref.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
          const comment = childSnapshot.val();
          comment.id = childSnapshot.key;
          if (comment.comment !== '') {
            comments.push(comment);
          }
        });
        this.setState({ comments });
      }
    });
  }

  async onComment() {
    const { comment } = this.state;
    if (Object.keys(user).length === 0) {
      user = await getUser();
    }
    if (comment !== '') {
      this.saveComment(comment);
    }
    this.setState({ comment: '' });
  }

  get ref() {
    const { route } = this.props;
    return firebase.database().ref(`Posts/${route.params.post.id}/comments`);
  }

  async determineIfIsOwnPost() {
    const { route } = this.props;
    user = await getUser();
    if (user.uid === route.params.post.authorID) {
      this.setState({ isOwnPost: true });
    }
  }

  editPost() {
    const { route, navigation } = this.props;
    navigation.navigate('Create Post', {
      post: route.params.post,
    });
  }

  deletePostWarning() {
    Alert.alert(
      'Are you sure?',
      'Your post, along with its associated comments, will be permanently deleted if you continue.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => this.deletePost() },
      ],
    );
  }

  deletePost() {
    const { route, navigation } = this.props;

    try {
      firebase
        .database()
        .ref(`Posts/${route.params.post.id}`)
        .remove();
      Alert.alert('Your post has been successfully deleted.');
      navigation.navigate('Posts');
    } catch (e) {
      console.log(e);
    }
  }

  saveComment(comment) {
    const { comments } = this.state;
    const json = {
      comment,
      date: new Date().getTime(),
      uid: user.uid,
      pfp: user.photoURL,
      name: user.displayName,
    };
    try {
      this.ref.push(json);
      this.setState({ comments: comments.concat([json]) });
    } catch (e) {
      console.log(e);
    }
  }

  viewOnMap() {
    const { navigation, route } = this.props;
    navigation.navigate('Map Preview', {
      latitude: route.params.post.latitude,
      longitude: route.params.post.longitude,
    });
  }

  render() {
    const { comments, isOwnPost, comment } = this.state;
    const { route } = this.props;
    const { post } = route.params;

    // We reverse the list so that recent comments are at the top instead of the bottom
    const commentsReversed = comments.map((x) => x).reverse();

    return (
      <ScrollView style={globalStyles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <Text style={globalStyles.text}>{post.category}</Text>
          <Text style={globalStyles.title}>{post.title}</Text>

          {post.start === post.end ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Icon name="calendar" type="entypo" />
              </View>
              <Text style={globalStyles.text}>{formatDate(post.start)}</Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Icon name="calendar" type="entypo" />
              </View>

              <Text style={globalStyles.text}>
                {`${formatDate(post.start)} - ${formatDate(post.end)}`}
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <Icon name="clock" type="evilicon" />
            </View>
            <Text style={globalStyles.text}>
              {`${formatTime(post.start)} - ${formatTime(post.end)}`}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <Icon name="location" type="entypo" />
            </View>
            <Text style={globalStyles.text}>{post.locationDescription}</Text>
          </View>

          <View>
            <Text style={globalStyles.text}>{post.postalAddress}</Text>
            <Button title="View on map" onPress={() => this.viewOnMap()} />
          </View>

          {post.link !== '' ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
              }}
            >
              <View style={{ marginRight: 10 }}>
                <Icon name="link" type="entypo" />
              </View>
              <Text>{post.link}</Text>
            </View>
          ) : null}

          {post.post !== '' ? (
            <View style={{ marginVertical: 10 }}>
              <Text style={globalStyles.title}>Description</Text>
              <Text style={globalStyles.text}>{post.post}</Text>
            </View>
          ) : null}

          {isOwnPost ? (
            <View style={{ marginVertical: 10 }}>
              <Text style={globalStyles.text}>This is your post.</Text>

              <View style={{ flexDirection: 'row', flex: 2 }}>
                <View style={{ flex: 1, margin: 5 }}>
                  <Button onPress={() => this.editPost()} title="Edit Post" />
                </View>

                <View style={{ flex: 1, margin: 5 }}>
                  <Button
                    onPress={() => this.deletePostWarning()}
                    color="error"
                    title="Delete Post"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginVertical: 10 }}>
              <Text style={globalStyles.text}>{`This post was made by ${post.author}.`}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Input
            placeholder="Type a comment..."
            onChangeText={(value) => this.setState({ comment: value })}
            value={comment}
            rightIcon={
              <Icon name="send" size={24} color="#278adb" onPress={() => this.onComment()} />
            }
          />
        </View>

        {commentsReversed.map((l) => (
          <ListItem key={l} bottomDivider>
            <Avatar rounded source={{ uri: l.pfp }} />
            <ListItem.Content>
              <ListItem.Subtitle>
                {`${l.name} ${formatDate(l.date)} ${formatTime(l.date)}`}
              </ListItem.Subtitle>
              <ListItem.Title>{l.comment}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>
    );
  }
}
