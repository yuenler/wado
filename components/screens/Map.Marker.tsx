import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import {
  View, Text,
} from 'react-native';
import globalStyles from '../GlobalStyles';
import {
  food, performance, social, academic, athletic,
} from '../icons';
import { LiveUserSpecificPost, Category } from '../../types/Post';

const colors = ['green', 'blue', 'red'];

type PostMarker = {
  post: LiveUserSpecificPost,
  latlng: {latitude: number, longitude: number}
}

export default function MapMarker({
  marker, navigation, datetimeStatus, setArchived,
} :
   { marker: PostMarker, navigation: any, datetimeStatus: any, setArchived: any }) {
  return (
  <Marker
    tracksViewChanges={false}
    key={marker.post.id}
    coordinate={marker.latlng}
  >
    <View>
      {marker.post.category === Category.Food ? food(14) : null}
      {marker.post.category === Category.Performance ? performance(14) : null}
      {marker.post.category === Category.Social ? social(14) : null}
      {marker.post.category === Category.Academic ? academic(14) : null}
      {marker.post.category === Category.Athletic ? athletic(14) : null}
    </View>
    <Callout
      onPress={() => navigation.navigate('View Full Post', { post: marker.post, setArchived })}
    >
      <View style={{ width: 150, padding: 5 }}>
        <Text style={[globalStyles.text, { textAlign: 'center' }]}>{marker.post.title}</Text>
        <Text style={[globalStyles.smallText, { textAlign: 'center', color: colors[datetimeStatus.startStatus] }]}>{datetimeStatus.datetime}</Text>
      </View>
    </Callout>
  </Marker>
  );
}
