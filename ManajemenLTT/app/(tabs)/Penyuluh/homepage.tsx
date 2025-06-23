import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import LogoutModal from '@/components/ui/modalout';
import { fetchLttDataOnce, LttData } from '@/services/dataService'; 
import { getCurrentUser } from '@/services/authService';

interface State {
  modalVisible: boolean;
  lastInputData: LttData | null;
}

class Homepage extends Component<{}, State> {
  state: State = {
    modalVisible: false,
    lastInputData: null,
  };

  handleNavigate = () => {
    router.replace('/(subtabs)/tambah');
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  componentDidMount() {
    this.loadLastInput();
  }

  confirmLogout = () => {
    console.log('User confirmed logout');
    this.closeModal(); 
  };

  loadLastInput = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id
      if (!userId) {
        console.warn('No user ID found. Cannot load user-specific data.');
        this.setState({ lastInputData: null });
        return;
      }

      const data = await fetchLttDataOnce(userId);
      if (data.length > 0) {
        this.setState({ lastInputData: data[0] });
      } else {
        this.setState({ lastInputData: null });
      }
    } catch (error) {
      console.error('Failed to load last input data:', error);
      this.setState({ lastInputData: null }); 
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Home</Text>
          <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.welcome}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Silahkan lakukan pelaporan data harian LTT</Text>

          <View style={styles.card1}>
            <Image source={require('@/assets/ikon/image.png')} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Input Terakhir</Text>
              {this.state.lastInputData ? (
                <>
                  <Text style={styles.cardSubtitle}>
                    {this.state.lastInputData.tanggalLaporan.toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.cardText}>
                    Komoditas {this.state.lastInputData.komoditas} | {this.state.lastInputData.jenisLahan}
                  </Text>
                  <Text style={styles.cardText}>
                    Luas Tambah Tanam Harian {this.state.lastInputData.luasTambahTanam} Ha
                  </Text>
                </>
              ) : (
                <Text style={styles.cardText}>Belum ada data untuk pengguna ini.</Text>
              )}
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

        {/* Modal Logout */}
        <LogoutModal visible={this.state.modalVisible} onClose={this.closeModal} onConfirm={this.confirmLogout} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 25,
  },
  body: {
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontFamily: 'Lexend4',
    color: '#1A1A1A',
    paddingTop: 5,
    paddingLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lexend3',
    color: '#1A1A1A',
    marginBottom: 20,
    paddingLeft: 10,
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
    fontFamily: 'Lexend',
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
  out: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Lexend4',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 10,
    fontFamily: 'Lexend3',
    color: '#1A1A1A',
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Lexend2',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    marginTop: 15,
    marginLeft: 110,
    width: 160,
    height: 35,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    margin: 'auto',
    fontFamily: 'Lexend4',
  },
  cardContent: {},
  textContainer: {},
});