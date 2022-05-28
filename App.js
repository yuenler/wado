/* eslint-disable global-require */
import React from 'react';
import {
  StyleSheet, View, Platform, StatusBar, Alert,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import AppNavigator from './components/navigators/App.Navigator';
import { getUser, storeUser } from './helpers';
import ApiKeys from './ApiKeys';

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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingComplete: false,
      isAuthenticationReady: false,
      isAuthenticated: false,
    };

    if (!firebase.apps.length) { firebase.initializeApp(ApiKeys.FirebaseConfig); }
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

  componentDidMount() {
    this.checkIfAuthenticated();
    this.loadFonts();
  }

  onAuthStateChanged = (user) => {
    this.setState({ isAuthenticationReady: true });
    this.setState({ isAuthenticated: !!user });

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
        storeUser(user);
        firebase.database().ref(`/users/${user.uid}`).set({
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
        });
      }
    }
  };

  async loadFonts() {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      Montserrat: require('./assets/Montserrat-Regular.ttf'),
      MontserratBold: require('./assets/Montserrat-Bold.ttf'),
    });
    this.setState({ isLoadingComplete: true });
  }

  async checkIfAuthenticated() {
    if (await getUser() !== null) {
      this.setState({ isAuthenticated: true });
    }
  }

  render() {
    const { isLoadingComplete, isAuthenticated, isAuthenticationReady } = this.state;
    if ((!isLoadingComplete || !isAuthenticationReady) && !isAuthenticated) {
      return (
        null
      );
    }
    return (
      <NavigationContainer>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          {(isAuthenticated) ? <AppNavigator /> : <NotLoggedInNavigator />}
        </View>
      </NavigationContainer>
    );
  }
}
