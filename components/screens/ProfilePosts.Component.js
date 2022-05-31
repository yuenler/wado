/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import PostComponent from './Post.Component';
import { getUser } from '../../helpers';
import globalStyles from '../GlobalStyles';

export default function ProfilePostsComponent({ type, navigation, user }) {
  const [posts, setPosts] = useState([]);

  const objToPosts = (obj) => {
    const allPosts = [];
    Object.keys(obj).forEach((post) => {
      const postID = post;
      firebase.database().ref(`Posts/${postID}`).once('value', (snapshot) => {
        const p = snapshot.val();
        p.id = postID;
        allPosts.push(p);
        if (allPosts.length === Object.keys(obj).length) {
          setPosts(allPosts);
        }
      });
    });
  };

  useEffect(() => {
    const getPosts = async () => {
      let u = user;
      if (Object.keys(u).length === 0) {
        u = await getUser();
      }
      firebase.database().ref(`users/${u.uid}/${type}`).once('value', (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          objToPosts(data, 'starred');
        }
      });
    };
    getPosts();
  }, [type, user, user.uid]);

  return (
    <View style={{ flex: 1 }}>
      {posts.length > 0
        ? (
          <ScrollView>
            {posts.map((post) => (
              <PostComponent key={post.id} post={post} navigation={navigation} />
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
