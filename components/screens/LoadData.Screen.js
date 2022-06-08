/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import * as Location from 'expo-location';

import { loadCachedPosts } from '../../helpers';
import globalStyles from '../GlobalStyles';
import AppNavigator from '../navigators/App.Navigator';

global.user = {};

global.posts = [];
global.upcomingPosts = [];
global.upcomingUnarchivedPosts = [];

global.archive = [];
global.starred = [];
global.ownPosts = [];
// set default location to be Harvard Square
global.latitude = 42.3743935;
global.longitude = -71.1184378;

export default function LoadDataScreen() {
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
    <View style={globalStyles.container}>
      <Text>Loading...</Text>
    </View>
  );
}
