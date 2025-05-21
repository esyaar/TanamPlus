import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const TabBarBackground = () => {
  return (
    <View style={styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#40744E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default TabBarBackground;
