/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import {
  View, Alert, Appearance, TouchableOpacity,
} from 'react-native';
import { Button } from '@rneui/base';
import {
  Dialog,
  CheckBox,
  ListItem,
} from '@rneui/themed';
import Toast from 'react-native-toast-message';
import PropTypes from 'prop-types';
import { TouchableHighlight } from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import { storeData, getData } from '../../helpers';

export default function EditProfileScreen({ navigation } : {navigation: any}) {
  const {
    colors, isDark, setScheme, year, house, setYear, setHouse,
  } = useTheme();
  const styles = globalStyles(colors);

  const [checked, setChecked] = useState('device');
  const [visible, setVisible] = useState(false);
  const toggleDialog = () => {
    setVisible(!visible);
  };

  const themeValues = ['device', 'light', 'dark'];

  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState(year);
  const [itemsCategory, setItemsCategory] = useState([

    {
      label: 'N/A',
      value: 'n/a',
    },
    {
      label: '2023',
      value: '2023',
    },
    {
      label: '2024',
      value: '2024',

    },
    {
      label: '2025',
      value: '2025',
    },

    {
      label: '2026',
      value: '2026',
    },

  ]);

  const [openHouseCategory, setOpenHouseCategory] = useState(false);
  const [houseValueCategory, setHouseValueCategory] = useState(house);
  const [houseItemsCategory, setHouseItemsCategory] = useState([
    {
      label: 'N/A',
      value: 'n/a',
    },
    {
      label: 'Adams',
      value: 'adams',
    },
    {
      label: 'Cabot',
      value: 'cabot',
    },
    {
      label: 'Currier',
      value: 'currier',
    },
    {
      label: 'Dunster',
      value: 'dunster',
    },
    {
      label: 'Eliot',
      value: 'eliot',
    },
    {
      label: 'Kirkland',
      value: 'kirkland',
    },
    {
      label: 'Leverett',
      value: 'leverett',
    },
    {
      label: 'Lowell',
      value: 'lowell',
    },
    {
      label: 'Mather',
      value: 'mather',
    },
    {
      label: 'Pforzheimer',
      value: 'pforzheimer',
    },
    {
      label: 'Quincy',
      value: 'quincy',
    },
    {
      label: 'Winthrop',
      value: 'winthrop',
    },
    {
      label: 'Yard',
      value: 'yard',
    },

  ]);

  const saveData = async () => {
    if (houseValueCategory && valueCategory) {
      storeData('@house', houseValueCategory);
      storeData('@year', valueCategory);
      setHouse(houseValueCategory);
      setYear(valueCategory);
      Toast.show({
        type: 'success',
        text1: 'Profile saved!',
      });
      // wait 1 sec then go back
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } else {
      Alert.alert('Please select a house and year');
    }
  };

  const getCurrentTheme = async () => {
    setChecked(await getData('@colorScheme'));
  };

  useEffect(() => {
    getCurrentTheme();
  }, []);

  const changeTheme = (theme: string) => {
    storeData('@colorScheme', theme);
    if (theme === 'device') {
      const colorScheme = Appearance.getColorScheme();
      if (colorScheme === 'light') {
        setScheme('light');
      } else {
        setScheme('dark');
      }
    } else {
      setScheme(theme);
    }
  };

  return (
    <TouchableOpacity style={styles.container}
    activeOpacity={1}
        onPress={() => { setOpenCategory(false); setOpenHouseCategory(false); }}>
      <View style={{ margin: '10%' }}

        >
        <DropDownPicker
              textStyle={styles.text}
              containerStyle={{
                marginTop: '10%',
              }}
              theme={isDark ? 'DARK' : 'LIGHT'}
              open={openCategory}
              value={valueCategory}
              items={itemsCategory}
              setOpen={(open) => {
                setOpenCategory(open);
                setOpenHouseCategory(false);
              }}
              setValue={setValueCategory}
              setItems={setItemsCategory}
              placeholder="Graduation Year"
            />

        <View>
        {!openCategory
          ? <DropDownPicker
              textStyle={styles.text}
              containerStyle={{
                marginTop: '10%',
              }}
              theme={isDark ? 'DARK' : 'LIGHT'}
              open={openHouseCategory}
              value={houseValueCategory}
              items={houseItemsCategory}
              setOpen={(open) => {
                setOpenHouseCategory(open);
                setOpenCategory(false);
              }}
              setValue={setHouseValueCategory}
              setItems={setHouseItemsCategory}
              placeholder="House"
            />
          : <View style={{ height: 83 }}/>
          }
            <View style={{ marginTop: '10%' }}>
        <Button
          title="Save"
          onPress={() => saveData()}
          color={colors.purple}
        />
        </View>
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
        </ListItem.Subtitle>
        </View>
        </ListItem.Content>
        </ListItem>
        </TouchableHighlight>
            </View>

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
          checkedColor={colors.purple}
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
          titleStyle={{ color: colors.purple }}
        />
        <Button type='clear' title="Cancel" onPress={toggleDialog} titleStyle={{ color: colors.purple }} />
      </Dialog.Actions>
    </Dialog>

      </View>
    </TouchableOpacity>

  );
}

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};
