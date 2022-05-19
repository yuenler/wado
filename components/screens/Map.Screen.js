import * as React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {globalStyles} from '../GlobalStyles';

export default function MapScreen() {
  return (
    <View style={globalStyles.container}>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
  });