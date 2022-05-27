/* eslint-disable global-require */
import React, { useState } from 'react';
import {
  StyleSheet, Text, Image, View, Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Button } from 'react-native-elements';
import { ListItem, Avatar } from '@rneui/themed';
import TouchableScale from 'react-native-touchable-scale';
import LinearGradient from 'react-native-linear-gradient';
import globalStyles from '../GlobalStyles';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 60,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ededed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#000000',
  },
  titleContainer: {
    marginHorizontal: 10,
    marginBottom: 80,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  imageContainer: {
    margin: 0,
  },
});

export default function LoginScreen() {
  const [school, setSchool] = useState('');
  const [response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '59659678787-11cvfekeiqnseceuajghocogcjsqtvlm.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { idToken } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <View style={globalStyles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>WELCOME TO THE SCHOOL APP WITH NO NAME YET</Text>
      </View>

      {!school
        ? (
          <View>
            <Text>What school do you go to?</Text>
            <ListItem
              Component={TouchableScale}
              friction={90} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.95} //
              linearGradientProps={{
                colors: ['#FF9800', '#F44336'],
                start: { x: 1, y: 0 },
                end: { x: 0.2, y: 0 },
              }}
              ViewComponent={LinearGradient}
              onPress={() => setSchool('Harvard')}
            >
              <Avatar rounded source={require('../../assets/Harvard-symbol.jpg')} />
              <ListItem.Content>
                <ListItem.Title style={{ color: 'white', fontWeight: 'bold' }}>
                  Harvard University
                </ListItem.Title>
                {/* <ListItem.Subtitle style={{ color: 'white' }}>
                Vice Chairman
              </ListItem.Subtitle> */}
              </ListItem.Content>
              <ListItem.Chevron color="white" />
            </ListItem>

            <ListItem
              Component={TouchableScale}
              friction={90} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.95} //
              linearGradientProps={{
                colors: ['#FF9800', '#F44336'],
                start: { x: 1, y: 0 },
                end: { x: 0.2, y: 0 },
              }}
              ViewComponent={LinearGradient}
              onPress={() => Alert.alert('This is app is currently only available for Harvard Students. Please email yuenlerchow@college.harvard.edu about your interest for this app at your school.')}
            >
              {/* <Avatar rounded source={require('../../assets/Harvard-symbol.jpg')} /> */}
              <ListItem.Content>
                <ListItem.Title style={{ color: 'white', fontWeight: 'bold' }}>
                  Other
                </ListItem.Title>
                {/* <ListItem.Subtitle style={{ color: 'white' }}>
                Vice Chairman
              </ListItem.Subtitle> */}
              </ListItem.Content>
              <ListItem.Chevron color="white" />
            </ListItem>
          </View>
        )
        : (
          <View style={{ flex: 1 }}>
            <Button
              onPress={() => promptAsync()}
              style={styles.button}
              icon={<Image style={styles.tinyLogo} source={require('../../assets/google.jpg')} />}
              title={<Text style={styles.buttonText}>Sign in with Google</Text>}
            />
          </View>
        )}

    </View>
  );
}
