/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import {
  StyleSheet, View, Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic,
} from '../icons';

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default function MapScreen({ navigation }) {
  // set default location to be Harvard Square
  const [latitude, setLatitude] = useState(42.3743935);
  const [longitude, setLongitude] = useState(-71.1184378);
  const [posts, setPosts] = useState([]);
  const [markers, setMarkers] = useState([]);
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

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLongitude(location.coords.longitude);
      setLatitude(location.coords.latitude);
    })();
  }, []);

  useEffect(() => {
    setPosts(global.upcomingUnarchivedPosts);
    createMarkers(global.upcomingUnarchivedPosts);
  }, []);

  return (
    <View style={globalStyles.container}>
      <MapView
        style={styles.map}
        provider="google"
        region={{
          latitude,
          longitude,
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
