import React, { useState, useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import * as Location from 'expo-location';

import { loadCachedPosts } from '../../helpers';
import globalStyles from '../GlobalStyles';
import AppNavigator from '../navigators/App.Navigator';
import { Post } from '../../types/Post';

declare global {
  var user: any;
  var posts: Post[];
  var archivedPosts: Post[];
  var archive: Post[];
  var starred: Post[];
  var ownPosts: Post[];
  var latitude: number;
  var longitude: number;
}

global.user = {};

global.posts = [];

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
    <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#a76af7' }]}>
      <Image source={require('../../assets/icon.png')} style={{width: 100, height: 100}}/>
      <Text style={[globalStyles.text, {color: 'white'}]}>Loading data...</Text>
    </View>
  );
}