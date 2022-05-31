/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Animated, StyleSheet, I18nManager,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Icon } from 'react-native-elements';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getUser } from '../../helpers';
import PostComponent from './Post.Component';

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#3492eb',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
  },
  actionIcon: {
    width: 50,
    marginHorizontal: 10,
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
    backgroundColor: '#3492eb',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

let user = {};

export default function SwipeableComponent({ navigation, post }) {
  const [archived, setArchived] = useState(false);

  const archive = async () => {
    if (Object.keys(user).length === 0) {
      user = await getUser();
    }
    try {
      firebase.database().ref(`users/${user.uid}/archive/${post.id}`).set(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderLeftActions = (progress, dragX) => {
    const dragXint = parseInt(JSON.stringify(dragX), 10);
    if (dragXint > 200) {
      setTimeout(() => setArchived(true), 0);
      archive();
    }
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.leftAction}>
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

  const renderRightActions = (progress, dragX) => {
    const dragXint = parseInt(JSON.stringify(dragX), 10);
    if (dragXint < -200) {
      setTimeout(() => setArchived(true), 0);
      archive();
    }

    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton style={styles.rightAction}>
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

  if (archived) {
    return (null);
  }

  return (
    <Swipeable
      leftThreshold={200}
      rightThreshold={200}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <PostComponent post={post} navigation={navigation} />
    </Swipeable>

  );
}
