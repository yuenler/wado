/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {
  View, Text, Alert, Platform, ActivityIndicator,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Input, Icon } from '@rneui/themed';
import { Button } from '@rneui/base';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Location from 'expo-location';
import PropTypes from 'prop-types';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import {
  formatTime, formatDate, determineDatetime,
} from '../../helpers';
import {
  Food, Performance, Social, Academic, Athletic,
} from '../icons';
import { Post, Category, LiveUserSpecificPost } from '../../types/Post';

const NUM_MILLISECONDS_IN_HALF_HOUR = 1.8e+6;
const NUM_MILLISECONDS_IN_ONE_HOUR = NUM_MILLISECONDS_IN_HALF_HOUR * 2;

const defaultStart = Math.ceil(
  (Date.now())
  / NUM_MILLISECONDS_IN_HALF_HOUR,
)
  * NUM_MILLISECONDS_IN_HALF_HOUR;
const defaultEnd = defaultStart + NUM_MILLISECONDS_IN_ONE_HOUR;
const defaultStartDate = formatDate(new Date(defaultStart));
const defaultEndDate = formatDate(new Date(defaultEnd));
const defaultStartTime = formatTime(new Date(defaultStart));
const defaultEndTime = formatTime(new Date(defaultEnd));

const interpretTime = (inputTime: string) => {
  let time = '';
  let ampm = '';

  inputTime.split('').forEach((char: any) => {
    if (!isNaN(char) && char !== ' ') {
      time += char;
    } else if (['A', 'P', 'M', 'a', 'p', 'm'].includes(char)) {
      ampm += char.toUpperCase();
    }
  });

  if (time.length === 3) {
    time = `0${time}`;
  }
  if (time.length === 4) {
    let hour = parseInt(time.slice(0, 2), 10);
    if (ampm === 'PM' && hour < 12) {
      hour += 12;
    }
    const minute = parseInt(time.slice(2, 4), 10);

    return [hour, minute];
  }
  return null;
};

export default function CreatePostScreen({ navigation, route }: {navigation: any, route: any}) {
  const { colors, isDark } = useTheme();

  const styles = globalStyles(colors);
  const [isSearching, setIsSearching] = useState(false);

  const [screen, setScreen] = useState(1);
  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState<Category>(Category.Social);
  const [itemsCategory, setItemsCategory] = useState([

    {
      label: 'Social (eg. parties, networking events, club meetings)',
      value: Category.Social,
      icon: () => <Social size={15} />,
    },

    {
      label: 'Performance (eg. concerts, musicals, standup comedy)',
      value: 'performance',
      icon: () => <Performance size={15} />,

    },
    {
      label: 'Food (eg. food in dining hall, food trucks)',
      value: 'food',
      icon: () => <Food size={15} />,
    },

    {
      label: 'Academic (eg. guest lectures, academic/career related clubs)',
      value: 'academic',
      icon: () => <Academic size={15} />,
    },
    {
      label: 'Athletic (eg. Football game, intramural activities)',
      value: 'athletic',
      icon: () => <Athletic size={15} />,
    },

  ]);

  const [openYearCategory, setOpenYearCategory] = useState(false);
  const [yearValueCategory, setYearValueCategory] = useState(['2023', '2024', '2025', '2026']);
  const [yearItemsCategory, setYearItemsCategory] = useState([

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
  const [houseValueCategory, setHouseValueCategory] = useState(
    ['adams', 'cabot', 'currier', 'dunster', 'eliot', 'kirkland', 'leverett', 'lowell', 'mather', 'pforzheimer', 'quincy', 'winthrop', 'yard'],
  );
  const [houseItemsCategory, setHouseItemsCategory] = useState([

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

  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [locationDescription, setLocationDescription] = useState('');
  const [link, setLink] = useState('');
  const [isStart, setIsStart] = useState(true);
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<'date'|'time'>('time');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(global.latitude);
  const [longitude, setLongitude] = useState<number>(global.longitude);
  const [postalAddress, setPostalAddress] = useState('');
  const [postID, setPostID] = useState(null);

  const addPostToUserProfile = (id: string, uid: string) => {
    firebase.database().ref(`users/${uid}/ownPosts/${id}`).set(true);
  };

  const storeText = async () => {
    // if this is editing an existing post, we set the data using the existing postID
    if (postID != null) {
      try {
        const post: Post = {
          author: global.user.displayName,
          authorID: global.user.uid,
          title,
          start,
          end,
          post: text,
          link,
          latitude,
          longitude,
          postalAddress,
          locationDescription,
          category: valueCategory,
          lastEditedTimestamp: Date.now(),
          targetedHouses: houseValueCategory,
          targetedYears: yearValueCategory,
        };
        firebase.database().ref(`Posts/${postID}`).update(post);
        Alert.alert('Your post has been successfully edited!');
      } catch (error) {
        Alert.alert('Error editing post');
      }
    } else {
      try {
        const myPost : Post = {
          author: global.user.displayName,
          authorID: global.user.uid,
          title,
          start,
          end,
          post: text,
          link,
          latitude: latitude + Math.random() * 0.0001 * (Math.random() < 0.5 ? -1 : 1),
          longitude: longitude + Math.random() * 0.0005 * (Math.random() < 0.5 ? -1 : 1),
          postalAddress,
          locationDescription,
          category: valueCategory,
          lastEditedTimestamp: Date.now(),
          targetedHouses: houseValueCategory,
          targetedYears: yearValueCategory,
        };
        const ref = await firebase
          .database()
          .ref('Posts')
          .push(myPost);
        if (ref.key) {
          addPostToUserProfile(ref.key, global.user.uid);
          const datetimeStatus = determineDatetime(myPost.start, myPost.end);
          const myPostForDisplay : LiveUserSpecificPost = {
            ...myPost,
            isStarred: false,
            isArchived: false,
            isOwnPost: true,
            datetimeStatus,
            id: ref.key,
          };
          // add post to global.posts
          global.posts.push(myPostForDisplay);
          global.posts.sort((a, b) => a.end - b.end);
        }

        Alert.alert('Your post has been successfully published!');
      } catch (e) {
        Alert.alert('Error publishing post');
      }
    }
  };

  function handlePost() {
    storeText();
    navigation.navigate('Posts');
  }

  function verifyFieldsFilled() {
    if (screen === 1) {
      if (valueCategory == null) {
        Alert.alert('Please select a category.');
      } else {
        setScreen(2);
      }
    } else if (screen === 2) {
      if (latitude == null || longitude == null) {
        Alert.alert('Please search for a location.');
      } else {
        setScreen(3);
      }
    } else if (screen === 3) {
      if (start == null || end == null) {
        Alert.alert('Please provide start and end dates/times for your post.');
      } else if (end < start) {
        Alert.alert('Please provide a start time that is after your end time.');
      } else if (end < Date.now()) {
        Alert.alert('Please provide end time that is in the future.');
      } else {
        setScreen(4);
      }
    } else if (screen === 4) {
      if (yearValueCategory.length > 0 && houseValueCategory.length > 0) {
        setScreen(5);
      } else {
        Alert.alert('Please select the years and houses your post is restricted to.');
      }
    } else if (screen === 5) {
      if (title === '') {
        Alert.alert('All posts need a title');
      } else if (locationDescription === '') {
        Alert.alert('Please describe where your post is located.');
      } else {
        Alert.alert(
          'Confirmation',
          'Press continue if you are sure.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            { text: 'Continue', onPress: () => handlePost() },
          ],
          { cancelable: false },
        );
      }
    } else {
      Alert.alert('Invalid screen');
    }
  }

  const formatStartDate = () => {
    const dateSplit = startDate.split('/');
    if (dateSplit.length === 3) {
      const s = new Date(start);
      s.setFullYear(parseInt(dateSplit[2], 10));
      s.setMonth(parseInt(dateSplit[0], 10) - 1);
      s.setDate(parseInt(dateSplit[1], 10));
      setStartDate(formatDate(s));
      setStart(s.getTime());
    }
  };

  const formatStartTime = () => {
    const times = interpretTime(startTime);
    if (times !== null) {
      const s = new Date(start);
      s.setHours(times[0]);
      s.setMinutes(times[1]);
      setStartTime(formatTime(s));
      setStart(s.getTime());
    }
  };

  const formatEndDate = () => {
    const dateSplit = endDate.split('/');
    if (dateSplit.length === 3) {
      const e = new Date(end);
      e.setFullYear(parseInt(dateSplit[2], 10));
      e.setMonth(parseInt(dateSplit[0], 10) - 1);
      e.setDate(parseInt(dateSplit[1], 10));
      setEndDate(formatDate(e));
      setEnd(e.getTime());
    }
  };

  const formatEndTime = () => {
    const times = interpretTime(endTime);
    if (times !== null) {
      const e = new Date(end);
      e.setHours(times[0]);
      e.setMinutes(times[1]);
      setEndTime(formatTime(e));
      setEnd(e.getTime());
    }
  };

  const changeDateTime = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
    modeIos? : 'date' | 'time',
    isStartIos? : boolean,
  ) => {
    let correctMode;
    let correctIsStart;
    if (modeIos !== undefined) {
      correctMode = modeIos;
    } else {
      correctMode = mode;
    }
    if (isStartIos !== undefined) {
      correctIsStart = isStartIos;
    } else {
      correctIsStart = isStart;
    }

    if (selectedDate) {
      const currentDateTime = selectedDate;
      setShow(false);
      const s = new Date(start);
      const e = new Date(end);
      if (event.type === 'set') {
        if (correctMode === 'date') {
          if (correctIsStart) {
            s.setFullYear(currentDateTime.getFullYear());
            s.setMonth(currentDateTime.getMonth());
            s.setDate(currentDateTime.getDate());
            setStart(s.getTime());
            setStartDate(formatDate(s));
          } else {
            e.setFullYear(currentDateTime.getFullYear());
            e.setMonth(currentDateTime.getMonth());
            e.setDate(currentDateTime.getDate());
            setEnd(e.getTime());
            setEndDate(formatDate(e));
          }
        } else if (correctMode === 'time') {
          if (correctIsStart) {
            s.setHours(currentDateTime.getHours());
            s.setMinutes(currentDateTime.getMinutes());
            setStart(s.getTime());
            setStartTime(formatTime(s));
          } else {
            e.setHours(currentDateTime.getHours());
            e.setMinutes(currentDateTime.getMinutes());
            setEnd(e.getTime());
            setEndTime(formatTime(e));
          }
        } else {
          Alert.alert('Invalid mode');
        }
      }
    }
  };

  const showMode = (currentMode: 'date' | 'time', value: boolean) => {
    setShow(true);
    setIsStart(value);
    setMode(currentMode);
  };

  const setPostalAddressFromCoordinates = async (
    coordinates: {longitude: number, latitude: number},
  ) => {
    let addy: any;
    if (Platform.OS === 'ios') {
      try {
        // try using google maps api because it's just better
        [addy] = await Location.reverseGeocodeAsync(coordinates, { useGoogleMaps: true });
      } catch (e) {
        // if there's some error (like maybe limit reached, api key wrong, etc), use apple maps
        [addy] = await Location.reverseGeocodeAsync(coordinates);
      }
    } else {
      // if the user is on android, just use google maps (which is native)
      [addy] = await Location.reverseGeocodeAsync(coordinates);
    }
    if (addy !== undefined) {
      const attributes = ['name', 'streetNumber', 'street', 'city', 'region', 'country', 'postalCode'];
      if (addy.name === addy.streetNumber) {
        addy.name = '';
      }

      attributes.forEach((attribute) => {
        if (addy[attribute] === null || addy[attribute] === '') {
          addy[attribute] = '';
        } else if (attribute === 'name' || attribute === 'city') {
          addy[attribute] = `${addy[attribute]}, `;
        } else if (attribute === 'streetNumber' || attribute === 'street' || attribute === 'region' || attribute === 'country') {
          addy[attribute] = `${addy[attribute]} `;
        }
      });

      setPostalAddress(
        addy.name
        + addy.streetNumber
        + addy.street
        + addy.city
        + addy.region
        + addy.country
        + addy.postalCode,
      );
    } else {
      setPostalAddress('We found coordinates for your search, but we are unsure what the postal address is.');
    }
    setIsSearching(false);
  };

  async function search() {
    setIsSearching(true);
    let coordinates;
    if (Platform.OS === 'ios') {
      try {
      // try using google maps api because it's just better
        coordinates = await Location.geocodeAsync(`${address} Harvard, Cambridge MA`, { useGoogleMaps: true });
        if (coordinates[0] === undefined) {
          coordinates = await Location.geocodeAsync(address, { useGoogleMaps: true });
        }
      } catch (e) {
        // if there's some error (like maybe limit reached, api key wrong, etc), use apple maps
        coordinates = await Location.geocodeAsync(`${address} Harvard, Cambridge MA`);
        if (coordinates[0] === undefined) {
          coordinates = await Location.geocodeAsync(address);
        }
      }
    } else {
      // if the user is on android, just use google maps (which is native)
      coordinates = await Location.geocodeAsync(`${address} Harvard, Cambridge MA`);
      if (coordinates[0] === undefined) {
        coordinates = await Location.geocodeAsync(address);
      }
    }

    if (coordinates[0] !== undefined) {
      setLatitude(coordinates[0].latitude);
      setLongitude(coordinates[0].longitude);
      setPostalAddressFromCoordinates(coordinates[0]);
    } else {
      setLatitude(0);
      setLongitude(0);
      setPostalAddress('Location not found.');
      setIsSearching(false);
    }
  }

  const viewOnMap = () => {
    navigation.navigate('Map Preview', {
      latitude,
      longitude,
      postalAddress,
    });
  };

  useEffect(() => {
    if (Object.keys(route.params.post).length > 0) {
      const { post } = route.params;
      setValueCategory(post.category);
      setText(post.post);
      setTitle(post.title);
      setStart(post.start);
      setEnd(post.end);
      setStartDate(formatDate(post.start));
      setStartTime(formatTime(post.start));
      setEndDate(formatDate(post.end));
      setEndTime(formatTime(post.end));
      setLocationDescription(post.locationDescription);
      setLink(post.link);
      setLatitude(post.latitude);
      setLongitude(post.longitude);
      setPostalAddress(post.postalAddress);
      setPostID(post.id);
      setHouseValueCategory(post.targetedHouses);
      setYearValueCategory(post.targetedYears);
    }
  }, [route.params]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      Location.setGoogleApiKey('AIzaSyCirAlMRz2f71BMJeaqmlo6hpNLXGgJd7Y');
    }
    setPostalAddressFromCoordinates({ latitude: global.latitude, longitude: global.longitude });
  }, []);

  if (screen === 1) {
    return (

      <View style={styles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <View style={{ flex: 1 }}>

            <Text style={styles.question}>
              Which of the following categories best describe your post?
            </Text>

            <Text style={styles.text}>
              We realize that some posts may fit into multiple categories,
              or that none of the categories fit your post.
              If this is the case, just choose the category with icon that is
              most related to your post since it is the icon that will be displayed
              to the user.
            </Text>

            <DropDownPicker
              textStyle={styles.text}
              containerStyle={{
                marginTop: '10%',
              }}
              theme={isDark ? 'DARK' : 'LIGHT'}
              open={openCategory}
              value={valueCategory}
              items={itemsCategory}
              setOpen={setOpenCategory}
              setValue={setValueCategory}
              setItems={setItemsCategory}

            />

          </View>

          <View style={{ height: 100 }}>
            <Button onPress={() => verifyFieldsFilled()} color="#a76af7" title="Next" />
          </View>

        </View>
      </View>

    );
  }

  if (screen === 2) {
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <View style={{ flex: 1 }}>

            <Text style={styles.question}>Where is the location of your post?</Text>
            <Text style={styles.text}>
              Search for your location as you would on Google maps,
              but if no results show up, try using the postal address of your location.
            </Text>

            <Input
              inputStyle={styles.text}
              inputContainerStyle={{
                borderBottomColor: isDark ? 'white' : 'black',
              }}
              placeholder="Pforzheimer House"
              onChangeText={(value) => setAddress(value)}
              value={address}
            />

            <View>
              <Button
                title="Search"
                onPress={() => search()}
                color="#a76af7"
              />
            </View>

            <View style={{ marginVertical: 20 }}>
              <View style={{
                padding: 20, backgroundColor: colors.middleBackground, borderRadius: 10,
              }}
              >
                <View style={{ marginBottom: 10 }}>
                <Text style={styles.boldText}>Address</Text>
                </View>
                {isSearching
                  ? <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />
                  : <Text style={[styles.text, { color: colors.text }]}>{postalAddress}</Text>
              }
              </View>

              <View style={{ marginVertical: 20 }}>
                <Button title="View on map" onPress={() => viewOnMap()} color="#a76af7" />
              </View>

            </View>
          </View>

          <View style={{ height: 50 }}>
            <View style={{ flexDirection: 'row', flex: 2 }}>

              <View style={{ flex: 1, margin: 5 }}>
                <Button titleStyle={{ color: '#a76af7' }} buttonStyle={{ borderColor: '#a76af7' }} onPress={() => setScreen(1)} title="Back" type="outline"/>
              </View>

              <View style={{ flex: 1, margin: 5 }}>
                <Button color="#a76af7" onPress={() => verifyFieldsFilled()} title="Next" />
              </View>

            </View>
          </View>

        </View>
      </KeyboardAwareScrollView>

    );
  }

  if (screen === 3) {
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          { Platform.OS !== 'ios'
          && <View style={{ flex: 1 }}>

            <Text style={styles.question}>Start Date and Time</Text>

            <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

              <View style={{ marginTop: 10, flex: 3 }}>
                <Input
                inputContainerStyle={{
                  borderBottomColor: isDark ? 'white' : 'black',
                }}
                  labelStyle={styles.boldText}
                  inputStyle={styles.text}
                  label="Start date"
                  placeholder="MM/DD/YYYY"
                  value={startDate}
                  maxLength={10}
                  onChangeText={(value) => setStartDate(value)}
                  onEndEditing={() => formatStartDate()}

                />
              </View>

              <View style={{ flex: 1 }}>
                <Button
                  icon={{
                    name: 'calendar',
                    type: 'entypo',
                    color: 'white',
                  }}
                  color="#a76af7"
                  onPress={() => showMode('date', true)}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

              <View style={{ flex: 3 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="Start time"
                  placeholder="HH:MM AM/PM"
                  value={startTime}
                  inputStyle={styles.text}
                  maxLength={8}
                  onChangeText={(value) => setStartTime(value)}
                  onEndEditing={() => formatStartTime()}

                />
              </View>

              <View style={{ flex: 1 }}>
                <Button
                  icon={{
                    name: 'clock',
                    type: 'entypo',
                    color: 'white',
                  }}
                  color="#a76af7"
                  onPress={() => showMode('time', true)}
                />
              </View>
            </View>

            <Text style={styles.question}>End Date and Time</Text>

            <View style={{
              marginTop: 10, flexDirection: 'row', flex: 4, alignItems: 'center',
            }}
            >

              <View style={{ flex: 3 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="End Date"
                  placeholder="MM/DD/YYYY"
                  value={endDate}
                  inputStyle={styles.text}
                  maxLength={10}
                  onChangeText={(value) => setEndDate(value)}
                  onEndEditing={() => formatEndDate()}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Button
                  icon={{
                    name: 'calendar',
                    type: 'entypo',
                    color: 'white',
                  }}
                  color="#a76af7"
                  onPress={() => showMode('date', false)}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

              <View style={{ flex: 3 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="End Time"
                  placeholder="HH:MM AM/PM"
                  value={endTime}
                  inputStyle={styles.text}
                  maxLength={8}
                  onChangeText={(value) => setEndTime(value)}
                  onEndEditing={() => formatEndTime()}

                />
              </View>

              <View style={{ flex: 1 }}>

                <Button
                  icon={{
                    name: 'clock',
                    type: 'entypo',
                    color: 'white',
                  }}
                  color="#a76af7"
                  onPress={() => showMode('time', false)}
                />
              </View>
            </View>

            {show
              ? (
                <DateTimePicker
                  mode={mode}
                  value={isStart ? new Date(start) : new Date(end)}
                  onChange={(event, date) => changeDateTime(event, date)}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )
              : null}
          </View>
            }

          { Platform.OS === 'ios'
          && <View style={{ flex: 1 }}>

            <Text style={styles.question}>Start Date and Time</Text>

            <View style={{ flexDirection: 'row', flex: 3, alignItems: 'center' }}>

              <View style={{ marginTop: 10, flex: 2 }}>
                <Input
                inputContainerStyle={{
                  borderBottomColor: isDark ? 'white' : 'black',
                }}
                  labelStyle={styles.boldText}
                  inputStyle={styles.text}
                  label="Start date"
                  placeholder="MM/DD/YYYY"
                  value={startDate}
                  maxLength={10}
                  onChangeText={(value) => setStartDate(value)}
                  onEndEditing={() => formatStartDate()}

                />
              </View>

              <View style={{ flex: 1 }}>
              <DateTimePicker
                  mode={'date'}
                  value={new Date(start)}
                  onChange={(event, date) => {
                    changeDateTime(event, date, 'date', true);
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 3, alignItems: 'center' }}>

              <View style={{ flex: 2 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="Start time"
                  placeholder="HH:MM AM/PM"
                  value={startTime}
                  inputStyle={styles.text}
                  maxLength={8}
                  onChangeText={(value) => setStartTime(value)}
                  onEndEditing={() => formatStartTime()}

                />
              </View>

              <View style={{ flex: 1 }}>
              <DateTimePicker
                  mode={'time'}
                  value={new Date(start)}
                  onChange={(event, date) => {
                    changeDateTime(event, date, 'time', true);
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              </View>
            </View>

            <Text style={styles.question}>End Date and Time</Text>

            <View style={{
              marginTop: 10, flexDirection: 'row', flex: 3, alignItems: 'center',
            }}
            >

              <View style={{ flex: 2 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="End Date"
                  placeholder="MM/DD/YYYY"
                  value={endDate}
                  inputStyle={styles.text}
                  maxLength={10}
                  onChangeText={(value) => setEndDate(value)}
                  onEndEditing={() => formatEndDate()}
                />
              </View>

              <View style={{ flex: 1 }}>
              <DateTimePicker
                  mode={'date'}
                  value={new Date(end)}
                  onChange={(event, date) => {
                    changeDateTime(event, date, 'date', false);
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 3, alignItems: 'center' }}>

              <View style={{ flex: 2 }}>
                <Input
                  labelStyle={styles.boldText}
                  inputContainerStyle={{
                    borderBottomColor: isDark ? 'white' : 'black',
                  }}
                  label="End Time"
                  placeholder="HH:MM AM/PM"
                  value={endTime}
                  inputStyle={styles.text}
                  maxLength={8}
                  onChangeText={(value) => setEndTime(value)}
                  onEndEditing={() => formatEndTime()}

                />
              </View>

              <View style={{ flex: 1 }}>
              <DateTimePicker
                  mode={'time'}
                  value={new Date(end)}
                  onChange={(event, date) => {
                    changeDateTime(event, date, 'time', false);
                  }}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              </View>
            </View>

          </View>
            }

          <View style={{ marginTop: 50 }}>
            <View style={{ flexDirection: 'row', flex: 2 }}>

              <View style={{ flex: 1, margin: 5 }}>
                <Button onPress={() => setScreen(2)} title="Back" type="outline" titleStyle={{ color: '#a76af7' }} buttonStyle={{ borderColor: '#a76af7' }}/>
              </View>

              <View style={{ flex: 1, margin: 5 }}>
                <Button onPress={() => verifyFieldsFilled()} title="Next" color="#a76af7" />
              </View>

            </View>
          </View>

        </View>
      </KeyboardAwareScrollView>

    );
  }

  if (screen === 4) {
    return (

      <View style={styles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
        <Text style={styles.question}>
          Which graduating classes is your post restricted to?
        </Text>
        <View style={{ marginTop: 10 }}>
        <Text style={styles.text}>
          {yearValueCategory.length === 4 && 'Your post is currently open to all years.' }
          {yearValueCategory.length !== 4 && yearValueCategory.length > 1 && `Your post is currently restricted to ${yearValueCategory.length} different graduating classes.`}
          {yearValueCategory.length !== 4 && yearValueCategory.length === 1 && 'Your post is currently restricted to 1 graduating class.'}

        </Text>
        </View>
      <DropDownPicker
        textStyle={styles.text}
        containerStyle={{
          marginTop: '10%',
        }}
        theme={isDark ? 'DARK' : 'LIGHT'}
        open={openYearCategory}
        value={yearValueCategory}
        items={yearItemsCategory}
        setOpen={(open) => {
          setOpenYearCategory(open);
          setOpenHouseCategory(false);
        }}
        setValue={setYearValueCategory}
        setItems={setYearItemsCategory}
        multiple={true}

    />

      <View style={{ marginTop: '10%' }}>
      <Text style={styles.question}>
          Which houses is your post restricted to?
        </Text>
        <View style={{ marginTop: 10 }}>
        <Text style={styles.text}>
        {houseValueCategory.length === 13 && 'Your post is currently open to all houses.' }
          {houseValueCategory.length !== 13 && houseValueCategory.length > 1 && `Your post is currently restricted to ${houseValueCategory.length} different houses.`}
          {houseValueCategory.length !== 13 && houseValueCategory.length === 1 && 'Your post is currently restricted to 1 house.'}
        </Text>
        </View>
          <DropDownPicker
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
              setOpenYearCategory(false);
            }}
            setValue={setHouseValueCategory}
            setItems={setHouseItemsCategory}
            multiple={true}
          />
          <View style={{ marginTop: 50 }}>
                <View style={{ flexDirection: 'row' }}>

                  <View style={{ flex: 1, margin: 5 }}>
                    <Button onPress={() => setScreen(3)} title="Back" type="outline" titleStyle={{ color: '#a76af7' }} buttonStyle={{ borderColor: '#a76af7' }}/>
                  </View>

                  <View style={{ flex: 1, margin: 5 }}>
                    <Button onPress={() => verifyFieldsFilled()} title="Next" color="#a76af7" />
                  </View>

                </View>
          </View>
      </View>

      </View>

      </View>
    );
  }

  return (
    <KeyboardAwareScrollView style={styles.container}>

      <View style={{ marginVertical: '10%', marginHorizontal: '5%', flex: 1 }}>

        <Input
          labelStyle={styles.boldText}
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
          label="Title"
          placeholder="Free sushi"
          inputStyle={styles.text}
          onChangeText={(value) => setTitle(value)}
          value={title}
          maxLength={25}
        />

        <Input
          labelStyle={styles.boldText}
          inputStyle={styles.text}
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
          label="Specific location description"
          value={locationDescription}
          onChangeText={(value) => setLocationDescription(value)}
          placeholder="Science Center Room 206"
          leftIcon={(
            <Icon
              name="location"
              type="entypo"
              size={24}
              color={colors.text}
            />
          )}
        />

        <Input
          labelStyle={styles.boldText}
          label="Description"
          placeholder="Free sushi if you attend this club meeting!"
          multiline
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
          inputStyle={styles.text}
          onChangeText={(value) => setText(value)}
          value={text}
          maxLength={250}
        />
        <Input
          labelStyle={styles.boldText}
          inputStyle={styles.text}
          label="Website link"
          inputContainerStyle={{
            borderBottomColor: isDark ? 'white' : 'black',
          }}
          placeholder="https://example.com"
          onChangeText={(value) => setLink(value)}
          value={link}
          leftIcon={(
            <Icon
              name="web"
              size={24}
              color={colors.text}
            />
          )}
        />

        <View style={{ height: 100 }}>
          <View style={{ flexDirection: 'row', flex: 2 }}>

            <View style={{ flex: 1, margin: 5 }}>
              <Button onPress={() => setScreen(4)} title="Back" type="outline" titleStyle={{ color: '#a76af7' }} buttonStyle={{ borderColor: '#a76af7' }} />
            </View>

            <View style={{ flex: 1, margin: 5 }}>
              <Button
                title="Post"
                onPress={() => verifyFieldsFilled()}
                color="#a76af7"

              />
            </View>

          </View>
        </View>

      </View>

    </KeyboardAwareScrollView>
  );
}

CreatePostScreen.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      screen: PropTypes.number,
      post: PropTypes.shape({
        title: PropTypes.string,
        locationDescription: PropTypes.string,
        text: PropTypes.string,
        link: PropTypes.string,
        end: PropTypes.number,
        start: PropTypes.number,
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        postalAddress: PropTypes.string,
        id: PropTypes.string,
        category: PropTypes.string,
        post: PropTypes.string,
      }),
    }),
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
