import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

class Homepage extends Component {
  handleNavigate = () => {
    router.replace('/Penyuluh/tambah');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Home</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.welcome}>Selamat Datang</Text>
          <Text style={styles.subtitle}>
            Silahkan lakukan pelaporan data harian LTT
          </Text>

          <View style={styles.card1}> 
            <Image source={require('@/assets/ikon/image.png')}style={styles.image}/>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Input Terakhir</Text>
              <Text style={styles.cardSubtitle}>Selasa 05/04/2025</Text>
              <Text style={styles.cardText}>Komoditas Jagung | Non Sawah</Text>
              <Text style={styles.cardText}>Luas Tambah Tanam Harian 10 Ha</Text>
              </View>
          </View>

          <View style={styles.card2}>
            <View style={styles.rowTop}>
              <Image source={require('@/assets/ikon/image.png')} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Input Data Harian LTT</Text>
                <Text style={styles.cardSubtitle}>Lakukan pendataan harian LTT</Text>
             </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={this.handleNavigate}>
              <Text style={styles.buttonText}>Input Data</Text>
              </TouchableOpacity>
            </View>

        </View>
      </View>
    );
  }
}
export default Homepage;
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
  welcome: {
    fontSize: 22,
    fontFamily: 'Lexend',
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingTop: 5,
    paddingLeft:10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lexend',
    color: '#1A1A1A',
    marginBottom: 20,
    paddingLeft:10,
  },
   card1: {
    backgroundColor: '#E9F5EC',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  riwayatText: {
    marginLeft: 10,
    flex: 1,
  },
  card2: {
    backgroundColor: '#E9F5EC',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 40,
    height: 40,
    marginRight:10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    fontFamily: 'Lexend',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Lexend',
    color: '#1A1A1A',
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Lexend',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    width: 150,
    height: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Lexend',
  },
});
