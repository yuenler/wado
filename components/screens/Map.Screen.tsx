import React, {
  useState, useEffect, useRef,
} from 'react';
import MapView from 'react-native-maps';
import {
  View, Alert,
} from 'react-native';
import { Button } from '@rneui/base';
import { ButtonGroup } from '@rneui/themed';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import {
  getIcon,
} from '../icons';
import { determineDatetime, archive, star } from '../../helpers';
import { LiveUserSpecificPost, Category } from '../../types/Post';
import MapMarker from './Map.Marker';

type PostMarker = {
  post: LiveUserSpecificPost,
  latlng: {latitude: number, longitude: number}
}

export default function MapScreen({ navigation } : { navigation: any }) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const [markers, setMarkers] = useState<PostMarker[]>([]);
  const [filters, setFilters] = useState<Category[]>([]);
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [undo, setUndo] = useState<{show: true, postId: string} | {show: false}>({
    show: false,
  });
  const mounted = useRef(false);

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
    });
  };

  const applyFilter = () => {
    const applyTimeFilter = (morePostsToFilter: LiveUserSpecificPost[]) => {
      if (selectedIndex === 1) {
        // return posts whose start or end time is within the next 5 hours
        const fiveHours = 5 * 60 * 60 * 1000;
        const fiveHoursFromNow = Date.now() + fiveHours;
        const filteredPosts = morePostsToFilter.filter(
          (post: LiveUserSpecificPost) => (
            post.start <= fiveHoursFromNow || post.end <= fiveHoursFromNow),
        );
        return filteredPosts;
      }
      if (selectedIndex === 2) {
        // return posts whose start or end time is within the next 24 hours
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const twentyFourHoursFromNow = Date.now() + twentyFourHours;
        const filteredPosts = morePostsToFilter.filter(
          (post: LiveUserSpecificPost) => (
            post.start <= twentyFourHoursFromNow || post.end <= twentyFourHoursFromNow),
        );
        return filteredPosts;
      }
      if (selectedIndex === 3) {
        // return posts whose start or end time is within the next 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const sevenDaysFromNow = Date.now() + sevenDays;
        const filteredPosts = morePostsToFilter.filter(
          (post: LiveUserSpecificPost) => (
            post.start <= sevenDaysFromNow || post.end <= sevenDaysFromNow),
        );
        return filteredPosts;
      }
      return morePostsToFilter;
    };
    let filteredPosts: LiveUserSpecificPost[] = global.posts.filter((post) => !post.isArchived);

    filteredPosts = filteredPosts.filter((
      post: LiveUserSpecificPost,
    ) => filters.includes(post.category) || filters.length === 0);
    filteredPosts = applyTimeFilter(filteredPosts);
    return (filteredPosts);
  };

  const createMarkers = (posts: LiveUserSpecificPost[]) => {
    const m: PostMarker[] = [];
    for (let i = 0; i < posts.length; i += 1) {
      m.push({
        post: posts[i],
        latlng: { latitude: posts[i].latitude, longitude: posts[i].longitude },
      });
    }
    setMarkers(m);
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

  const undoArchive = () => {
    try {
      if (undo.show) {
        Toast.hide();
        showToast('Unarchived.');
        archive(undo.postId, false);
        createMarkers(applyFilter());
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const setArchived = (postId: string) => {
    archive(postId, true);
    setUndo({ show: true, postId });
    setMarkers(markers.filter((marker) => marker.post.id !== postId));
  };

  const setStarred = (postId: string, isStarred: boolean) => {
    star(postId, isStarred);
  };

  useEffect(() => {
    createMarkers(global.posts.filter((post) => !post.isArchived));
  }, []);

  useEffect(() => {
    if (mounted.current === true) {
      createMarkers(applyFilter());
    }
  }, [filters, selectedIndex]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>

        {
          ([Category.Social,
            Category.Performance,
            Category.Food,
            Category.Academic,
            Category.Athletic]).map((filter) => (
            <Button
              containerStyle={{ flex: 1, margin: 2 }}
              buttonStyle={{ padding: 2, borderColor: '#a76af7' }}
              color='#a76af7'
              key={filter}
              onPress={() => handleFilterButtonPress(filter)}
              icon={getIcon(filter, 10)}
              type={filterButtonStatus[filter]}
            />
          ))
        }
      </View>
      <ButtonGroup
        selectedButtonStyle={{ backgroundColor: '#a76af7' }}
        buttonContainerStyle={{ backgroundColor: colors.background }}
        textStyle={{ color: colors.text }}
        onPress={(value) => {
          setSelectedIndex(value);
        }}
        selectedIndex={selectedIndex}
        buttons={['All posts', 'Now', 'Next day', 'Next week']}
      />
      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: global.latitude,
          longitude: global.longitude,
          latitudeDelta: 0.0052,
          longitudeDelta: 0.0052,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsBuildings
        showsIndoors
        showsIndoorLevelPicker
        loadingEnabled
        loadingIndicatorColor="#a76af7"
      >
        {
          markers.map((marker) => {
            const datetimeStatus = determineDatetime(marker.post.start, marker.post.end);
            return (
              <MapMarker
                key={marker.post.id}
                marker={marker}
                datetimeStatus={datetimeStatus}
                navigation={navigation}
                setStarred={(isStarred: boolean) => setStarred(marker.post.id, isStarred)}
                setArchived={() => setArchived(marker.post.id)}
              />
            );
          })
        }

      </MapView>
      <Toast
        position="bottom"
        bottomOffset={20}
        onPress={() => undoArchive()}
      />

    </SafeAreaView>
  );
}

MapScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
