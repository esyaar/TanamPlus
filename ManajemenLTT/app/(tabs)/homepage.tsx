import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Image } from 'react-native';

const Homepage = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.welcome}>Selamat Datang Esya</Text>
        <Text style={styles.subtitle}>
          Silahkan lakukan pelaporan data harian LTT
        </Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Luas Tambah Tanam Harian Tercatat :</Text>
          <Text style={styles.summaryValue}>10 Ha</Text>  {/* Gek disini databases*/}
        </View>

        <View style={styles.card}>
            <Image source={require('@/assets/ikon/image.png')}  style={styles.Image}/>
          <Text style={styles.cardTitle}>Input Terakhir</Text>
          <Text style={styles.cardSubtitle}>Selasa 05/04/2025</Text>
          <Text style={styles.cardText}>Komoditas Jagung | Non Sawah</Text>
          <Text style={styles.cardText}>Luas Tambah Tanam Harian 10 Ha</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Input Data Harian LTT</Text>
          <Text style={styles.cardSubtitle}>Lakukan pendataan harian LTT</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Input Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#2F8653',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  headerText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft:22,
    paddingBottom:5,
  },
  body: {
    padding: 20,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingTop: 20,
    paddingRight:109,
    paddingLeft:30,
  },
  subtitle: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 20,
    paddingLeft:30,
  },
  summaryBox: { //bagian rekap penambahan
    backgroundColor:'#E9F5EC',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginLeft:5,
    marginRight:5,
  },
  summaryText: {
    paddingLeft:10,
    fontSize: 14,
    color: '#1A1A1A',
  },
    summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#1A1A1A',
  },
   card: { // bagian riwayat 1 hari sbeleum
    marginLeft:5,
    marginRight:5,
    backgroundColor: '#E9F5EC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginLeft: 40,
    fontSize: 16,
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: '#1A1A1A',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#2F8653',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image:{
    width: 10,
    height: 90,
  },
});
