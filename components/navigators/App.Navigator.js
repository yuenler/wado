import React from 'react';
import AnnouncementsNavigator from './Announcements.Navigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import MapScreen from '../screens/Map.Screen';


const Tabs = createBottomTabNavigator();

export default class AppNavigator extends React.Component {

  render() {

    return (
  
      <Tabs.Navigator
      
      screenOptions={({ route }) => ({
        tabBarIcon: ({color, size }) => {
          let iconName;

          if (route.name === 'Map') {
            iconName = 'map';
          }
          else if (route.name === 'Announcements') {
            iconName = 'list';
          }

          // You can return any component that you like here!
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}
      
      >
        
      <Tabs.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Announcements" component={AnnouncementsNavigator} options={{ headerShown: false }}/>
      </Tabs.Navigator>


    )
  }
}