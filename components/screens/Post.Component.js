/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { Icon, ListItem } from 'react-native-elements';
import { formatTime, formatDateWithMonthName, getUser } from '../../helpers';
import globalStyles from '../GlobalStyles';

let user = {};

export default function PostComponent({ navigation, post }) {
  const [datetime, setDatetime] = useState('');
  const [starred, setStarred] = useState(false);
  const [alreadyStarted, setAlreadyStarted] = useState(false);

  const determineDatetime = () => {
    const currentDate = new Date();
    if (currentDate.getTime() < post.start) {
      if (currentDate.getDate() === new Date(post.start).getDate()) {
        setDatetime(`Starts ${formatTime(post.start)}`);
      } else {
        setDatetime(`Starts ${formatDateWithMonthName(post.start)}`);
      }
    } else if (currentDate.getTime() <= post.end) {
      setAlreadyStarted(true);
      if (currentDate.getDate() === new Date(post.end).getDate()) {
        setDatetime(`Ends ${formatTime(post.end)}`);
      } else {
        setDatetime(`Ends ${formatDateWithMonthName(post.end)}`);
      }
    }
  };

  const determineIfStarred = async () => {
    if (Object.keys(user).length === 0) {
      user = await getUser();
    }
    firebase.database().ref(`users/${user.uid}/starred/${post.id}`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        setStarred(true);
      } else {
        setStarred(false);
      }
    });
  };

  useEffect(() => {
    determineIfStarred();
    determineDatetime();
  }, []);

  const interested = async (interest) => {
    if (Object.keys(user).length === 0) {
      user = await getUser();
    }

    if (interest === true) {
      setStarred(true);
      try {
        firebase.database().ref(`users/${user.uid}/starred/${post.id}`).set(true);
      } catch (error) {
        console.log(error);
      }
    } else {
      setStarred(false);
      try {
        firebase.database().ref(`users/${user.uid}/starred/${post.id}`).remove();
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <TouchableHighlight
      onPress={() => navigation.navigate('View Full Post', { post })}
    >
      <View>
        <ListItem bottomDivider>

          {post.category === 'food' ? <Icon name="food-fork-drink" type="material-community" /> : null}
          {post.category === 'performance' ? <Icon name="music" type="font-awesome" /> : null}
          {post.category === 'social' ? <Icon name="user-friends" type="font-awesome-5" /> : null}
          {post.category === 'academic' ? <Icon name="book" type="entypo" /> : null}
          {post.category === 'athletic' ? <Icon name="running" type="font-awesome-5" /> : null}

          <ListItem.Content>
            <View style={{ flexDirection: 'row', flex: 3 }}>
              <View style={{ flex: 2 }}>
                <ListItem.Title
                  numberOfLines={1}
                  style={globalStyles.boldText}
                >
                  {post.title}

                </ListItem.Title>
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
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                {alreadyStarted
                  ? (
                    <ListItem.Subtitle style={[globalStyles.smallText, { color: 'blue' }]}>
                      {' '}
                      {datetime}
                    </ListItem.Subtitle>
                  )
                  : (
                    <ListItem.Subtitle style={[globalStyles.smallText, { color: 'green' }]}>
                      {' '}
                      {datetime}
                    </ListItem.Subtitle>
                  )}
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
