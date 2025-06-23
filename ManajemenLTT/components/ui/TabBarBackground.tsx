import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabBarBackground = () => {
  const insets = useSafeAreaInsets(); 

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 90, 
    height: 70,
    backgroundColor: '#40744E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default TabBarBackground;
