import React from 'react';
import AnnouncementsNavigator from './Announcements.Navigator';


export default class AppNavigator extends React.Component {

  render() {

    return (
  
      <Stack.Navigator>
      <Stack.Screen name="Announcements" component={AnnouncementsNavigator} />
      </Stack.Navigator>


    )
  }
}