import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AlertMessage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login gagal. Username atau password salah.</Text>
    </View>
  );
};

export default AlertMessage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  text: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
  },
});
