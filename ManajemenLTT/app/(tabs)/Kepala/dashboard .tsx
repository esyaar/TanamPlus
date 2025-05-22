import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import LogoutModal from '@/components/ui/modalout';
import { db } from '@/services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

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
      // map komoditas → total luas
      const komoditasMap: Record<string, number> = {};
      snapshot.forEach(doc => {
        const { komoditas, kecamatan, luasTambahTanam } = doc.data();
        // filter untuk kecamatan

        if (
          this.state.selectedKecamatan === 'Seluruh Kota' ||
          kecamatan === this.state.selectedKecamatan
        ) {
          komoditasMap[komoditas] = (komoditasMap[komoditas] || 0) + (luasTambahTanam || 0);
        }
      });

      const COLORS = ['#4385FF','#FF7B6F','#FCD35C','#3D8963','#3E58A0','#98A03E','#CF57A7'];
      const chartData = Object.entries(komoditasMap).map(([name, value], i) => ({
        name,
        value,
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

          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              accessor="value"
              backgroundColor="transparent"
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              paddingLeft="15"
            />
          ) : (
            <Text style={styles.noDataText}>
              Tidak ada data untuk {selectedKecamatan === 'Seluruh Kota'
                ? 'ditampilkan'
                : `kecamatan ${selectedKecamatan}`}.
            </Text>
          )}
        </View>

        {/* LOGOUT MODAL */}
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
    fontFamily: 'Lexend',
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
    fontFamily: 'Lexend',
    fontSize: 25,
    fontWeight: 'bold',
  },
  out: {
    width: 40,
    height: 40,
  },
  ket:{
    fontFamily: 'Lexend',
  },
  body: {
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
});
