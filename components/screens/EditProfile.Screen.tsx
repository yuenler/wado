/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Button } from '@rneui/base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Input,
  Dialog,
  CheckBox,
  ListItem,
} from '@rneui/themed';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import PropTypes from 'prop-types';
import { TouchableHighlight } from 'react-native-gesture-handler';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import { storeData, getData } from '../../helpers';

export default function EditProfileScreen({ navigation } : {navigation: any}) {
  const { colors, isDark } = useTheme();
  const styles = globalStyles(colors);

  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [checked, setChecked] = useState('device');
  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const themeValues = ['device', 'light', 'dark'];

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

  const getCurrentTheme = async () => {
    setChecked(await getData('@colorScheme'));
  };

  useEffect(() => {
    getCurrentTheme();
    getProfileInfo();
  }, []);

  const changeTheme = (theme: string) => {
    storeData('@colorScheme', theme);
  };

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <View style={{ margin: '10%' }}>
        <Input
          labelStyle={{ color: colors.text }}
          inputStyle={styles.text}
          label="College/University"
          multiline
          value="Harvard University"
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
        />
        <Input
          labelStyle={{ color: colors.text }}
          inputStyle={styles.text}
          label="Major/Concentration"
          placeholder="Computer Science"
          onChangeText={(value) => setMajor(value)}
          value={major}
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
        />
        <Input
          labelStyle={{ color: colors.text }}
          inputStyle={styles.text}
          label="Year"
          placeholder="Freshman"
          onChangeText={(value) => setYear(value)}
          value={year}
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
        />
        <Button
          title="Save"
          onPress={() => saveData()}
          color="#a76af7"
        />

      <TouchableHighlight style={{ marginTop: 20 }} onPress={() => { setVisible(true); }}
      >
        <ListItem
        containerStyle={{ backgroundColor: colors.middleBackground }}
        >
          <ListItem.Content>
        <View>
        <ListItem.Title style={styles.boldText}>
                 {`Current Theme: ${checked === 'device' ? 'Device default' : checked === 'light' ? 'Light Theme' : 'Dark Theme'}`}
        </ListItem.Title>
        </View>
        <View>
        <ListItem.Subtitle style={styles.text}>
          Click to change the theme of the app.
          You might need to reload the app to see theme changes.
        </ListItem.Subtitle>
        </View>
        </ListItem.Content>
        </ListItem>
        </TouchableHighlight>

  <Dialog
      isVisible={visible}
      onBackdropPress={toggleDialog}
      overlayStyle={{ backgroundColor: colors.background }}
    >
      <Dialog.Title title="Select Theme" titleStyle={{ color: colors.text }}/>
      {['Device default', 'Light theme', 'Dark theme'].map((l, i) => (
        <CheckBox
          key={i}
          title={l}
          containerStyle={{ backgroundColor: colors.background, borderWidth: 0 }}
          textStyle={{ color: colors.text }}
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={checked === themeValues[i]}
          onPress={() => setChecked(themeValues[i])}
          checkedColor="#a76af7"
        />
      ))}

      <Dialog.Actions>
        <Button
          title="Confirm"
          type='clear'
          onPress={() => {
            changeTheme(checked);
            toggleDialog();
          }}
          titleStyle={{ color: '#a76af7' }}
        />
        <Button type='clear' title="Cancel" onPress={toggleDialog} titleStyle={{ color: '#a76af7' }} />
      </Dialog.Actions>
    </Dialog>

      </View>
    </KeyboardAwareScrollView>

  );
}

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};
