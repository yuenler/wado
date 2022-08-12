import React, { memo, useState } from 'react';
import { View } from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { ListItem, Icon } from '@rneui/themed';
import PropTypes from 'prop-types';
import globalStyles from '../GlobalStyles';
import {
  Food, Social, Academic, Athletic, Performance,
} from '../icons';
import { Category, LiveUserSpecificPost } from '../../types/Post';

const colors = ['green', 'blue', 'red'];
function PostComponent({
  navigation, post, setArchived, setStarred,
}: {navigation: any, post: LiveUserSpecificPost, setArchived: any, setStarred: any}) {
  const [isStarred, setIsStarred] = useState(post.isStarred);
  return (
    <TouchableHighlight
      onPress={() => navigation.navigate('View Full Post', { post, setArchived, setStarred })}
    >
      <View>
        <ListItem>

        {post.category === Category.Food ? <Food size={14}/> : null}
        {post.category === Category.Performance ? <Performance size={14}/> : null}
        {post.category === Category.Social ? <Social size={14}/> : null}
        {post.category === Category.Academic ? <Academic size={14}/> : null}
        {post.category === Category.Athletic ? <Athletic size={14}/> : null}

          <ListItem.Content>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1 }}>
                <ListItem.Title
                  numberOfLines={1}
                  style={globalStyles.boldText}
                >
                  {post.title}

                </ListItem.Title>
              </View>
              <View style={{ marginLeft: 5, alignItems: 'flex-end' }}>
                <ListItem.Subtitle
                  style={
                    [globalStyles.smallText, { color: colors[post.datetimeStatus.startStatus] }]
                  }
                >
                  {' '}
                  {post.datetimeStatus.datetime}
                </ListItem.Subtitle>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1 }}>

                <ListItem.Subtitle
                  numberOfLines={1}
                  style={globalStyles.text}
                >
                  {post.locationDescription}
                </ListItem.Subtitle>
                <ListItem.Subtitle
                  numberOfLines={1}
                  style={globalStyles.text}
                >
                  {post.post}
                </ListItem.Subtitle>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                  <View>
                    {isStarred
                      ? <TouchableHighlight style={{ margin: 5 }} onPress={() => {
                        setIsStarred(false);
                        setStarred(false);
                      }}>

                      <Icon name="star" type="entypo" color="#a76af7"
                       />
                    </TouchableHighlight>
                      : (
                <TouchableHighlight style={{ margin: 5 }} onPress={() => {
                  setIsStarred(true);
                  setStarred(true);
                }}>
                        <Icon
                          name="star-outlined"
                          type="entypo"
                        />
                      </TouchableHighlight>
                      )}
                  </View>
              </View>
            </View>

          </ListItem.Content>
        </ListItem>
      </View>
    </TouchableHighlight>
  );
}

export default memo(PostComponent);

PostComponent.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setArchived: PropTypes.func.isRequired,
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    locationDescription: PropTypes.string.isRequired,
    post: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    isStarred: PropTypes.bool.isRequired,
    datetimeStatus: PropTypes.shape({
      startStatus: PropTypes.number.isRequired,
      datetime: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
