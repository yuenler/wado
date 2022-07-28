/* eslint-disable global-require */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet, View, Platform, StatusBar, Alert,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import LoadDataScreen from './components/screens/LoadData.Screen';
import { storeData } from './helpers';
import Updates from 'expo-updates';
import ApiKeys from './ApiKeys';
import registerForPushNotificationsAsync from './registerForPushNotificationsAsync';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedForUpdates, setCheckedForUpdates] = useState(false);
  // const [preAuthenticated, setPreAuthenticated] = useState(false);

  const onAuthStateChanged = (user: any) => {
    setIsAuthenticationReady(true);
    setIsAuthenticated(!!user);

    if (user) {
      const idxHarvard = user.email.indexOf('harvard.edu');
      if (idxHarvard === -1 && user.email !== 'theofficialbhsapptesting@gmail.com') {
        Alert.alert(
          'Please sign in using your school email address!',
          '',
          [
            { text: 'Ok', onPress: () => firebase.auth().signOut() },
          ],
          { cancelable: false },
        );
      } else {
        storeData('@user', user);
        firebase.database().ref(`/users/${user.uid}`).set({
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
        });
        registerForPushNotificationsAsync().then((pushNotificationToken) => firebase.database().ref(`/users/${user.uid}`).update({
          pushNotificationToken,
        }));
      }
    }
  };

  
  if (!firebase.apps.length) { firebase.initializeApp(ApiKeys.FirebaseConfig); }
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
  

  const loadFonts = async() => {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      Montserrat: require('./assets/Montserrat-Regular.ttf'),
      MontserratBold: require('./assets/Montserrat-Bold.ttf'),
    });
    setIsLoadingComplete(true);
  }

  // const checkIfAuthenticated = async () => {
  //   if (await getData('@user') !== null) {
  //     setPreAuthenticated(true);
  //   }
  // }

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Alert.alert('There is an update available!', 'Wado is restarting to apply this update.');
        Updates.reloadAsync();
      }
    } catch (e) {
      // handle or log error
    }
    setCheckedForUpdates(true);
  }

  useEffect(() => {
    checkForUpdates();
    // checkIfAuthenticated();
    loadFonts();
  }, [])

    if (!isLoadingComplete || !(isAuthenticationReady || isAuthenticated) || !checkedForUpdates) {
      return (
        null
      );
    }
    return (
      <NavigationContainer>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          {(isAuthenticated) ? <LoadDataScreen /> : <NotLoggedInNavigator />}
        </View>
      </NavigationContainer>

    );
  
}
