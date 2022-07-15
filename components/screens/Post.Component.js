import React, { useState, useEffect, memo } from 'react';
import { View, Alert } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ListItem, Icon } from '@rneui/themed';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic,
} from '../icons';

const colors = ['green', 'blue', 'red'];
function PostComponent({
  navigation, post, setUndo, setArchive,
}) {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    setStarred(post.isStarred);
  }, [post.isStarred]);

  const interested = async (interest) => {
    if (interest === true) {
      setStarred(true);
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).set(true);
        // check if this post is already in global.starred
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
  };

  return (
    <TouchableHighlight
      onPress={() => navigation.navigate('View Full Post', { post, setUndo, setArchive })}
    >
      <View>
        <ListItem>

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

          <ListItem.Content>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1 }}>
                <ListItem.Title
                  numberOfLines={1}
                  style={globalStyles.boldText}
                >
                  {post.title}

                </ListItem.Title>
              </View>
              <View style={{ marginLeft: 5, alignItems: 'flex-end' }}>
                <ListItem.Subtitle
                  style={
                    [globalStyles.smallText, { color: colors[post.datetimeStatus.startStatus] }]
                  }
                >
                  {' '}
                  {post.datetimeStatus.datetime}
                </ListItem.Subtitle>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1 }}>

                <ListItem.Subtitle
                  numberOfLines={1}
                  style={globalStyles.text}
                >
                  {post.locationDescription}
                </ListItem.Subtitle>
                <ListItem.Subtitle
                  numberOfLines={1}
                  style={globalStyles.text}
                >
                  {post.post}
                </ListItem.Subtitle>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableHighlight style={{ margin: 5 }}>
                  <View>
                    {starred
                      ? <Icon name="star" type="entypo" color="gold" onPress={() => interested(false)} />
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

          </ListItem.Content>
        </ListItem>
      </View>
    </TouchableHighlight>
  );
}

export default memo(PostComponent);

PostComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setUndo: PropTypes.func.isRequired,
  setArchive: PropTypes.func.isRequired,
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    locationDescription: PropTypes.string.isRequired,
    post: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    isStarred: PropTypes.bool.isRequired,
    datetimeStatus: PropTypes.shape({
      startStatus: PropTypes.number.isRequired,
      datetime: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
