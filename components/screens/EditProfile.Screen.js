/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Button } from '@rneui/base';
import { Input, Icon } from 'react-native-elements';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import globalStyles from '../GlobalStyles';

export default function EditProfileScreen({ navigation }) {
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  return (
    <ScrollView style={globalStyles.container}>
      <View style={{ margin: '10%' }}>
        <Input
          label="College/University"
          placeholder="Harvard University"
          multiline
          // style={styles.textInput}
          value="Harvard University"
          disabled
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
        />
      </View>
    </ScrollView>

  );
}
