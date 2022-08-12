import React from 'react';
import { Icon } from '@rneui/themed';

export function Food({ size } : {size: number}) {
  return <Icon
  name="food-fork-drink"
  type="material-community"
  color="green"
  reverse
  containerStyle={{ margin: 0 }}
  size={size}
/>;
}

export function Performance({ size }: {size: number}) {
  return <Icon
    name="ticket"
    type="font-awesome"
    color="purple"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />;
}

export function Social({ size }: {size: number}) {
  return <Icon
    name="user-friends"
    type="font-awesome-5"
    color="#f20fd8"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />;
}

export function Academic({ size }: {size: number}) {
  return <Icon
    name="book"
    type="entypo"
    color="blue"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />;
}

export function Athletic({ size }: {size: number}) {
  return <Icon
    name="running"
    type="font-awesome-5"
    color="red"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />;
}

export const getIcon = (filter: 'social' | 'performance' | 'food' | 'academic' |'athletic', size = 20) => {
  switch (filter) {
    case 'social':
      return <Social size={size} />;
    case 'performance':
      return <Performance size={size} />;
    case 'food':
      return <Food size={size} />;
    case 'academic':
      return <Academic size={size} />;
    case 'athletic':
      return <Athletic size={size} />;
    default:
      return <Social size={size} />;
  }
};
