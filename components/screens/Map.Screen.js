/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  StyleSheet, View, Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import { globalStyles } from '../GlobalStyles';
import 'firebase/compat/database';

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
        title: p[i].title,
        description: p[i].post,
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

    firebase.database().ref('Posts')
      .orderByChild('end')
      .startAt(new Date().getTime())
      .once('value', (snapshot) => {
        const allPosts = [];
        snapshot.forEach((childSnapshot) => {
          allPosts.push(childSnapshot.val());
        });
        setPosts(allPosts);
        createMarkers(posts);
      });
  }, [posts]);

  return (
    <View style={globalStyles.container}>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0052,
          longitudeDelta: 0.0052,
        }}

      >
        {
          markers.map((marker, index) => (
            <Marker
              key={marker.latlng}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              onPress={() => navigation.navigate('View Full Post', { post: posts[index] })}
            />

          ))
        }

      </MapView>

    </View>
  );
}
