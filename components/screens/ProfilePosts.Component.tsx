import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ScrollView, RefreshControl,
} from 'react-native';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import PostComponent from './Post.Component';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import { star, archive } from '../../helpers';
import { LiveUserSpecificPost } from '../../types/Post';

export default function ProfilePostsComponent({
  type, navigation,
} : {type: string, navigation: any}) {
  const { colors, allPosts, setAllPosts } = useTheme();
  const styles = globalStyles(colors);

  const [posts, setPosts] = useState<LiveUserSpecificPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = () => {
    if (type === 'archive') {
      setPosts(allPosts.filter((post) => post.isArchived));
    } else if (type === 'starred') {
      setPosts(allPosts.filter((post) => post.isStarred));
    } else if (type === 'ownPosts') {
      setPosts(allPosts.filter((post) => post.isOwnPost));
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [type, allPosts]);

  const [undo, setUndo] = useState<{show: true, postId: string} | {show: false}>({
    show: false,
  });

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
    });
  };

  const undoArchive = async () => {
    if (undo.show) {
      Toast.hide();
      showToast('Unarchived.');
      setAllPosts(await archive(undo.postId, false, allPosts));
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
      setStarred={async (isStarred: boolean) => {
        setAllPosts(await star(item.id, isStarred, allPosts));
        if (isStarred) {
          showToast('Post starred! We\'ll remind you 30 min before.');
        } else {
          showToast('Post unstarred! We won\'t remind you anymore.');
        }
      }}
      setArchived={async (isArchived) => {
        setAllPosts(await archive(item.id, isArchived, allPosts));
        if (isArchived) {
          setUndo({ show: true, postId: item.id });
        } else {
          showToast('Post unarchived!');
        }
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
            refreshing={isRefreshing}
          onRefresh={() => load()}
          />
        )
        : (
          <ScrollView contentContainerStyle={{ alignItems: 'center', margin: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => load()}
            />
          }
          >
            <Text style={styles.text}>No posts</Text>
          </ScrollView>
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
