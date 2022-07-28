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
import { getData, storeData } from './helpers';
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

  const checkIfAuthenticated = async () => {
    if (await getData('@user') !== null) {
      setIsAuthenticated(true);
    }
  }

  useEffect(() => {
    checkIfAuthenticated();
    loadFonts();
  }, [])

    if (!isLoadingComplete || !(isAuthenticationReady || isAuthenticated)) {
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
