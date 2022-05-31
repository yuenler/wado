/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  FlatList, View,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Button } from '@rneui/base';
import { SearchBar } from '@rneui/themed';
import globalStyles from '../GlobalStyles';
import SwipeableComponent from './Swipeable.Component';
import { isSearchSubstring, getUser } from '../../helpers';

const allPosts = [];

let user = {};

export default function PostsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(false);

  const loadMoreData = useCallback(() => {
    const filterOutArchivedPosts = async (p) => {
      const filteredPosts = [];
      if (Object.keys(user).length === 0) {
        user = await getUser();
      }
      let count = 0;
      p.forEach((post) => {
        firebase.database().ref(`users/${user.uid}/archive/${post.id}`).once('value', (snapshot) => {
          if (!snapshot.exists()) {
            filteredPosts.push(post);
          }
          count += 1;
          if (count === p.length) {
            if (mounted.current === true) {
              setPosts([...posts, ...filteredPosts]);
              setIsRefreshing(false);
            }
          }
        });
      });
    };
    let lastPostEnd = new Date().getTime();
    if (posts.length > 0) {
      lastPostEnd = posts[posts.length - 1].end;
    }
    firebase.database().ref('Posts')
      .orderByChild('end') // need to change to ensure we always have unique end times
      .startAfter(lastPostEnd)
      .limitToFirst(10)
      .once('value', (snapshot) => {
        const p = [];
        snapshot.forEach((childSnapshot) => {
          const post = childSnapshot.val();
          post.id = childSnapshot.key;
          p.push(post);
        });
        if (p.length > 0) {
          filterOutArchivedPosts(p);
        }
      });
  }, [posts]);

  const updateSearch = (value) => {
    setSearch(value);
    const filteredPosts = [];
    const s = search.trim();
    for (const post of allPosts) {
      if (
        s === ''
        || isSearchSubstring(post.author, s)
        || isSearchSubstring(post.category, s)
        || isSearchSubstring(post.locationDescription, s)
        || isSearchSubstring(post.title, s
          || isSearchSubstring(post.post, s))) {
        filteredPosts.push(post);
      }
    }
    setPosts(filteredPosts);
  };

  useEffect(() => {
    if (posts.length < 30) {
      loadMoreData();
    }
  }, [loadMoreData, posts]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <View style={globalStyles.container}>

      <SearchBar
        lightTheme
        placeholder="Type Here..."
        onChangeText={(value) => updateSearch(value)}
        value={search}
      />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <SwipeableComponent
            key={item.id}
            post={item}
            navigation={navigation}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={() => { if (mounted.current === true) { setPosts([]); } }}
        onEndReached={() => { loadMoreData(); }}
        onEndReachedThreshold={0.5}
        initialNumToRender={7}
      />

      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        right: 20,
      }}
      >
        <Button
          containerStyle={{
            borderRadius: 10,
          }}
          buttonStyle={{
            padding: 15,
            paddingHorizontal: 20,
          }}
          icon={{
            name: 'plus',
            type: 'ant-design',
            color: 'white',
            size: 20,
          }}
          title="Create post"
          onPress={() => navigation.navigate('Create Post', { post: {} })}
          name="plus"
        />

      </View>

    </View>
  );
}
