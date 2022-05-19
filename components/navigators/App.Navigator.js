import React from 'react';
import AnnouncementsNavigator from './Announcements.Navigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MapScreen from '../screens/Map.Screen';


const Tabs = createBottomTabNavigator();

export default class AppNavigator extends React.Component {

  render() {

    return (
  
      <Tabs.Navigator>
      <Tabs.Screen name="Map" component={MapScreen} />
      <Tabs.Screen name="Announcements" component={AnnouncementsNavigator} />
      </Tabs.Navigator>


    )
  }
}