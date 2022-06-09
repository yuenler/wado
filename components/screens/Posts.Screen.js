import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  FlatList, View,
} from 'react-native';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/database';
import { Button } from '@rneui/base';
import { SearchBar } from '@rneui/themed';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import SwipeableComponent from './Swipeable.Component';
import {
  isSearchSubstring, loadNewPosts, filterToUpcomingPosts, filterToUpcomingUnarchivedPosts,
} from '../../helpers';
import { getIcon } from '../icons';

export default function PostsScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterButtonStatus, setFilterButtonStatus] = useState({
    social: 'outline',
    food: 'outline',
    performance: 'outline',
    academic: 'outline',
    athletic: 'outline',
  });

  const mounted = useRef(false);

  const applySearchAndFilter = useCallback((postsToFilter) => {
    const postSatisfiesFilters = (post) => {
      if (filters.includes(post.category) || filters.length === 0) {
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
    postsToFilter.forEach((post) => {
      if (postSatisfiesSearch(post) && postSatisfiesFilters(post)) {
        searchAndFilteredPosts.push(post);
      }
    });
    return searchAndFilteredPosts;
  }, [filters, search]);

  const handleFilterButtonPress = (filter) => {
    if (mounted.current === true) {
      if (filters.includes(filter)) {
        setFilterButtonStatus({ ...filterButtonStatus, [filter]: 'outline' });
        setFilters(filters.filter((c) => c !== filter));
      } else {
        setFilterButtonStatus({ ...filterButtonStatus, [filter]: 'solid' });
        setFilters([...filters, filter]);
      }
    }
  };

  const handleRefresh = async () => {
    if (mounted.current === true) {
      await loadNewPosts(global.posts[global.posts.length - 1].lastEditedTimestamp);
      await filterToUpcomingPosts();
      await filterToUpcomingUnarchivedPosts();
      setAllPosts(global.upcomingUnarchivedPosts);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setAllPosts(global.upcomingUnarchivedPosts);
  }, []);

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

  const renderItem = ({ item }) => (
    <SwipeableComponent
      key={item.id}
      post={item}
      navigation={navigation}
    />
  );

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

          {
            (['social', 'performance', 'food', 'academic', 'athletic']).map((filter) => (
              <Button
                containerStyle={{ flex: 1, margin: 2 }}
                buttonStyle={{ padding: 2 }}
                key={filter}
                onPress={() => handleFilterButtonPress(filter)}
                icon={() => getIcon(filter, 10)}
                type={filterButtonStatus[filter]}
              />
            ))
          }
        </View>
      </View>

      <View>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={() => handleRefresh()}
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

PostsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
