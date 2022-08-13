import React, { useState, useEffect, useRef } from 'react';
import {
  Text, View, ScrollView, Alert, TouchableHighlight,
} from 'react-native';
import {
  Input, Icon, ListItem, Avatar,
} from '@rneui/themed';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import PropTypes from 'prop-types';
import * as Linking from 'expo-linking';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import {
  formatTime,
  formatDate,
  formatDateWithMonthName,
  getData,
  storeData,
} from '../../helpers';
import {
  Food, Performance, Social, Academic, Athletic,
} from '../icons';
import { LiveUserSpecificPost, Category, UserSpecificPost } from '../../types/Post';

type Comment = {
  id: string | null,
  comment: string,
  date: number,
  uid: string,
  pfp: string,
  name: string,
}

export default function ViewFullPostScreen({
  navigation, route,
}: {navigation: any, route: any}) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const commentInput = useRef(null);

  const { post, setArchived, setStarred }: {
    post: LiveUserSpecificPost,
    setArchived: any,
    setStarred: any} = route.params;

  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isStarred, setIsStarred] = useState(post.isStarred);

  const saveComment = () => {
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
  };

  const onComment = () => {
    if (comment !== '') {
      saveComment();
    }
    setComment(comment);
  };

  const determineIfIsOwnPost = async () => {
    if (global.user.uid === post.authorID) {
      setIsOwnPost(true);
    }
  };

  const editPost = () => {
    navigation.navigate('Create Post', {
      post,
    });
  };

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
    global.posts = global.posts.filter(
      (p: LiveUserSpecificPost) => p.id !== post.id,
    );
    // remove from async storage
    getData('@posts').then((storedPosts : UserSpecificPost[]) => {
      const storedPostsCopy = [...storedPosts];
      if (storedPosts !== null) {
        const i = storedPosts.findIndex((p: UserSpecificPost) => p.id === post.id);
        storedPostsCopy.splice(i, 1);
        storeData('@posts', storedPostsCopy);
      }
    });
  };

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
  };

  const viewOnMap = () => {
    navigation.navigate('Map Preview', {
      latitude: post.latitude,
      longitude: post.longitude,
      postalAddress: post.postalAddress,
    });
  };

  const archive = async () => {
    const { goBack } = navigation;
    setArchived();
    goBack();
  };

  useEffect(() => {
    determineIfIsOwnPost();
    // get all previous comments
    firebase.database().ref(`Posts/${post.id}/comments`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const postComments : Comment[] = [];
        snapshot.forEach((childSnapshot) => {
          const postComment : Comment = { ...childSnapshot.val(), id: childSnapshot.key };
          if (postComment.comment !== '') {
            postComments.push(postComment);
          }
        });
        setComments(postComments);
      }
    });
  }, []);

  // We reverse the list so that recent comments are at the top instead of the bottom
  const commentsReversed = comments.map((x) => x).reverse();

  return (
      <ScrollView
      style={styles.container}
      onScrollBeginDrag={() => commentInput.current?.blur()}
      >
        <View style={{
          marginHorizontal: '7%', marginVertical: '5%', flex: 1,
        }}
        >

          <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ flex: 1 }}>
                  {post.category === Category.Food ? <Food size={12}/> : null}
                  {post.category === Category.Performance ? <Performance size={12}/> : null}
                  {post.category === Category.Social ? <Social size={12}/> : null}
                  {post.category === Category.Academic ? <Academic size={12}/> : null}
                  {post.category === Category.Athletic ? <Athletic size={12}/> : null}
          </View>

            {isOwnPost
           && <View >

            <Icon
            onPress={() => editPost()}
              name="edit"
              containerStyle={{ marginRight: 10 }}
            />
          </View>
          }
          {isOwnPost
          && <View>
              <Icon name="trash" type="font-awesome"
              containerStyle={{ marginRight: 10 }}
            onPress={() => deletePostWarning()}
              />
          </View>
          }

            <View>
              <TouchableHighlight style={{ marginLeft: 5 }}>
                <View>
                  <Icon
                    onPress={() => archive()}
                    name="archive"
                    color={colors.text}
                  />
                </View>
              </TouchableHighlight>
            </View>

            <View style={{ marginLeft: 10 }}>
              <TouchableHighlight style={{ marginLeft: 5 }}>
                <View>
                  {isStarred
                    ? <Icon name="star" type="entypo" color="#a76af7" onPress={() => {
                      setIsStarred(false);
                      setStarred(false);
                    }} />
                    : (
                      <Icon
                        onPress={() => {
                          setIsStarred(true);
                          setStarred(true);
                        }}
                        name="star-outlined"
                        type="entypo"
                        color={colors.text}
                      />
                    )}
                </View>

              </TouchableHighlight>
            </View>

          </View>

          <View style={{ marginTop: '5%' }}>
            <Text style={styles.title}>{post.title}</Text>
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
                <Icon name="calendar" type="entypo" color={colors.text} />
              </View>

              {formatDateWithMonthName(post.start) === formatDateWithMonthName(post.end)
                ? <Text style={styles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(new Date(post.start))} - ${formatTime(new Date(post.end))}`}</Text>
                : <Text style={styles.text}>{`${formatDateWithMonthName(post.start)} ${formatTime(new Date(post.start))} - ${formatTime(new Date(post.end))} ${formatDateWithMonthName(post.end)}`}</Text>}
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
              <Icon name="location" type="entypo" color={colors.text} />
            </View>
            <Text
              onPress={() => viewOnMap()}
              style={[styles.text, { color: colors.link, textDecorationLine: 'underline' }]}
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
                <Icon name="link" type="entypo" color={colors.text} />
              </View>
              <Text
                onPress={() => Linking.openURL(post.link)}
                style={[styles.text, { color: colors.link, textDecorationLine: 'underline' }]}
              >
                {post.link}

              </Text>
            </View>
          ) : null}

          {post.post !== '' ? (
            <View style={{
              marginVertical: 10,
              backgroundColor: colors.middleBackground,
              padding: 20,
              borderRadius: 20,
            }}
            >
              <Text style={styles.title}>Description</Text>
              <Text style={styles.text}>{post.post}</Text>
            </View>
          ) : null}

          {isOwnPost ? (
            <View style={{ marginVertical: 10, flexDirection: 'row', flex: 3 }}>
              <Text style={styles.text}>This is your post.</Text>
            </View>
          ) : (
            <View style={{ marginVertical: 10 }}>
              <Text style={styles.text}>{`This post was made by ${post.author}.`}</Text>
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Input
            ref={commentInput}
            inputStyle={styles.text}
            placeholder="Type a comment..."
            onChangeText={(value) => setComment(value)}
            value={comment}
            rightIcon={
              <Icon name="send" size={24} color="#a76af7" onPress={() => onComment()} />
            }
          />
        </View>

        <View style={{ marginHorizontal: '5%' }}>
        {
          commentsReversed.map((l) => (
            <ListItem key={l.id} bottomDivider>
              <Avatar rounded source={{ uri: l.pfp }} />
              <ListItem.Content>
                <ListItem.Subtitle style={styles.smallText}>
                  {`${l.name} ${formatDate(new Date(l.date))} ${formatTime(new Date(l.date))}`}
                </ListItem.Subtitle>
                <ListItem.Title style={styles.text}>{l.comment}</ListItem.Title>
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
      setArchived: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
};
