/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getData } from '../../helpers';
import globalStyles from '../GlobalStyles';

global.user = {};
global.posts = [];
global.upcomingPosts = [];
global.upcomingUnarchivedPosts = [];

export default function LoadDataScreen({ navigation }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const filterToUpcomingUnarchivedPosts = () => {
      firebase.database().ref(`users/${global.user.uid}/archive/`).once('value', (snapshot) => {
        if (!snapshot.exists()) {
          const archivedIDs = Object.keys(snapshot.val());
          global.upcomingUnarchivedPosts = global.upcomingPosts.filter(
            (post) => !(post.id in archivedIDs),
          );
        }
        setLoaded(true);
      });
    };

    const filterToUpcomingPosts = () => {
      const now = Date.now();
      global.upcomingPosts = global.posts.filter((post) => post.end > now);
      filterToUpcomingUnarchivedPosts();
    };

    const loadNewPosts = (lastEditedTimestamp) => {
      firebase.database().ref('Posts')
        .orderByChild('lastEditedTimestamp')
        .startAfter(lastEditedTimestamp)
        .once('value', (snapshot) => {
          snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            post.id = childSnapshot.key;
            // this if statement accounts for the scenario where someone edits their post
            if (post.id in global.posts) {
              global.posts[post.id] = post;
            } else {
              global.posts.push(post);
            }
          });
          filterToUpcomingPosts();
        });
    };

    const loadCachedPosts = () => {
      getData('@posts').then((posts) => {
        if (!posts) {
          global.posts = posts;
          loadNewPosts(posts[posts.length - 1].lastEditedTimestamp);
        } else {
          loadNewPosts(0);
        }
      });
    };
    getData('@user').then((user) => {
      global.user = user;
      loadCachedPosts();
    });
  }, []);

  if (loaded) {
    navigation.navigate('App Navigator');
  }
  return (
    <View style={globalStyles.container}>
      <Text>Loading...</Text>
    </View>
  );
}
