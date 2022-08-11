import React, {
  useState, useEffect, useRef,
} from 'react';
import {
  FlatList, View,
} from 'react-native';
import { Button } from '@rneui/base';
import { SearchBar } from '@rneui/themed';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import globalStyles from '../GlobalStyles';
import SwipeableComponent from './Swipeable.Component';
import {
  isSearchSubstring,
  loadNewPosts,
  star,
  archive,
} from '../../helpers';
import { getIcon } from '../icons';
import { Category, LiveUserSpecificPost } from '../../types/Post';

export default function PostsScreen({ navigation } : { navigation: any }) {
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
        || isSearchSubstring(post.category, s)
        || isSearchSubstring(post.locationDescription, s)
        || isSearchSubstring(post.title, s)
        || isSearchSubstring(post.post, s)) {
        return true;
      }
      return false;
    };

    const searchAndFilteredPosts : LiveUserSpecificPost[] = [];

    global.posts.forEach((post: LiveUserSpecificPost) => {
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
      if (global.posts.length > 0) {
        await loadNewPosts(global.posts, global.posts[global.posts.length - 1].lastEditedTimestamp);
      } else {
        await loadNewPosts([], 0);
      }
      applySearchAndFilter();
      setIsRefreshing(false);
    }
  };

  const undoArchive = () => {
    if (undo.show) {
      Toast.hide();
      showToast('Unarchived.');
      archive(undo.postId, false);
      if (mounted.current === true) {
        applySearchAndFilter();
      }
    }
  };

  useEffect(() => {
    if (mounted.current === true) {
      applySearchAndFilter();
    }
  }, [search, filters]);

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

  const keyExtractor = (item: LiveUserSpecificPost | {id: 'search'} | {id: 'filter'}) => item.id;

  const renderItem = ({ item } : {item: LiveUserSpecificPost | {id: 'search'} | {id: 'filter'}}) => {
    if (item.id === 'search') {
      return <SearchBar
      lightTheme
      clearIcon
      round
      placeholder="Type Here..."
      onChangeText={(value) => setSearch(value)}
      value={search}
    />;
    }
    if (item.id === 'filter') {
      return <View style={{ flexDirection: 'row', backgroundColor: 'white' }}>
      {
        ([Category.Social,
          Category.Performance,
          Category.Food,
          Category.Academic,
          Category.Athletic]).map((filter) => (
          <Button
            containerStyle={{ flex: 1, margin: 2 }}
            color="#a76af7"
            buttonStyle={{ padding: 2, borderColor: '#a76af7' }}
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
          setArchived={() => {
            archive(item.id, true);
            setUndo({
              show: true,
              postId: item.id,
            });
            applySearchAndFilter();
          }}
          setStarred={(isStarred: boolean) => {
            star(item.id, isStarred);
            applySearchAndFilter();
          }}
        />
      </View>;
  };

  return (
    <View style={globalStyles.container}>

      <View>
        <FlatList
          stickyHeaderIndices={[1]}
          data={[{ id: 'search' }, { id: 'filter' }, ...posts]}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={() => handleRefresh()}
          getItemLayout={(data, index) => ({ length: 91, offset: 91 * index, index })}
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
        }, globalStyles.button]}
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
