/* eslint-disable no-console */
import React from 'react';
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

const styles = StyleSheet.create({
  inputContainer: {
    margin: '5%',
  },
  label: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default class ViewFullPostScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      comments: [],
      isOwnPost: false,
      starred: false,
      archived: false,
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
    if (global.user.uid === route.params.post.authorID) {
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
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  saveComment(comment) {
    const { comments } = this.state;
    const json = {
      comment,
      date: new Date().getTime(),
      uid: global.user.uid,
      pfp: global.user.photoURL,
      name: global.user.displayName,
    };
    try {
      this.ref.push(json);
      this.setState({ comments: comments.concat([json]) });
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  }

  viewOnMap() {
    const { navigation, route } = this.props;
    navigation.navigate('Map Preview', {
      latitude: route.params.post.latitude,
      longitude: route.params.post.longitude,
      postalAddress: route.params.post.postalAddress,
    });
  }

  async interested(interest) {
    const { route } = this.props;
    const { post } = route.params;
    if (interest === true) {
      this.setState({ starred: true });
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).set(true);
        global.starred.push(post);
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } else {
      this.setState({ starred: false });
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).remove();
        global.starred = global.starred.filter((item) => item.id !== post.id);
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  }

  async archive(status) {
    const { route, navigation } = this.props;
    const { goBack } = navigation;
    const { post } = route.params;
    if (status === true) {
      this.setState({ archived: true });
      try {
        firebase.database().ref(`users/${global.user.uid}/archive/${post.id}`).set(true);
        global.archive.push(post);
        // navigate back
        goBack();
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } else {
      this.setState({ archived: false });
      try {
        firebase.database().ref(`users/${global.user.uid}/archive/${post.id}`).remove();
        global.archive = global.archive.filter((item) => item.id !== post.id);
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  }

  render() {
    const {
      comments, isOwnPost, comment, archived,
    } = this.state;
    const { route } = this.props;
    const { post } = route.params;

    // We reverse the list so that recent comments are at the top instead of the bottom
    const commentsReversed = comments.map((x) => x).reverse();

    const { starred } = this.state;

    return (
      <ScrollView style={globalStyles.container}>
        <View style={{
          marginHorizontal: '7%', marginVertical: '5%', flex: 1,
        }}
        >

          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={{ flex: 1 }}>
              {post.category === 'food' ? (
                food()
              ) : null}
              {post.category === 'performance' ? (
                performance()
              ) : null}
              {post.category === 'social' ? (
                social()
              ) : null}
              {post.category === 'academic' ? (
                academic()
              ) : null}
              {post.category === 'athletic' ? (
                athletic()
              ) : null}
            </View>

            <View>
              <TouchableHighlight style={{ margin: 5 }}>
                <View>
                  {archived
                    ? <Icon name="archive" color="blue" onPress={() => this.archive(false)} />
                    : (
                      <Icon
                        onPress={() => this.archive(true)}
                        name="archive"
                      />
                    )}
                </View>
              </TouchableHighlight>
            </View>

            <View style={{ marginLeft: 10 }}>
              <TouchableHighlight style={{ margin: 5 }}>
                <View>
                  {starred
                    ? <Icon name="star" type="entypo" color="gold" onPress={() => this.interested(false)} />
                    : (
                      <Icon
                        onPress={() => this.interested(true)}
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
                ? <Text style={globalStyles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(post.start)} - ${formatTime(post.end)}`}</Text>
                : <Text style={globalStyles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(post.start)} - ${formatTime(post.end)} ${formatDateWithMonthName(post.end)}`}</Text>}
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
              onPress={() => this.viewOnMap()}
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
            inputStyle={globalStyles.text}
            placeholder="Type a comment..."
            onChangeText={(value) => this.setState({ comment: value })}
            value={comment}
            rightIcon={
              <Icon name="send" size={24} color="#278adb" onPress={() => this.onComment()} />
            }
          />
        </View>

        {
          commentsReversed.map((l) => (
            <ListItem key={l} bottomDivider>
              <Avatar rounded source={{ uri: l.pfp }} />
              <ListItem.Content>
                <ListItem.Subtitle>
                  {`${l.name} ${formatDate(l.date)} ${formatTime(l.date)}`}
                </ListItem.Subtitle>
                <ListItem.Title>{l.comment}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          ))
        }
      </ScrollView>
    );
  }
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
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
