import React from 'react';
import { Button, Alert } from 'react-native';
import firebase from 'firebase/compat/database';

export default function SettingsScreen() {
  const signOut = () => {
    Alert.alert(
      'Are you sure you want to sign out?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => firebase.auth().signOut() },
      ],
      { cancelable: true },
    );
  };

  return (
    <Button
      onPress={() => signOut()}
      title="Sign Out"
    />
  );
}
