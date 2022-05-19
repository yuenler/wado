import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {globalStyles} from '../GlobalStyles';
import * as Location from 'expo-location';


export default function MapScreen() {

    // set default location to be Harvard Square
    const [longitude, setLongitude] = useState(-71.1184378);
    const [latitude, setLatitude] = useState(42.3743935);

    useEffect(() => {
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});
          setLongitude(location.coords.longitude);
          setLatitude(location.coords.latitude);

        })();
      }, []);

      

        return (
            <View style={globalStyles.container}>
            <MapView style={styles.map} 
            
            initialRegion={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.0052,
                longitudeDelta: 0.0052,
            }}
      
            />
            </View>
        );
}

const styles = StyleSheet.create({
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });