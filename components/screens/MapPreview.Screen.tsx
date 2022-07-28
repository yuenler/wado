import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  StyleSheet, View, Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default function MapPreview({ route }:{route: any}) {
  const [latitude, setLatitude] = useState(42.3743935);
  const [longitude, setLongitude] = useState(-71.1184378);
  const [marker, setMarker] = useState({ latlng: { latitude, longitude } });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLatitude(route.params.latitude);
    setLongitude(route.params.longitude);
    setMarker({ latlng: { latitude: route.params.latitude, longitude: route.params.longitude } });
    setReady(true);
  }, [route.params.latitude, route.params.longitude]);

  return (
    <View style={globalStyles.container}>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0052,
          longitudeDelta: 0.0052,
        }}
      >

        {ready
          ? (
            <Marker
              coordinate={marker.latlng}
            />
          ) : null}

      </MapView>

    </View>
  );
}

MapPreview.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};