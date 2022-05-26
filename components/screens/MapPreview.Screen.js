import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {globalStyles} from '../GlobalStyles';
import Button from '@rneui/base'
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export default function MapPreview({route}) {

    const [latitude, setLatitude] = useState(42.3743935);
    const [longitude, setLongitude] = useState(-71.1184378);
    const [marker, setMarker] = useState({});
 

  

    useEffect(() => {
          setLatitude(route.params.latitude);
          setLongitude(route.params.longitude);
          setMarker({latlng: {latitude: route.params.latitude, longitude: route.params.longitude}})
        
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
      
            >

            {marker?
            <Marker
            coordinate={marker.latlng}
            />: null    }
            
            </MapView>


            </View>
        );
}

const styles = StyleSheet.create({
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });