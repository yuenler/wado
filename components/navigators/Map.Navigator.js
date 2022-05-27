import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../screens/Map.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';

const Stack = createStackNavigator();

export default function MapNavigator() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        component={MapScreen}
        initialParams={{ longitude: {}, latitude: {} }}
        name="Map"
        options={{ headerShown: false }}
      />

      <Stack.Screen component={ViewFullPostScreen} name="View Full Post" />

    </Stack.Navigator>
  );
}
