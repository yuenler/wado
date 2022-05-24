import React, {useState, useEffect} from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {globalStyles} from '../GlobalStyles';
import Button from '@rneui/base'
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

export default function MapScreen({navigation}) {

    // set default location to be Harvard Square
    const [latitude, setLatitude] = useState(42.3743935);
    const [longitude, setLongitude] = useState(-71.1184378);
    const [posts, setPosts] = useState([]);
    const [markers, setMarkers] = useState([]);

 

    const createMarkers = (p) => {
        var m = [];
        for (var i = 0; i < p.length; i++){
            m.push({
                title: p[i].title,
                description: p[i].post,
                latlng: {latitude: p[i].latitude, longitude: p[i].longitude},
            })
        }
        setMarkers(m)
    }

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

        firebase.database().ref('Posts').once('value', (snapshot) => {
			var posts = []
			snapshot.forEach((childSnapshot) => {
				posts.push(childSnapshot.val());
			  });
			setPosts(posts)
            createMarkers(posts)
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
                onPress = {() => navigation.navigate('View Full Post', {post: posts[index]})}
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