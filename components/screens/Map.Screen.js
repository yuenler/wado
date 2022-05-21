import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {globalStyles} from '../GlobalStyles';
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export default function MapScreen() {

    // set default location to be Harvard Square
    const [latitude, setLatitude] = useState(42.3743935);
    const [longitude, setLongitude] = useState(-71.1184378);
    const [posts, setPosts] = useState([]);
    const [markers, setMarkers] = useState([
        {
            title: 'hi',
            description: 'lallalallafjks dfsadf adf',
            latlng: {latitude: 42.3743935, longitude: -71.1184378}
        }
    ]);
 

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

        firebase.database().ref('Announcements').once('value', (snapshot) => {
			var posts = []
			snapshot.forEach((childSnapshot) => {
				posts.push(childSnapshot.val());
			  });
			setPosts(posts)
		});
        
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

            {markers.map((marker, index) => (
                <Marker
                key={index}
                coordinate={marker.latlng}
                title={marker.title}
                description={marker.description}
                />
            ))}
            
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