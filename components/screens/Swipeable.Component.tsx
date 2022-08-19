import React, { memo } from 'react';
import {
  Animated, StyleSheet, I18nManager,
} from 'react-native';
import { Icon } from '@rneui/themed';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import PropTypes from 'prop-types';
import PostComponent from './Post.Component';
import { LiveUserSpecificPost } from '../../types/Post';

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    backgroundColor: '#a76af7',
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
    backgroundColor: '#a76af7',
    flex: 1,
    justifyContent: 'flex-end',
  },
});

function SwipeableComponent({
  navigation, post, setArchived, setStarred,
} : {navigation: any,
   post: LiveUserSpecificPost,
   setArchived: any,
    setStarred: any}) {
  const renderLeftActions = (progress: any, dragX: any) => {
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

  const renderRightActions = (progress: any, dragX: any) => {
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

  return (
    <Swipeable
      onSwipeableOpen={() => {
        setArchived(true);
      }}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <PostComponent
        post={post}
        navigation={navigation}
        setArchived={setArchived}
        setStarred={setStarred}
      />
    </Swipeable>

  );
}

export default memo(SwipeableComponent);

SwipeableComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  setArchived: PropTypes.func.isRequired,
};
