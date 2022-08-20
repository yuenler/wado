import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../screens/Map.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';
import MapPreviewScreen from '../screens/MapPreview.Screen';
import { useTheme } from '../../Context';

const Stack = createStackNavigator();

export default function MapNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator>

      <Stack.Screen
        component={MapScreen}
        initialParams={{ longitude: {}, latitude: {} }}
        name="Map"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        component={ViewFullPostScreen}
        name="View Full Post"
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

      <Stack.Screen
        component={MapPreviewScreen}
        name="Map Preview"
        options={({ route }) => ({
          title: route.params.postalAddress,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        })}
      />

    </Stack.Navigator>
  );
}
