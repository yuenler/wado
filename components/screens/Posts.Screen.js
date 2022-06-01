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
import {
  food, performance, social, academic, athletic,
} from '../icons';

let user = {};

export default function PostsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    time: '',
  });
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(false);

  const applySearchAndFilter = useCallback((postsToFilter) => {
    const postSatisfiesFilters = (post) => {
      if ((filters.categories.includes(post.category) || filters.categories.length === 0)
        && (filters.time === '' || (filters.time >= post.start && filters.time <= post.end))) {
        return true;
      }
      return false;
    };

    const postSatisfiesSearch = (post) => {
      const s = search.trim();
      if (s === ''
        || isSearchSubstring(post.author, s)
        || isSearchSubstring(post.category, s)
        || isSearchSubstring(post.locationDescription, s)
        || isSearchSubstring(post.title, s)
        || isSearchSubstring(post.post, s)) {
        return true;
      }
      return false;
    };

    const searchAndFilteredPosts = [];
    for (const post of postsToFilter) {
      if (postSatisfiesSearch(post) && postSatisfiesFilters(post)) {
        searchAndFilteredPosts.push(post);
      }
    }
    return (searchAndFilteredPosts);
  }, [filters.categories, filters.time, search]);

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
              setAllPosts([...allPosts, ...filteredPosts]);
              setPosts([...posts, ...applySearchAndFilter(filteredPosts)]);
              setIsRefreshing(false);
            }
          }
        });
      });
    };
    let lastPostEnd = new Date().getTime();
    if (allPosts.length > 0) {
      lastPostEnd = allPosts[allPosts.length - 1].end;
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
  }, [allPosts, applySearchAndFilter, posts]);

  useEffect(() => {
    if (posts.length < 30) {
      loadMoreData();
    }
  }, [loadMoreData, posts]);

  useEffect(() => {
    if (mounted.current === true && allPosts.length > 0) {
      setPosts(applySearchAndFilter(allPosts));
    }
  }, [search, filters, applySearchAndFilter, allPosts]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <View style={globalStyles.container}>
      <View>
        <SearchBar
          lightTheme
          clearIcon
          // showLoading
          round
          placeholder="Type Here..."
          onChangeText={(value) => setSearch(value)}
          value={search}
        />

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, margin: 5 }}>
            <Button
              icon={() => social()}
            // type="outline"
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <Button
              icon={() => performance()}
            // type="outline"
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <Button
              icon={() => food()}
            // type="outline"
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <Button
              icon={() => academic()}
            // type="outline"
            />
          </View>
          <View style={{ flex: 1, margin: 5 }}>
            <Button
              icon={() => athletic()}
            // type="outline"
            />
          </View>
        </View>
      </View>

      <View>
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
          onRefresh={() => { if (mounted.current === true) { setAllPosts([]); setPosts([]); } }}
          onEndReached={() => { loadMoreData(); }}
          onEndReachedThreshold={0.5}
          initialNumToRender={7}
        />
      </View>

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
