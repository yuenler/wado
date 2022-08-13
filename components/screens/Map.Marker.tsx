import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import {
  View, Text,
} from 'react-native';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../ThemeContext';
import {
  Food, Performance, Social, Academic, Athletic,
} from '../icons';
import { LiveUserSpecificPost, Category } from '../../types/Post';

type PostMarker = {
  post: LiveUserSpecificPost,
  latlng: {latitude: number, longitude: number}
}

export default function MapMarker({
  marker, navigation, datetimeStatus, setArchived, setStarred,
} :
   { marker: PostMarker,
    navigation: any,
    datetimeStatus: any,
    setArchived: any,
    setStarred: any }) {
  const { colors } = useTheme();
  const timeColors = [colors.green, colors.blue, colors.red];

  const styles = globalStyles(colors);

  return (
  <Marker
    tracksViewChanges={false}
    key={marker.post.id}
    coordinate={marker.latlng}
  >
    <View>
      {marker.post.category === Category.Food ? <Food size={14}/> : null}
      {marker.post.category === Category.Performance ? <Performance size={14}/> : null}
      {marker.post.category === Category.Social ? <Social size={14}/> : null}
      {marker.post.category === Category.Academic ? <Academic size={14}/> : null}
      {marker.post.category === Category.Athletic ? <Athletic size={14}/> : null}
    </View>
    <Callout
      style={{ backgroundColor: colors.background }}
      onPress={() => navigation.navigate('View Full Post', { post: marker.post, setArchived, setStarred })}
    >
      <View style={{ width: 150, padding: 5 }}>
        <Text style={[styles.text, { textAlign: 'center' }]}>{marker.post.title}</Text>
        <Text style={[styles.smallText, { textAlign: 'center', color: timeColors[datetimeStatus.startStatus] }]}>{datetimeStatus.datetime}</Text>
      </View>
    </Callout>
  </Marker>
  );
}
