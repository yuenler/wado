import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@rneui/base';
import { Input } from '@rneui/themed';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';

export default function EditProfileScreen({ navigation }) {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  const saveData = async () => {
    firebase.database().ref(`users/${global.user.uid}`).update({
      major,
      year,
    });
    navigation.goBack();
  };

  const getProfileInfo = async () => {
    firebase.database().ref(`users/${global.user.uid}`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMajor(data.major);
        setYear(data.year);
      }
    });
  };

  useEffect(() => {
    getProfileInfo();
  }, []);

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ margin: '10%' }}>
        <Input
          label="College/University"
          multiline
          value="Harvard University"
        />
        <Input
          label="Major/Concentration"
          placeholder="Computer Science"
          onChangeText={(value) => setMajor(value)}
          value={major}
        />
        <Input
          label="Year"
          placeholder="Freshman"
          onChangeText={(value) => setYear(value)}
          value={year}
        />
        <Button
          title="Save"
          onPress={() => saveData()}
        />
      </View>
    </ScrollView>

  );
}

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};
