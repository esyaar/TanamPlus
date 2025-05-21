import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

class Dashboard extends Component {
    render() {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Home</Text>
          </View>
          {/* Tambahkan konten lain di sini jika diperlukan */}
        </View>
      );
    }
  } 
export default Dashboard;
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#40744E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Lexend',
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft:10,
    paddingBottom:5,
  },
  body: {
    padding: 20,
  },
});