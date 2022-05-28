/* eslint-disable react/prop-types */
import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { Button } from '@rneui/base';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import { removeUser } from '../../helpers';

export default function SettingsScreen({ navigation }) {
  const removeUserFromStorage = async () => {
    await removeUser();
  };

  const signOut = () => {
    removeUserFromStorage();
    firebase.auth().signOut()
      .then(() => {
        Alert.alert('Success', 'Signed out successfully');
        navigation.navigate('Login');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const signOutConfirmation = () => {
    Alert.alert(
      'Are you sure you want to sign out?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => signOut() },
      ],
      { cancelable: true },
    );
  };

  return (
    <ScrollView>
      <Button
        onPress={() => signOutConfirmation()}
        title="Sign Out"
      />
    </ScrollView>
  );
}
