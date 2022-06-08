/* eslint-disable no-restricted-syntax */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import MapView from 'react-native-maps';
import {
  StyleSheet, View, Dimensions,
} from 'react-native';
import { Button } from '@rneui/base';
import { ButtonGroup } from '@rneui/themed';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic, getIcon,
} from '../icons';

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default function MapScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filterButtonStatus, setFilterButtonStatus] = useState({
    social: 'outline',
    food: 'outline',
    performance: 'outline',
    academic: 'outline',
    athletic: 'outline',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mounted = useRef(false);

  const createMarkers = (p) => {
    const m = [];
    for (let i = 0; i < p.length; i += 1) {
      m.push({
        id: p[i].id,
        category: p[i].category,
        latlng: { latitude: p[i].latitude, longitude: p[i].longitude },
      });
    }
    setMarkers(m);
  };

  const applyTimeFilter = (postsToFilter) => {
    if (selectedIndex === 1) {
      // return posts whose start or end time is within the next 5 hours
      const fiveHours = 5 * 60 * 60 * 1000;
      const fiveHoursFromNow = Date.now() + fiveHours;
      const filteredPosts = postsToFilter.filter(
        (post) => (post.start <= fiveHoursFromNow || post.end <= fiveHoursFromNow),
      );
      return filteredPosts;
    }
    if (selectedIndex === 2) {
      // return posts whose start or end time is within the next 24 hours
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const twentyFourHoursFromNow = Date.now() + twentyFourHours;
      const filteredPosts = postsToFilter.filter(
        (post) => (post.start <= twentyFourHoursFromNow || post.end <= twentyFourHoursFromNow),
      );
      return filteredPosts;
    }
    if (selectedIndex === 3) {
      // return posts whose start or end time is within the next 7 days
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const sevenDaysFromNow = Date.now() + sevenDays;
      const filteredPosts = postsToFilter.filter(
        (post) => (post.start <= sevenDaysFromNow || post.end <= sevenDaysFromNow),
      );
      return filteredPosts;
    }
    return postsToFilter;
  };

  const applyFilter = useCallback((postsToFilter) => {
    let filteredPosts = [];
    for (const post of postsToFilter) {
      if (filters.includes(post.category) || filters.length === 0) {
        filteredPosts.push(post);
      }
    }
    filteredPosts = applyTimeFilter(filteredPosts);
    return (filteredPosts);
  }, [filters, selectedIndex]);

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

  useEffect(() => {
    setAllPosts(global.upcomingUnarchivedPosts);
    setPosts(global.upcomingUnarchivedPosts);
    createMarkers(global.upcomingUnarchivedPosts);
  }, []);

  useEffect(() => {
    if (mounted.current === true && allPosts.length > 0) {
      const filteredPosts = applyFilter(allPosts);
      setPosts(filteredPosts);
      createMarkers(filteredPosts);
    }
  }, [filters, selectedIndex]);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <View style={globalStyles.container}>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>

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
      <ButtonGroup
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
      >
        {
          markers.map((marker, index) => (
            <MapView.Marker
              tracksViewChanges={false}
              key={marker.id}
              coordinate={marker.latlng}
              onPress={() => navigation.navigate('View Full Post', { post: posts[index] })}
            >
              <View>
                {marker.category === 'food' ? food(12) : null}
                {marker.category === 'performance' ? performance(14) : null}
                {marker.category === 'social' ? social(14) : null}
                {marker.category === 'academic' ? academic(14) : null}
                {marker.category === 'athletic' ? athletic(14) : null}

              </View>
            </MapView.Marker>

          ))
        }

      </MapView>

    </View>
  );
}
