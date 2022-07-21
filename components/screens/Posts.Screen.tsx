import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  FlatList, View, Alert,
} from 'react-native';
import { Button } from '@rneui/base';
import { SearchBar } from '@rneui/themed';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import firebase from 'firebase/compat';
import 'firebase/compat/database';
import globalStyles from '../GlobalStyles';
import SwipeableComponent from './Swipeable.Component';
import {
  isSearchSubstring, loadNewPosts, filterToUpcomingPosts, filterToUpcomingUnarchivedPosts,
} from '../../helpers';
import { getIcon } from '../icons';
import {Post, Category} from '../../types/Post';

export default function PostsScreen({ navigation } : { navigation: any }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFullButton, setShowFullButton] = useState(true);
  const [undo, setUndo] = useState<{show: boolean, post: Post | null}>({
    show: false,
    post: null,
  });
  const [archive, setArchive] = useState(null);

  let lastContentOffset = 0;
  let isScrolling = false;

  const [filterButtonStatus, setFilterButtonStatus] = useState({
    social: 'outline',
    food: 'outline',
    performance: 'outline',
    academic: 'outline',
    athletic: 'outline',
  });

  const mounted = useRef(false);

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
    });
  };

  const applySearchAndFilter = useCallback((postsToFilter: Post[]) => {
    const postSatisfiesFilters = (post: Post) => {
      if (filters.includes(post.category) || filters.length === 0) {
        return true;
      }
      return false;
    };

    const postSatisfiesSearch = (post: Post) => {
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

    const searchAndFilteredPosts : Post[] = [];
    postsToFilter.forEach((post: Post) => {
      if (postSatisfiesSearch(post) && postSatisfiesFilters(post)) {
        searchAndFilteredPosts.push(post);
      }
    });
    return searchAndFilteredPosts;
  }, [filters, search]);

  const handleFilterButtonPress = (filter: Category) => {
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
      setIsRefreshing(true);
      await loadNewPosts(global.posts[global.posts.length - 1].lastEditedTimestamp);
      await filterToUpcomingPosts();
      await filterToUpcomingUnarchivedPosts();
      setAllPosts(global.upcomingUnarchivedPosts);
      setIsRefreshing(false);
    }
  };

  const undoArchive = () => {
    try {
      if (undo.post){
        Toast.hide();
        showToast('Unarchived.');
        // remove key value pair from firebase
        firebase.database().ref(`users/${global.user.uid}/archive/${undo.post.id}`).remove();
        // remove undo.post from global.archive
        global.archive = global.archive.filter((p) => p.id !== undo.post.id);
        // add undo.post to global.upcomingUnarchivedPosts
        global.upcomingUnarchivedPosts.push(undo.post);
        global.upcomingUnarchivedPosts.sort((a, b) => a.end - b.end);
        if (mounted.current === true) {
          setAllPosts(global.upcomingUnarchivedPosts);
          setPosts(applySearchAndFilter(global.upcomingUnarchivedPosts));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
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

  useEffect(() => {
    if (undo.show) {
      showToast('Post archived! Click here to undo.');
    }
  }, [undo]);

  useEffect(() => {
    // remove archive from upcomingUnarchivedPosts
    global.upcomingUnarchivedPosts = global.upcomingUnarchivedPosts.filter((p) => p.id !== archive);
    setAllPosts(global.upcomingUnarchivedPosts);
  }, [archive]);

  const keyExtractor = (item: Post) => item.id;
  const renderItem = ({ item } : {item: Post}) => (
    <SwipeableComponent
      key={item.id}
      post={item}
      navigation={navigation}
      setUndo={setUndo}
      setArchive={setArchive}
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
            ([Category.Social, Category.Performance, Category.Food, Category.Academic, Category.Athletic]).map((filter) => (
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
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={() => handleRefresh()}
          initialNumToRender={7}
          onScroll={(event) => {
            if (lastContentOffset > event.nativeEvent.contentOffset.y) {
              // move up
              if (isScrolling === true) {
                setShowFullButton(true);
              }
            } else if (lastContentOffset < event.nativeEvent.contentOffset.y) {
              if (isScrolling === true) {
                setShowFullButton(false);
              }
            }
            lastContentOffset = event.nativeEvent.contentOffset.y;
          }}
          onScrollBeginDrag={() => {
            isScrolling = true;
          }}
          onScrollEndDrag={() => {
            isScrolling = false;
          }}

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
        {showFullButton
          ? (
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
          )
          : (
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
              title=""
              onPress={() => navigation.navigate('Create Post', { post: {} })}
              name="plus"
            />
          )}

      </View>

      <Toast
        position="bottom"
        bottomOffset={20}
        onPress={() => undoArchive()}
      />

    </View>
  );
}

PostsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
