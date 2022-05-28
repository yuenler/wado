/* eslint-disable no-console */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
// import React, { useState } from 'react';
import React from 'react';
import {
  View, Animated, StyleSheet, I18nManager, Text,
} from 'react-native';

import { TouchableHighlight, RectButton } from 'react-native-gesture-handler';
import { ListItem } from '@rneui/themed';
import { Icon } from 'react-native-elements';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { formatTime, formatDate } from '../../helpers';
import globalStyles from '../GlobalStyles';

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#388e3c',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 50,
    marginHorizontal: 10,
    // backgroundColor: 'plum',
    height: 30,
  },
  actionText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat',
  },
  rightAction: {
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#dd2c00',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

// const AnimatedView = Animated.createAnimatedComponent(View);

export default function PostComponent({ navigation, post }) {
  const renderLeftActions = (progress, dragX) => {
    const dragXint = parseInt(JSON.stringify(dragX), 10);
    if (dragXint > 200) {
      console.log('interested');
    }
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.leftAction}>
        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Text>Interested</Text>

        </Animated.Text>
        <Animated.View
          style={[
            styles.actionIcon,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Icon
            name="star"
            size={30}
            color="white"
          />
        </Animated.View>

      </RectButton>
    );
  };

  const renderRightActions = (progress, dragX) => {
    const dragXint = parseInt(JSON.stringify(dragX), 10);
    if (dragXint < -200) {
      console.log('archive');
    }
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.rightAction}>

        <Animated.Text
          style={[
            styles.actionText,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Text>Archive</Text>

        </Animated.Text>
        <Animated.View
          style={[
            styles.actionIcon,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Icon
            name="archive"
            size={30}
            color="white"
          />

        </Animated.View>

      </RectButton>
    );
  };

  return (
    <Swipeable
      leftThreshold={200}
      rightThreshold={200}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
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
              <ListItem.Title style={globalStyles.title}>{post.title}</ListItem.Title>
              <ListItem.Subtitle style={globalStyles.text}>
                {post.locationDescription}
              </ListItem.Subtitle>
              <ListItem.Subtitle style={globalStyles.text}>{`${formatDate(post.start)} ${formatTime(post.start)} - ${formatDate(post.end)} ${formatTime(post.end)}`}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        </View>
      </TouchableHighlight>
    </Swipeable>

  );
}
