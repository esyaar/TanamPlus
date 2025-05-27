import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import LogoutModal from '@/components/ui/modalout';
import { db } from '@/services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { printToFileAsync } from 'expo-print'; // Untuk membuat PDF
import * as FileSystem from 'expo-file-system'; // Untuk menyimpan file
import * as Sharing from 'expo-sharing'; // Untuk berbagi file

interface State {
  modalVisible: boolean;
  selectedKecamatan: string;
  kecamatanList: string[];
  chartData: { name: string; value: number; color: string }[];
}

export default class Dashboard extends Component<{}, State> {
  state: State = {
    modalVisible: false,
    selectedKecamatan: 'Seluruh Kota',
    kecamatanList: [],
    chartData: [],
  };

  async componentDidMount() {
    // 1. Fetch unique kecamatan untuk Picker
    const snapshot = await getDocs(collection(db, 'ltt'));
    const kecSet = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.kecamatan) kecSet.add(data.kecamatan);
    });
    this.setState({ kecamatanList: Array.from(kecSet).sort() }, 
      // 2. Setelah list siap, langsung fetch chart all
      () => this.fetchChartData()
    );
  }

  componentDidUpdate(_: {}, prev: State) {
    if (prev.selectedKecamatan !== this.state.selectedKecamatan) {
      this.fetchChartData();
    }
  }

  fetchChartData = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'ltt'));
      // Map untuk menyimpan total luasTambahTanam berdasarkan kombinasi kecamatan:komoditas
      const groupedData: Record<string, { kecamatan: string; komoditas: string; luasTambahTanam: number }> = {};
  
      snapshot.forEach(doc => {
        const { komoditas, kecamatan, luasTambahTanam } = doc.data();
        // Filter berdasarkan kecamatan yang dipilih
        if (
          this.state.selectedKecamatan === 'Seluruh Kota' ||
          kecamatan === this.state.selectedKecamatan
        ) {
          // Buat kunci unik berdasarkan kecamatan dan komoditas
          const key = `${kecamatan}:${komoditas}`;
          if (groupedData[key]) {
            // Jika kombinasi sudah ada, tambahkan luasTambahTanam
            groupedData[key].luasTambahTanam += luasTambahTanam || 0;
          } else {
            // Jika kombinasi belum ada, buat entri baru
            groupedData[key] = { kecamatan, komoditas, luasTambahTanam: luasTambahTanam || 0 };
          }
        }
      });
  
      // Konversi groupedData ke format chartData
      const COLORS = ['#4385FF', '#FF7B6F', '#FCD35C', '#3D8963', '#3E58A0', '#98A03E', '#CF57A7'];
      const chartData = Object.values(groupedData).map((item, i) => ({
        name: item.komoditas, // Hanya nama komoditas yang ditampilkan di chart
        value: item.luasTambahTanam,
        color: COLORS[i % COLORS.length],
      }));
  
      this.setState({ chartData });
    } catch (e) {
      console.error('Error fetchChartData:', e);
    }
  };

  openModal  = () => this.setState({ modalVisible: true });
  closeModal = () => this.setState({ modalVisible: false });
  confirmLogout = () => {
    this.closeModal();
    router.push('./index');
  };

  handleDownload = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'ltt'));
      // Map untuk menyimpan total luasTambahTanam berdasarkan kombinasi kecamatan:komoditas
      const groupedData: Record<string, { kecamatan: string; komoditas: string; luasTambahTanam: number }> = {};
  
      snapshot.forEach(doc => {
        const { komoditas, kecamatan, luasTambahTanam } = doc.data();
        // Filter berdasarkan kecamatan yang dipilih
        if (
          this.state.selectedKecamatan === 'Seluruh Kota' ||
          kecamatan === this.state.selectedKecamatan
        ) {
          const key = `${kecamatan}:${komoditas}`;
          if (groupedData[key]) {
            groupedData[key].luasTambahTanam += luasTambahTanam || 0;
          } else {
            groupedData[key] = { kecamatan, komoditas, luasTambahTanam: luasTambahTanam || 0 };
          }
        }
      });
  
      const data = Object.values(groupedData);
  
      if (data.length === 0) {
        Alert.alert('Tidak Ada Data', `Tidak ada data untuk ${this.state.selectedKecamatan}.`);
        return;
      }
  
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #40744E; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #E9F5EC; }
            </style>
          </head>
          <body>
            <h1>Laporan LTT - ${this.state.selectedKecamatan}</h1>
            <table>
              <tr>
                <th>Komoditas</th>
                <th>Kecamatan</th>
                <th>Luas Tambah Tanam (Ha)</th>
              </tr>
              ${data
                .map(
                  item => `
                    <tr>
                      <td>${item.komoditas || 'N/A'}</td>
                      <td>${item.kecamatan || 'N/A'}</td>
                      <td>${item.luasTambahTanam || 0}</td>
                    </tr>
                  `
                )
                .join('')}
            </table>
          </body>
        </html>
      `;
  
      const { uri } = await printToFileAsync({
        html: htmlContent,
        base64: false,
      });
  
      const fileName = `LTT_${this.state.selectedKecamatan}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;
  
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newPath, {
          dialogTitle: 'Bagikan Laporan LTT',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert('Sukses', `PDF disimpan di: ${newPath}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Gagal menghasilkan PDF. Silakan coba lagi.');
    }
  };

  render() {
    const screenWidth = Dimensions.get('window').width;
    const { selectedKecamatan, kecamatanList, chartData } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Dashboard</Text>
          <TouchableOpacity onPress={this.openModal}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Picker 
            style={styles.ket}
            selectedValue={selectedKecamatan}
            onValueChange={value => this.setState({ selectedKecamatan: value })}
          >
            <Picker.Item label="Seluruh Kota" value="Seluruh Kota" />
            {kecamatanList.map(kec => (
              <Picker.Item key={kec} label={kec} value={kec} />
            ))}
          </Picker>

          <View style={styles.body2}>
          {chartData.length > 0? (
            <PieChart
            data={chartData}
            width={screenWidth}
            height={200}
            accessor="value"
            backgroundColor="transparent"
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForLabels: {
                fontSize: 12,
              },
            }}
            paddingLeft="-2"
            absolute
            hasLegend={true}
            />
          ) : (
            <Text style={styles.noDataText}>
              Tidak ada data untuk {selectedKecamatan === 'Seluruh Kota'
                ? 'ditampilkan'
                : `kecamatan ${selectedKecamatan}`}.
            </Text>
          )}
          </View>

          <View style={styles.body3}>
            <View style={styles.rowTop}>
              <Image source={require('@/assets/ikon/image.png')} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Dowload Laporan</Text>
                <Text style={styles.cardSubtitle}>Lakukan download data LTT</Text>
             </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={this.handleDownload}>
              <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>
            </View>
        </View>

        <LogoutModal
          visible={this.state.modalVisible}
          onClose={this.closeModal}
          onConfirm={this.confirmLogout}
        />
      </View>
    );
  }
}

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
  out: {
    width: 40,
    height: 40,
  },
  ket:{
    fontFamily: 'Lexend3',
  },
  body: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  body2: {
    backgroundColor: '#E9F5EC',
    paddingTop: 20,
    paddingBottom: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  body3: {
    backgroundColor: '#E9F5EC',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 10,
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
    fontSize: 17,
    fontFamily: 'Lexend4',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom:10,
    fontFamily: 'Lexend3',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    marginTop: 15,
    marginLeft:110,
    width: 160,
    height: 35,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign:'center',
    margin:'auto',
    fontFamily: 'Lexend4',
  },
  noDataText: {
    textAlign: 'center',
    fontFamily: 'Lexend3',
    marginTop: 40,
    fontSize: 13,
    color: '#666',
  },
  textContainer:{
  }
});
