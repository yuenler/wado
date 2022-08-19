/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  View, Image, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import { loadCachedPosts } from '../../helpers';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import AppNavigator from '../navigators/App.Navigator';
import 'firebase/compat/database';

global.posts = [];
// set default location to be Harvard Square
global.latitude = 42.3743935;
global.longitude = -71.1184378;

export default function LoadDataScreen() {
  const { colors } = useTheme();
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
      global.latitude = location.coords.latitude;
      global.longitude = location.coords.longitude;
      // save users location to firebase
      try {
        firebase.database().ref(`users/${global.user.uid}`).update({
          location: {
            latitude: global.latitude,
            longitude: global.longitude,
          },
        });
      } catch (error) {
        // do nothing
      }
      setGotLocation(true);
    })();
  }, []);

  useEffect(() => {
    loadCachedPosts().then(() => {
      setLoaded(true);
    });
  }, []);

  if (gotLocation && loaded) {
    return <AppNavigator />;
  }
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.purple }]}>
      <Image source={require('../../assets/icon.png')} style={{ width: 150, height: 150 }}/>
      <View style={{ marginTop: 10 }}>
        <ActivityIndicator size="large" color='white' />
        </View>
    </View>
  );
}
