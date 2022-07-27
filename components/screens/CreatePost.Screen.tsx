/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import {
  StyleSheet, View, ScrollView, Text, Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Input, Icon, CheckBox } from '@rneui/themed';
import { Button } from '@rneui/base';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import {
  formatTime, formatDate, determineDatetime,
} from '../../helpers';
import {
  food, performance, social, academic, athletic,
} from '../icons';
import {Post} from '../../types/Post';

// These are user defined styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ededed',
  },
  button: {
    backgroundColor: '#871609',
    padding: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 10,
  },
  postalAddress: {
    fontSize: 15,
    fontFamily: 'Montserrat',
  },
});

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
  const [screen, setScreen] = useState(1);
  const [openCategory, setOpenCategory] = useState(false);
  const [valueCategory, setValueCategory] = useState(null);
  const [itemsCategory, setItemsCategory] = useState([

    {
      label: 'Social',
      value: 'social',
      icon: () => social(15),
    },

    {
      label: 'Performance',
      value: 'performance',
      icon: () => performance(15),

    },
    {
      label: 'Food',
      value: 'food',
      icon: () => food(15),
    },

    {
      label: 'Academic',
      value: 'academic',
      icon: () => academic(15),
    },
    {
      label: 'Athletic',
      value: 'athletic',
      icon: () => athletic(15),
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
  const [latitude, setLatitude] = useState<number | null>(global.latitude);
  const [longitude, setLongitude] = useState<number| null>(global.longitude);
  const [postalAddress, setPostalAddress] = useState('');
  const [postID, setPostID] = useState(null);

  const addPostToUserProfile = (id: string, uid: string) => {
    firebase.database().ref(`users/${uid}/ownPosts/${id}`).set(true);
  };

  const storeText = async () => {
    // if this is editing an existing post, we set the data using the existing postID
    if (postID != null) {
      try {
        firebase.database().ref(`Posts/${postID}`).update({
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
        });
        Alert.alert('Your post has been successfully edited!');
      } catch (error) {
        Alert.alert('Error editing post');
      }
    } else {
      try {
        const myPost : any = {
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
        };
        const ref = await firebase
          .database()
          .ref('Posts')
          .push(myPost);
        if (ref.key){
          addPostToUserProfile(ref.key, global.user.uid);
        }
        const datetimeStatus = determineDatetime(myPost.start, myPost.end);
        const myPostForDisplay : Post = { ...myPost, isStarred: false, datetimeStatus, id: ref.key };
        // add post to global.ownPosts
        global.ownPosts.push(myPostForDisplay);
        // add post to global.posts
        global.posts.push(myPostForDisplay);
        global.posts.sort((a, b) => a.end - b.end);

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
      e.setFullYear(parseInt(dateSplit[2]));
      e.setMonth(parseInt(dateSplit[0])-1);
      e.setDate(parseInt(dateSplit[1]));
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

  const changeDateTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate){
      const currentDateTime = selectedDate;
      setShow(false);
      const s = new Date(start);
      const e = new Date(end);
      if (event.type === 'set') {
        if (mode === 'date') {
          if (isStart) {
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
        } else if (mode === 'time') {
          if (isStart) {
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

  const setPostalAddressFromCoordinates = async (coordinates: {longitude: number, latitude: number}) => {
    const [addy] : any = await Location.reverseGeocodeAsync(coordinates);
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
  };

  async function search() {
    let coordinates = await Location.geocodeAsync(`${address} Harvard, Cambridge MA`);
    if (coordinates[0] === undefined) {
      coordinates = await Location.geocodeAsync(address);
    }

    if (coordinates[0] !== undefined) {
      setLatitude(coordinates[0].latitude);
      setLongitude(coordinates[0].longitude);
      setPostalAddressFromCoordinates(coordinates[0]);
    } else {
      setLatitude(null);
      setLongitude(null);
      setPostalAddress('Location not found.');
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
    }
  }, [route.params]);

  useEffect(() => {
    setPostalAddressFromCoordinates({ latitude: global.latitude, longitude: global.longitude });
  }, []);

  if (screen === 1) {
    return (

      <View style={globalStyles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <View style={{ flex: 1 }}>

            <Text style={globalStyles.question}>
              Which of the following categories best describe your post?
            </Text>

            <DropDownPicker
              textStyle={globalStyles.text}
              containerStyle={{
                marginTop: '10%',
              }}
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
      <ScrollView style={globalStyles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <View style={{ flex: 1 }}>

            <Text style={globalStyles.question}>Where is the location of your post?</Text>

            <Input
              inputStyle={globalStyles.text}
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
                padding: 20, backgroundColor: '#8a8a8a', borderRadius: 10,
              }}
              >
                <Text style={[styles.postalAddress, { color: 'white' }]}>{postalAddress}</Text>
              </View>

              <View style={{ marginVertical: 20 }}>
                <Button title="View on map" onPress={() => viewOnMap()} color="#a76af7" />
              </View>

            </View>
          </View>

          <View style={{ height: 50 }}>
            <View style={{ flexDirection: 'row', flex: 2 }}>

              <View style={{ flex: 1, margin: 5 }}>
                <Button titleStyle={{color: '#a76af7'}} buttonStyle={{borderColor: '#a76af7'}} onPress={() => setScreen(1)} title="Back" type="outline"/>
              </View>

              <View style={{ flex: 1, margin: 5 }}>
                <Button  color="#a76af7" onPress={() => verifyFieldsFilled()} title="Next" />
              </View>

            </View>
          </View>

        </View>
      </ScrollView>

    );
  }

  if (screen === 3) {
    return (
      <ScrollView style={globalStyles.container}>
        <View style={{ margin: '10%', flex: 1 }}>
          <View style={{ flex: 1 }}>

            <Text style={globalStyles.question}>Start Date and Time</Text>

            <View style={{ flexDirection: 'row', flex: 4, alignItems: 'center' }}>

              <View style={{ marginTop: 10, flex: 3 }}>
                <Input
                  inputStyle={globalStyles.text}
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
                  label="Start time"
                  placeholder="HH:MM AM/PM"
                  value={startTime}
                  inputStyle={globalStyles.text}
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

            <Text style={globalStyles.question}>End Date and Time</Text>

            <View style={{
              marginTop: 10, flexDirection: 'row', flex: 4, alignItems: 'center',
            }}
            >

              <View style={{ flex: 3 }}>
                <Input
                  label="End Date"
                  placeholder="MM/DD/YYYY"
                  value={endDate}
                  inputStyle={globalStyles.text}
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
                  label="End Time"
                  placeholder="HH:MM AM/PM"
                  value={endTime}
                  inputStyle={globalStyles.text}
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
                  value={new Date()}
                  onChange={(event, date) => changeDateTime(event, date)}
                />
              )
              : null}

          </View>


          <View style={{ marginTop: 50 }}>
            <View style={{ flexDirection: 'row', flex: 2 }}>

              <View style={{ flex: 1, margin: 5 }}>
                <Button onPress={() => setScreen(2)} title="Back" type="outline" titleStyle={{color: '#a76af7'}} buttonStyle={{borderColor: '#a76af7'}}/>
              </View>

              <View style={{ flex: 1, margin: 5 }}>
                <Button onPress={() => verifyFieldsFilled()} title="Next" color="#a76af7" />
              </View>

            </View>
          </View>

        </View>
      </ScrollView>

    );
  }

  return (
    <ScrollView style={globalStyles.container}>

      <View style={{ marginVertical: '10%', marginHorizontal: '5%', flex: 1 }}>

        <Input
          label="Title"
          placeholder="Free sushi"
          inputStyle={globalStyles.text}
          onChangeText={(value) => setTitle(value)}
          value={title}
          maxLength={25}
        />

        <Input
          inputStyle={globalStyles.text}
          label="Specific location description"
          value={locationDescription}
          onChangeText={(value) => setLocationDescription(value)}
          placeholder="Science Center Room 206"
          leftIcon={(
            <Icon
              name="location"
              type="entypo"
              size={24}
              color="black"
            />
          )}
        />

        <Input
          label="Description"
          placeholder="Free sushi if you attend this club meeting!"
          multiline
          inputStyle={globalStyles.text}
          onChangeText={(value) => setText(value)}
          value={text}
          maxLength={250}
        />
        <Input
          inputStyle={globalStyles.text}
          label="Website link"
          placeholder="https://example.com"
          onChangeText={(value) => setLink(value)}
          value={link}
          leftIcon={(
            <Icon
              name="web"
              size={24}
              color="black"
            />
          )}
        />

        <View style={{ height: 100 }}>
          <View style={{ flexDirection: 'row', flex: 2 }}>

            <View style={{ flex: 1, margin: 5 }}>
              <Button onPress={() => setScreen(3)} title="Back" type="outline" titleStyle={{color: '#a76af7'}} buttonStyle={{borderColor: '#a76af7'}} />
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

    </ScrollView>
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
