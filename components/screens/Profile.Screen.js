import React from 'react';
import { View, Text } from 'react-native';
// import firebase from 'firebase/compat/database';
import globalStyles from '../GlobalStyles';

export default function ProfileScreen() {
  return (
    <View style={globalStyles.container}>
      <Text>
        Profile picture, list of posts they have attended, they archived, and will attend.
      </Text>
    </View>
  );
}
