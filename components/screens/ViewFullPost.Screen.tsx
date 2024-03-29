import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  Alert,
  TouchableOpacity,
  LogBox,
  RefreshControl,
} from 'react-native';
import {
  Input, Icon, ListItem, Avatar,
} from '@rneui/themed';
import { Button } from '@rneui/base';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import PropTypes from 'prop-types';
import * as Linking from 'expo-linking';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import {
  formatTime,
  formatDate,
  formatDateWithMonthName,
  storeData,
} from '../../helpers';
import {
  Food, Performance, Social, Academic, Athletic,
} from '../icons';
import { LiveUserSpecificPost, Category } from '../../types/Post';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

type Comment = {
  id: string,
  comment: string,
  date: number,
  uid: string,
  pfp: string,
  name: string,
}

function CommentComponent({ l, setReply } : {l: Comment, setReply: any}) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);
  const [time, setTime] = useState(formatTime(new Date(l.date)));

  useEffect(() => {
    // if the time of the comment was more than 1 day ago, use date instead
    if (new Date().getTime() - l.date > 86400000) {
      setTime(formatDateWithMonthName(l.date));
    } else {
      setTime(formatTime(new Date(l.date)));
    }
  }, [l.date]);

  return <React.Fragment>
  <View style={{ marginRight: 10 }}>
  <Avatar rounded source={{ uri: l.pfp }} />
  </View>
  <ListItem.Content>
    <View style={{ flexDirection: 'row', flex: 2 }}>
      <View style={{ flex: 1 }}>
      <ListItem.Subtitle>
          <Text style={styles.boldText}>{l.name}</Text>
      </ListItem.Subtitle>
      </View>
      <View style={{ flex: 1 }}>
      <ListItem.Subtitle>
          <Text style={[styles.text, { textAlign: 'right' }]}>{time}</Text>
      </ListItem.Subtitle>
      <ListItem.Subtitle>
          <Text style={[styles.text, { textAlign: 'right', color: colors.blue }]} onPress={() => setReply()}>Reply</Text>
      </ListItem.Subtitle>
      </View>
    </View>
    <ListItem.Title style={styles.text}>{l.comment}</ListItem.Title>
  </ListItem.Content>
  </React.Fragment>;
}

export default function ViewFullPostScreen({
  navigation, route,
}: {navigation: any, route: any}) {
  const {
    colors, isDark, allPosts, setAllPosts, user,
  } = useTheme();
  const styles = globalStyles(colors);

  const commentInput = useRef(null);

  const { post, setArchived, setStarred }: {
    post: LiveUserSpecificPost,
    setArchived: any,
    setStarred: any} = route.params;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState('');
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isStarred, setIsStarred] = useState(post.isStarred);
  const [isArchived, setIsArchived] = useState(post.isArchived);
  const [openStatement, setOpenStatement] = useState('');
  const saveComment = () => {
    try {
      const ref = firebase.database().ref(`Posts/${post.id}/comments`).ref.push();
      if (ref.key) {
        const commentObject : Comment = {
          id: ref.key,
          comment,
          date: new Date().getTime(),
          uid: user.uid,
          pfp: user.photoURL,
          name: user.displayName,
        };
        // check if post.id is a child of posts in firebase
        firebase.database().ref(`Posts/${post.id}`).once('value', (snapshot) => {
          if (snapshot.exists()) {
            ref.set(commentObject);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Post no longer exists.  Try reloading posts.',
            });
            storeData('@posts', []);
            // wait 1 second then go back
            setTimeout(() => {
              navigation.goBack();
            }, 1000);
          }
        });
        setComments([...comments, commentObject]);
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again.',
      });
    }
  };

  const onComment = () => {
    if (comment !== '') {
      saveComment();
      commentInput.current?.clear();
      commentInput.current?.blur();
    }
  };

  const determineIfIsOwnPost = async () => {
    if (user.uid === post.authorID) {
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
        .update(
          {
            lastEditedTimestamp: new Date().getTime(),
            isDeleted: true,
          },
        );

      Toast.show({
        type: 'success',
        text1: 'Post deleted.',
      });
      // wait one sec then go back
      setTimeout(
        () => {
          navigation.goBack();
        },
        1000,
      );
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again.',
      });
    }
    setAllPosts(allPosts.filter(
      (p: LiveUserSpecificPost) => p.id !== post.id,
    ));
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
    setArchived(true);
    goBack();
  };

  const capitalizeFirstLetter = (
    string: string,
  ) => string.charAt(0).toUpperCase() + string.slice(1);

  const determineOpenStatement = () => {
    let statement = 'Open to ';
    let hasRestrictedHouses = false;
    let hasRestrictedYears = false;
    if (post.targetedHouses && post.targetedHouses.length !== 13) {
      hasRestrictedHouses = true;
      statement += 'those living in ';
      for (let i = 0; i < post.targetedHouses.length; i += 1) {
        statement += capitalizeFirstLetter(post.targetedHouses[i]);
        if (i !== post.targetedHouses.length - 1 && post.targetedHouses.length > 2) {
          statement += ', ';
        }
        if (i === post.targetedHouses.length - 2) {
          statement += ' and ';
        }
      }
    }
    if (post.targetedYears && post.targetedYears.length !== 4) {
      hasRestrictedYears = true;
      if (hasRestrictedHouses) {
        statement += ' who are also ';
      } else {
        statement += 'those who are ';
      }
      statement += 'in the class of ';
      for (let i = 0; i < post.targetedYears.length; i += 1) {
        statement += post.targetedYears[i];
        if (i !== post.targetedYears.length - 1 && post.targetedYears.length > 2) {
          statement += ', ';
        }
        if (i === post.targetedYears.length - 2) {
          statement += ' or ';
        }
      }
    }
    if (!hasRestrictedHouses && !hasRestrictedYears) {
      statement += 'everyone';
    }
    statement += '.';
    setOpenStatement(statement);
  };

  const load = () => {
    determineIfIsOwnPost();
    determineOpenStatement();
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
      } else {
        setComments([]);
      }
    });
  };

  const deleteComment = (id: string) => {
    try {
      firebase.database().ref(`Posts/${post.id}/comments/${id}`).remove();
      load();
      Toast.show({
        type: 'success',
        text1: 'Comment deleted.',
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Could not delete comment. Please try again.',
      });
    }
  };

  useEffect(() => {
    load();
  }, []);

  // We reverse the list so that recent comments are at the top instead of the bottom
  const commentsReversed = comments.map((x) => x).reverse();

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
      onScrollBeginDrag={() => commentInput.current?.blur()}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            load();
            setIsRefreshing(false);
          }
          }
        />
      }
      >
        <View style={{
          marginHorizontal: '7%', marginVertical: '5%', flex: 1,
        }}
        >

          <View style={{ flexDirection: 'row', flex: 1 }}>
          <View style={{ flex: 1 }}>
                  {post.category === Category.Food ? <Food size={20}/> : null}
                  {post.category === Category.Performance ? <Performance size={20}/> : null}
                  {post.category === Category.Social ? <Social size={20}/> : null}
                  {post.category === Category.Academic ? <Academic size={20}/> : null}
                  {post.category === Category.Athletic ? <Athletic size={20}/> : null}
          </View>

            {isOwnPost
           && <View >

          <TouchableOpacity onPress={() => editPost()} style={{ padding: 5 }}>
            <Icon
              name="edit"
              containerStyle={{ marginRight: 20 }}
              color={colors.text}
            />
          </TouchableOpacity>
          </View>
          }
          {isOwnPost
          && <TouchableOpacity onPress={() => deletePostWarning()} style={{ padding: 5 }}>
              <Icon name="trash" type="font-awesome"
              containerStyle={{ marginRight: 20 }}
            color={colors.text}
              />
          </TouchableOpacity>
          }
                { isArchived
                  ? <TouchableOpacity onPress={() => {
                    setArchived(false);
                    setIsArchived(false);
                  }} style={{ padding: 5 }}>
                <Icon
                  name="archive"
                  color={colors.purple}
                />
              </TouchableOpacity>
                  : <TouchableOpacity onPress={() => archive()} style={{ padding: 5 }}>
                  <Icon
                    name="archive"
                    color={colors.text}
                  />
                </TouchableOpacity>
              }

            <View style={{ marginLeft: 20 }}>
                <View>
                  {isStarred
                    ? <TouchableOpacity onPress={() => {
                      setIsStarred(false);
                      setStarred(false);
                    }}
                    style={{ padding: 5 }}
                    >
                    <Icon name="star" type="entypo" color={colors.purple} />
                  </TouchableOpacity>
                    : (

                  <TouchableOpacity
                  onPress={() => {
                    setIsStarred(true);
                    setStarred(true);
                  }}
                  style={{ padding: 5 }}
                  >
                      <Icon
                        name="star-outlined"
                        type="entypo"
                        color={colors.text}
                      />
                  </TouchableOpacity>

                    )}
                </View>

            </View>

          </View>

          <View style={{ marginTop: '5%' }}>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.text}>{openStatement}</Text>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 10,
                marginRight: '10%',
                marginTop: '5%',
              }}
            >
              <View style={{ marginRight: 20 }}>
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
            <View style={{ marginRight: 20 }}>
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
              <View style={{ marginRight: 20 }}>
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
            inputContainerStyle={{
              borderBottomColor: isDark ? 'white' : 'black',
            }}
            value={comment}
            rightIcon={
              <TouchableOpacity onPress={() => onComment()} style={{ padding: 5 }}>
              <Icon name="send" size={24} color={colors.purple} />
            </TouchableOpacity>
            }
          />
        </View>

        <View style={{ marginHorizontal: '5%' }}>
        {
          commentsReversed.map((l) => {
            if (user.uid === l.uid) {
              return <ListItem.Swipeable key={l.id} bottomDivider
            containerStyle={{ backgroundColor: colors.background }}
            leftContent={() => (
              <Button
                title="Delete"
                onPress={() => deleteComment(l.id)}
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: 'red' }}
              />
            )}
            >
              <CommentComponent l={l} setReply={() => {
                setComment(`@${l.name}  `);
                commentInput.current?.focus();
              }}/>
            </ListItem.Swipeable>;
            }
            return <ListItem key={l.id} bottomDivider
            containerStyle={{ backgroundColor: colors.background }}
            >
                <CommentComponent l={l} setReply={() => {
                  setComment(`@${l.name}  `);
                  commentInput.current?.focus();
                }}/>
              </ListItem>;
          })
        }
        </View>
      </KeyboardAwareScrollView>
    </View>
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
