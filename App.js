import React from 'react';
import { StyleSheet, View, Platform, StatusBar, Alert } from 'react-native';
import ApiKeys from './ApiKeys';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './components/navigators/App.Navigator';
import { set } from './components/User';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
      user: null
    };

    if (!firebase.apps.length) { firebase.initializeApp(ApiKeys.FirebaseConfig); }
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);
  }

 
  onAuthStateChanged = (user) => {
    this.setState({ isAuthenticationReady: true });
    this.setState({ isAuthenticated: !!user });
    this.setState({ user });

    if (user) {
      var idxHarvard = user.email.indexOf('harvard.edu');
        if (idxHarvard == -1 && user.email != "theofficialbhsapptesting@gmail.com") {
          Alert.alert(
            "Please sign in using your school email address!",
            "",
            [
              { text: "Ok", onPress: () => firebase.auth().signOut()}
            ],
            { cancelable: false }
            );
        }
    }
  }

  async loadFonts() {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      Montserrat: require('./assets/Montserrat-Regular.ttf'),
    });
    this.setState({ isLoadingComplete: true });
  }

  
  componentDidMount() {
    this.loadFonts();
  }

  storeUser = async (value) => {
    try {
      await AsyncStorage.setItem('@user', value.displayName)
    } catch (e) {
      console.log(e)
    }
  }



  render() {
    if ((!this.state.isLoadingComplete || !this.state.isAuthenticationReady) && !this.props.skipLoadingScreen) {
      return (
        null
      );
    } else {
      this.storeUser(this.state.user);
      return (
        <NavigationContainer>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
            {(this.state.isAuthenticated) ? <AppNavigator /> : <NotLoggedInNavigator/>}
          </View>
        </NavigationContainer>
      );
    }
  }
}