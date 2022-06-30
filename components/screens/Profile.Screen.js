import React, { useState, useEffect } from 'react';
import {
  View, Text, useWindowDimensions, Alert,
} from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { TabView, TabBar } from 'react-native-tab-view';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import ProfilePostsComponent from './ProfilePosts.Component';
import { removeUser } from '../../helpers';

function FirstRoute({ navigation }) {
  return <ProfilePostsComponent type="starred" navigation={navigation} />;
}

function SecondRoute({ navigation }) {
  return <ProfilePostsComponent type="ownPosts" navigation={navigation} />;
}

function ThirdRoute({ navigation }) {
  return <ProfilePostsComponent type="archive" navigation={navigation} />;
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

export default function ProfileScreen({ navigation }) {
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

  const renderScene = ({ route }) => {
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

  const renderTabBar = (props) => (
    <TabBar
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      indicatorStyle={{ backgroundColor: 'black' }}
      style={{ backgroundColor: 'white' }}
      renderLabel={({ route }) => (
        <Text style={globalStyles.text}>
          {route.title}
        </Text>
      )}
    />
  );

  const removeUserFromStorage = async () => {
    await removeUser();
  };

  const signOut = () => {
    removeUserFromStorage();
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
    <View style={globalStyles.container}>

      <View style={{ flexDirection: 'row', margin: 20 }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Icon
            name="edit"
            onPress={() => navigation.navigate('Edit Profile')}
          />
        </View>
        <View>
          <Icon
            name="logout"
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
        <Text style={globalStyles.title}>{name}</Text>
        {year && year !== ''
          ? <Text style={globalStyles.text}>{year}</Text>
          : null}
        {year && year !== ''
          ? <Text style={globalStyles.text}>{major}</Text>
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

    </View>
  );
}

ProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
