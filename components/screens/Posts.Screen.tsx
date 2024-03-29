import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  FlatList, View, Alert, Platform,
} from 'react-native';
import { Button } from '@rneui/base';
import { SearchBar } from '@rneui/themed';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import SwipeableComponent from './Swipeable.Component';
import {
  isSearchSubstring,
  star,
  archive,
  loadPosts,
} from '../../helpers';
import { getIcon } from '../icons';
import { Category, LiveUserSpecificPost } from '../../types/Post';

export default function PostsScreen({ navigation } : { navigation: any }) {
  const {
    colors, isDark, allPosts,
    setAllPosts, house, year, user, firstTime,
    setFirstTime, toastPressed, setToastPressed,
  } = useTheme();
  const styles = globalStyles(colors);

  const searchRef = useRef(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Category[]>([]);
  const [posts, setPosts] = useState<LiveUserSpecificPost[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [undo, setUndo] = useState<{show: true, postId: string} | {show: false}>({
    show: false,
  });

  const [filterButtonStatus, setFilterButtonStatus] = useState<{
    social: 'outline' | 'solid',
    food: 'outline' | 'solid',
    performance: 'outline' | 'solid',
    academic: 'outline' | 'solid',
    athletic: 'outline' | 'solid',
  }>({
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

  const applySearchAndFilter = () => {
    const postSatisfiesFilters = (post: LiveUserSpecificPost) => {
      if (filters.includes(post.category) || filters.length === 0) {
        return true;
      }
      return false;
    };

    const postSatisfiesSearch = (post: LiveUserSpecificPost) => {
      const s = search.trim();
      if (s === ''
        || isSearchSubstring(post.author, s)
        || isSearchSubstring(post.locationDescription, s)
        || isSearchSubstring(post.title, s)
        || isSearchSubstring(post.post, s)) {
        return true;
      }
      return false;
    };

    const searchAndFilteredPosts : LiveUserSpecificPost[] = [];

    allPosts.forEach((post: LiveUserSpecificPost) => {
      if (!post.isArchived && postSatisfiesSearch(post) && postSatisfiesFilters(post)) {
        searchAndFilteredPosts.push(post);
      }
    });
    setPosts(searchAndFilteredPosts);
  };

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
      setAllPosts(await loadPosts(house, year, user, true));
      applySearchAndFilter();
      setIsRefreshing(false);
    }
  };

  const undoArchive = async () => {
    if (undo.show) {
      Toast.hide();
      showToast('Unarchived.');
      setAllPosts(await archive(undo.postId, false, allPosts));
      if (mounted.current === true) {
        applySearchAndFilter();
      }
    }
  };

  useEffect(() => {
    setPosts(allPosts.filter((post) => !post.isArchived));
    if (firstTime) {
      setFirstTime(false);
      Alert.alert(
        'Welcome to Wado!',
        'Let\'s first set up your profile. Click "Set up" below to continue.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          { text: 'Set up', onPress: () => navigation.navigate('Edit Profile') },
        ],
      );
    }
  }, []);

  useEffect(() => {
    if (mounted.current === true) {
      applySearchAndFilter();
    }
  }, [search, filters, allPosts]);

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
    if (toastPressed && undo.show) {
      undoArchive();
      setToastPressed(false);
    }
  }, [toastPressed]);

  const keyExtractor = (item: LiveUserSpecificPost | {id: 'search'} | {id: 'filter'}) => item.id;

  const renderItem = ({ item } : {item: LiveUserSpecificPost | {id: 'search'} | {id: 'filter'}}) => {
    if (item.id === 'search' && !isDark && (Platform.OS === 'ios' || Platform.OS === 'android')) {
      return <SearchBar
      ref={searchRef}
      platform={Platform.OS}
      clearIcon
      placeholder="Type Here..."
      onChangeText={(value) => setSearch(value)}
      value={search}
    />;
    } if (item.id === 'search') {
      return <SearchBar
      ref={searchRef}
      lightTheme={!isDark}
      clearIcon
      round
      placeholder="Type Here..."
      onChangeText={(value) => setSearch(value)}
      value={search}
    />;
    }
    if (item.id === 'filter') {
      return <View style={{ flexDirection: 'row', backgroundColor: colors.background }}>
      {
        ([Category.Social,
          Category.Performance,
          Category.Food,
          Category.Academic,
          Category.Athletic]).map((filter) => (
          <Button
            containerStyle={{ flex: 1, margin: 2 }}
            color={colors.purple}
            buttonStyle={{ padding: 2, borderColor: colors.purple }}
            key={filter}
            onPress={() => handleFilterButtonPress(filter)}
            icon={getIcon(filter, 10)}
            type={filterButtonStatus[filter]}
          />
        ))
      }
    </View>;
    }
    return <View>
      <SwipeableComponent
          key={item.id}
          post={item}
          navigation={navigation}
          setArchived={async (isArchived) => {
            setPosts(posts.filter((p) => p.id !== item.id));
            setAllPosts(await archive(item.id, isArchived, allPosts));
            if (isArchived) {
              setUndo({
                show: true,
                postId: item.id,
              });
            } else {
              showToast('Post unarchived!');
              setUndo({
                show: false,
              });
            }
          }}
          setStarred={async (isStarred: boolean) => {
            setUndo({
              show: false,
            });
            setAllPosts(await star(item.id, isStarred, allPosts));
            if (isStarred) {
              showToast('Post starred! We\'ll remind you 30 min before.');
            } else {
              showToast('Post unstarred! We won\'t remind you anymore.');
            }
          }}
        />
      </View>;
  };

  return (
    <SafeAreaView style={styles.container}>

      <View>
        <FlatList
          stickyHeaderIndices={[1]}
          data={[{ id: 'search' }, { id: 'filter' }, ...posts]}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={() => handleRefresh()}
          getItemLayout={(data, index) => ({ length: 91, offset: 91 * index, index })}
          onScrollBeginDrag={() => { searchRef.current?.blur(); }}
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
        buttonStyle={[{
          padding: 15,
          paddingHorizontal: 20,
        }, styles.button]}
        titleStyle={styles.buttonText}
        icon={{
          name: 'plus',
          type: 'ant-design',
          color: 'white',
          size: 20,
        }}
        title="Create post"
        onPress={() => navigation.navigate('Create Post', { post: {} })}
      />

      </View>

    </SafeAreaView>
  );
}

PostsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
