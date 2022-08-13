import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import PostComponent from './Post.Component';
import styles from '../../styles';
import { star, archive } from '../../helpers';
import { LiveUserSpecificPost } from '../../types/Post';

export default function ProfilePostsComponent({
  type, navigation,
} : {type: string, navigation: any}) {
  const [posts, setPosts] = useState<LiveUserSpecificPost[]>([]);

  useEffect(() => {
    if (type === 'archive') {
      setPosts(global.posts.filter((post) => post.isArchived));
    } else if (type === 'starred') {
      setPosts(global.posts.filter((post) => post.isStarred));
    } else if (type === 'ownPosts') {
      setPosts(global.posts.filter((post) => post.isOwnPost));
    }
  }, [type]);
  const [undo, setUndo] = useState<{show: true, postId: string} | {show: false}>({
    show: false,
  });

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
    });
  };

  const undoArchive = () => {
    if (undo.show) {
      Toast.hide();
      showToast('Unarchived.');
      archive(undo.postId, false);
    }
  };

  useEffect(() => {
    if (undo.show) {
      showToast('Post archived! Click here to undo.');
    }
  }, [undo]);

  const keyExtractor = (item : LiveUserSpecificPost) => item.id;
  const renderItem = ({ item } : {item: LiveUserSpecificPost}) => (
    <PostComponent
      key={item.id}
      post={item}
      navigation={navigation}
      setStarred={() => { star(item.id, true); }}
      setArchived={() => {
        archive(item.id, true);
        setUndo({ show: true, postId: item.id });
      }}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      {posts.length > 0
        ? (
          <FlatList
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            initialNumToRender={7}
          />
        )
        : (
          <View style={{ alignItems: 'center', margin: 30 }}>
            <Text style={styles.text}>No posts</Text>
          </View>
        )}

      <Toast
        position="bottom"
        bottomOffset={20}
        onPress={() => undoArchive()}
      />
    </View>
  );
}

ProfilePostsComponent.propTypes = {
  type: PropTypes.string.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
