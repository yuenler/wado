/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';

import { loadCachedPosts } from '../../helpers';
import globalStyles from '../GlobalStyles';
import AppNavigator from '../navigators/App.Navigator';

global.user = {};
global.posts = [];
global.upcomingPosts = [];
global.upcomingUnarchivedPosts = [];

export default function LoadDataScreen() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCachedPosts().then(() => {
      setLoaded(true);
    });
  }, []);

  if (loaded) {
    return <AppNavigator />;
  }
  return (
    <View style={globalStyles.container}>
      <Text>Loading...</Text>
    </View>
  );
}
