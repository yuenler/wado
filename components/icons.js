import React from 'react';
import { Icon } from '@rneui/themed';

export const food = (size = 20) => (
  <Icon
    name="food-fork-drink"
    type="material-community"
    color="green"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}
  />

);

export const performance = (size = 20) => (
  <Icon
    name="ticket"
    type="font-awesome"
    color="purple"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />

);

export const social = (size = 20) => (
  <Icon
    name="user-friends"
    type="font-awesome-5"
    color="pink"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />

);

export const academic = (size = 20) => (
  <Icon
    name="book"
    type="entypo"
    color="blue"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />

);

export const athletic = (size = 20) => (
  <Icon
    name="running"
    type="font-awesome-5"
    color="red"
    reverse
    containerStyle={{ margin: 0 }}
    size={size}

  />

);
