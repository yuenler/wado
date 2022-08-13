import React, { useState, useEffect } from 'react';
import {
  View, Text, useWindowDimensions, Alert,
} from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { TabView, TabBar } from 'react-native-tab-view';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import PropTypes from 'prop-types';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import ProfilePostsComponent from './ProfilePosts.Component';

function FirstRoute(
  { navigation } :{navigation: any},
) {
  return (
    <ProfilePostsComponent
      type="starred"
      navigation={navigation}
    />
  );
}

function SecondRoute(
  { navigation }:{navigation: any},
) {
  return (
    <ProfilePostsComponent
      type="ownPosts"
      navigation={navigation}
    />
  );
}

function ThirdRoute(
  { navigation }:{navigation: any},
) {
  return (
    <ProfilePostsComponent
      type="archive"
      navigation={navigation}
    />
  );
}

FirstRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

SecondRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

ThirdRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default function ProfileScreen({ navigation } : {navigation: any, }) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'starred', title: 'Starred' },
    { key: 'ownPosts', title: 'Your Posts' },
    { key: 'archive', title: 'Archive' },
  ]);

  const renderScene = ({ route } : {route: any}) => {
    switch (route.key) {
      case 'starred':
        return <FirstRoute navigation={navigation} />;
      case 'ownPosts':
        return <SecondRoute navigation={navigation} />;
      case 'archive':
        return <ThirdRoute navigation={navigation} />;
      default:
        return null;
    }
  };

  const getData = async () => {
    setPhoto(global.user.photoURL);
    setName(global.user.displayName);

    firebase.database().ref(`users/${global.user.uid}`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMajor(data.major);
        setYear(data.year);
      }
    });
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#a76af7' }}
      style={{ backgroundColor: 'white' }}
      renderLabel={({ route }) => (
        <Text style={styles.text}>
          {route.title}
        </Text>
      )}
    />
  );

  const signOut = () => {
    firebase.auth().signOut()
      .then(() => {
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const signOutConfirmation = () => {
    Alert.alert(
      '',
      'Are you sure you want to sign out?',

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

  useEffect(() => {
    getData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      <View style={{ flexDirection: 'row', margin: 20 }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Icon
            name="edit"
            color='#a76af7'
            reverse
            onPress={() => navigation.navigate('Edit Profile')}
          />
        </View>
        <View>
          <Icon
            name="logout"
            color='#a76af7'
            reverse
            onPress={() => signOutConfirmation()}
          />
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        {photo !== ''
          ? (
            <Avatar
              size="large"
              rounded
              source={{
                uri:
                  photo,
              }}
            />
          ) : null}
          <View style={{
            backgroundColor: '#a76af7', padding: 10, borderRadius: 10, marginTop: 10,
          }}>
        <Text style={[styles.title, { color: 'white' }]}>{name}</Text>
        </View>
        {year && year !== ''
          ? <Text style={styles.text}>{year}</Text>
          : null}
        {year && year !== ''
          ? <Text style={styles.text}>{major}</Text>
          : null}

      </View>

      <TabView
        renderTabBar={renderTabBar}
        style={{ marginTop: 20 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

    </SafeAreaView>
  );
}

ProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

FirstRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

SecondRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

ThirdRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
