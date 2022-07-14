import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text,
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

  // const objToPosts = (obj) => {
  //   const allPosts = [];
  //   Object.keys(obj).forEach((post) => {
  //     const postID = post;
  //     firebase.database().ref(`Posts/${postID}`).once('value', (snapshot) => {
  //       const p = snapshot.val();
  //       p.id = postID;
  //       allPosts.push(p);
  //       if (allPosts.length === Object.keys(obj).length) {
  //         setPosts(allPosts);
  //       }
  //     });
  //   });
  // };

  // const reload = () => {
  //   const getPosts = async () => {
  //     firebase.database().ref(`users/${global.user.uid}/${type}`).once('value', (snapshot) => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         objToPosts(data);
  //       }
  //     });
  //   };
  //   getPosts();
  // };

  useEffect(() => {
    if (type === 'archive') {
      setPosts(global.archive);
    } else if (type === 'starred') {
      setPosts(global.starred);
    } else if (type === 'ownPosts') {
      setPosts(global.ownPosts);
    }
  }, [type]);

  return (
    <View style={{ flex: 1 }}>
      {posts.length > 0
        ? (
          <ScrollView>
            {posts.map((post) => (
              <PostComponent
                key={post.id}
                post={post}
                navigation={navigation}
                setUndo={setUndo}
                setArchive={setArchive}
              />
            ))}
          </ScrollView>
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
