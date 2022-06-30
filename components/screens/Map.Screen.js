import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import MapView from 'react-native-maps';
import {
  StyleSheet, View, Dimensions, Text,
} from 'react-native';
import { Button } from '@rneui/base';
import { ButtonGroup } from '@rneui/themed';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic, getIcon,
} from '../icons';
import { determineDatetime } from '../../helpers';

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

const colors = ['green', 'blue', 'red'];

export default function MapScreen({ navigation }) {
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
        post: p[i],
        latlng: { latitude: p[i].latitude, longitude: p[i].longitude },
      });
    }
    setMarkers(m);
  };

  const applyFilter = useCallback((postsToFilter) => {
    const applyTimeFilter = (morePostsToFilter) => {
      if (selectedIndex === 1) {
        // return posts whose start or end time is within the next 5 hours
        const fiveHours = 5 * 60 * 60 * 1000;
        const fiveHoursFromNow = Date.now() + fiveHours;
        const filteredPosts = morePostsToFilter.filter(
          (post) => (post.start <= fiveHoursFromNow || post.end <= fiveHoursFromNow),
        );
        return filteredPosts;
      }
      if (selectedIndex === 2) {
        // return posts whose start or end time is within the next 24 hours
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const twentyFourHoursFromNow = Date.now() + twentyFourHours;
        const filteredPosts = morePostsToFilter.filter(
          (post) => (post.start <= twentyFourHoursFromNow || post.end <= twentyFourHoursFromNow),
        );
        return filteredPosts;
      }
      if (selectedIndex === 3) {
        // return posts whose start or end time is within the next 7 days
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const sevenDaysFromNow = Date.now() + sevenDays;
        const filteredPosts = morePostsToFilter.filter(
          (post) => (post.start <= sevenDaysFromNow || post.end <= sevenDaysFromNow),
        );
        return filteredPosts;
      }
      return morePostsToFilter;
    };
    let filteredPosts = [];
    postsToFilter.forEach((post) => {
      if (filters.includes(post.category) || filters.length === 0) {
        filteredPosts.push(post);
      }
    });
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
    createMarkers(global.upcomingUnarchivedPosts);
  }, []);

  useEffect(() => {
    if (mounted.current === true && allPosts.length > 0) {
      const filteredPosts = applyFilter(allPosts);
      createMarkers(filteredPosts);
    }
  }, [allPosts, applyFilter, filters, selectedIndex]);

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
          markers.map((marker) => {
            const datetimeStatus = determineDatetime(marker.post.start, marker.post.end);
            return (
              <MapView.Marker
                tracksViewChanges={false}
                key={marker.post.id}
                coordinate={marker.latlng}
              >
                <View>
                  {marker.post.category === 'food' ? food(12) : null}
                  {marker.post.category === 'performance' ? performance(14) : null}
                  {marker.post.category === 'social' ? social(14) : null}
                  {marker.post.category === 'academic' ? academic(14) : null}
                  {marker.post.category === 'athletic' ? athletic(14) : null}

                </View>
                <MapView.Callout
                  onPress={() => navigation.navigate('View Full Post', { post: marker.post })}
                >
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={[globalStyles.text, { textAlign: 'center' }]}>{marker.post.title}</Text>
                    <Text style={[globalStyles.smallText, { textAlign: 'center', color: colors[datetimeStatus.startStatus] }]}>{datetimeStatus.datetime}</Text>
                  </View>
                </MapView.Callout>
              </MapView.Marker>
            );
          })
        }

      </MapView>

    </View>
  );
}

MapScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
