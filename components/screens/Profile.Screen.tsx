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
import Toast from 'react-native-toast-message';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
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
  const {
    colors, house, year, user, setHouse, setYear,
  } = useTheme();
  const styles = globalStyles(colors);

  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');

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
    setPhoto(user.photoURL);
    setName(user.displayName);
    if (house && year) {
      // capitalize house
      setHouse(house.charAt(0).toUpperCase() + house.slice(1));
      setYear(year);
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.purple }}
      style={{ backgroundColor: colors.background }}
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
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error signing out',
        });
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
            color={colors.purple}
            reverse
            onPress={() => navigation.navigate('Edit Profile')}
          />
        </View>
        <View>
          <Icon
            name="logout"
            color={colors.purple}
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

        <Text style={[styles.title]}>{name}</Text>
        {year && year !== ''
          ? <Text style={styles.text}>Class of {year}</Text>
          : null}
        {year && year !== ''
          ? <Text style={styles.text}>{house}</Text>
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
