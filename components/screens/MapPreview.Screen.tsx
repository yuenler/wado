import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';

export default function MapPreview({ route }:{route: any}) {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

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
    <View style={styles.container}>

      <MapView
        style={styles.map}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.0052,
          longitudeDelta: 0.0052,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        showsBuildings
        showsIndoors
        showsIndoorLevelPicker
        loadingEnabled
        loadingIndicatorColor="#a76af7"
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
