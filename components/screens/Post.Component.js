/* eslint-disable no-console */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, memo } from 'react';
import { View } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ListItem, Icon } from '@rneui/themed';
import { formatTime, formatDateWithMonthName } from '../../helpers';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic,
} from '../icons';

const colors = ['green', 'blue', 'red'];
function PostComponent({ navigation, post }) {
  const [datetime, setDatetime] = useState('');
  const [starred, setStarred] = useState(false);
  const [startStatus, setStartStatus] = useState(0);

  useEffect(() => {
    const determineDatetime = () => {
      const currentDate = new Date();
      if (currentDate.getTime() < post.start) {
        if (currentDate.getDate() === new Date(post.start).getDate()) {
          setDatetime(`Starts ${formatTime(post.start)}`);
        } else {
          setDatetime(`Starts ${formatDateWithMonthName(post.start)}`);
        }
      } else if (currentDate.getTime() <= post.end) {
        setStartStatus(1);
        if (currentDate.getDate() === new Date(post.end).getDate()) {
          setDatetime(`Ends ${formatTime(post.end)}`);
        } else {
          setDatetime(`Ends ${formatDateWithMonthName(post.end)}`);
        }
      } else {
        setStartStatus(2);
        setDatetime('Ended');
      }
    };

    const determineIfStarred = async () => {
      if (global.starredIds.includes(post.id)) {
        setStarred(true);
      }
    };

    determineIfStarred();
    determineDatetime();
  }, [post.end, post.id, post.start]);

  const interested = async (interest) => {
    if (interest === true) {
      setStarred(true);
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).set(true);
        global.starred.push(post);
        global.starredIds.push(post.id);
      } catch (error) {
        console.log(error);
      }
    } else {
      setStarred(false);
      try {
        firebase.database().ref(`users/${global.user.uid}/starred/${post.id}`).remove();
        global.starred = global.starred.filter((item) => item.id !== post.id);
        global.starredIds = global.starredIds.filter((item) => item !== post.id);
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
                <ListItem.Subtitle style={[globalStyles.smallText, { color: colors[startStatus] }]}>
                  {' '}
                  {datetime}
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
