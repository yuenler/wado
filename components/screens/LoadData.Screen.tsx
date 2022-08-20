/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  View, Image, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import { loadCachedPosts } from '../../helpers';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import AppNavigator from '../navigators/App.Navigator';
import 'firebase/compat/database';

export default function LoadDataScreen() {
  const {
    colors, setAllPosts, house, year, user, setUserLatitude, setUserLongitude,
  } = useTheme();
  const styles = globalStyles(colors);

  const [loaded, setLoaded] = useState(false);
  const [gotLocation, setGotLocation] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGotLocation(true);
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLatitude(location.coords.latitude);
      setUserLongitude(location.coords.longitude);
      // save users location to firebase
      try {
        firebase.database().ref(`users/${user.uid}`).update({
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        });
      } catch (error) {
        // do nothing
      }
      setGotLocation(true);
    })();
  }, []);

  useEffect(() => {
    loadCachedPosts(house, year, user).then((posts) => {
      setAllPosts(posts);
      setLoaded(true);
    });
  }, []);

  if (gotLocation && loaded) {
    return <AppNavigator />;
  }
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.purple }]}>
      <Image source={require('../../assets/iconTransparent.png')} style={{ width: 150, height: 150 }}/>
      <View style={{ marginTop: 10 }}>
        <ActivityIndicator size="large" color='white' />
        </View>
    </View>
  );
}
