import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TabBarBackground = () => {
  const insets = useSafeAreaInsets(); // untuk dapatkan tinggi safe area bawah

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
    elevation: 90, // penting untuk Android agar naik ke atas
    height: 70,
    backgroundColor: '#40744E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});

export default TabBarBackground;
