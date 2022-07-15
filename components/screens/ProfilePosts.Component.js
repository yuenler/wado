import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList,
} from 'react-native';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/database';
import PropTypes from 'prop-types';
import PostComponent from './Post.Component';
import globalStyles from '../GlobalStyles';

export default function ProfilePostsComponent({
  type, navigation, setUndo, setArchive,
}) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (type === 'archive') {
      setPosts(global.archive);
    } else if (type === 'starred') {
      setPosts(global.starred);
    } else if (type === 'ownPosts') {
      setPosts(global.ownPosts);
    }
  }, [type]);

  const keyExtractor = (item) => item.id;
  const renderItem = ({ item }) => (
    <PostComponent
      key={item.id}
      post={item}
      navigation={navigation}
      setUndo={setUndo}
      setArchive={setArchive}
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
            <Text style={globalStyles.text}>No posts</Text>
          </View>
        )}
    </View>
  );
}

ProfilePostsComponent.propTypes = {
  type: PropTypes.string.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setUndo: PropTypes.func.isRequired,
  setArchive: PropTypes.func.isRequired,
};
