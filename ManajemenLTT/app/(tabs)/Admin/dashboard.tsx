import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { router } from 'expo-router';
import LogoutModal from '@/components/ui/modalout';
import { Picker } from '@react-native-picker/picker';
import { printToFileAsync } from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LttData, fetchLttDataOnce } from '@/services/dataService';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface GroupedData {
  komoditas: string;
  luasTambahTanam: number;
}

interface ReportData {
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
}

interface State {
  modalVisible: boolean;
  selectedKecamatan: string;
  kecamatanList: string[];
  selectedMonth: string;
  monthList: string[];
  chartData: ChartData[];
}

export default class Dashboard extends Component<{}, State> {
  state: State = {
    modalVisible: false,
    selectedKecamatan: 'Kota Pagar Alam',
    kecamatanList: [],
    selectedMonth: `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    monthList: [],
    chartData: [],
  };

  async componentDidMount() {
    try {
      const lttData = await fetchLttDataOnce();
      const kecSet = new Set<string>();
      const monthSet = new Set<string>();

      lttData.forEach(data => {
        if (data.kecamatan) kecSet.add(data.kecamatan);
        if (data.tanggalLaporan instanceof Date && !isNaN(data.tanggalLaporan.getTime())) {
          const date = data.tanggalLaporan;
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          monthSet.add(monthYear);
        }
      });

      this.setState(
        {
          kecamatanList: Array.from(kecSet).sort(),
          monthList: ['Semua Bulan', ...Array.from(monthSet).sort()],
        },
        () => this.fetchChartData()
      );
    } catch (e) {
      console.error('Error in componentDidMount:', e);
      Alert.alert('Error', 'Gagal memuat data awal. Silakan coba lagi.');
    }
  }

  componentDidUpdate(_: {}, prevState: State) {
    if (
      prevState.selectedKecamatan !== this.state.selectedKecamatan ||
      prevState.selectedMonth !== this.state.selectedMonth
    ) {
      this.fetchChartData();
    }
  }

  fetchChartData = async () => {
    try {
      const lttData = await fetchLttDataOnce();
      const groupedData: Record<string, GroupedData> = {};

      lttData.forEach(data => {
        if (!data.komoditas || !data.luasTambahTanam || !data.tanggalLaporan) return;
        const date = data.tanggalLaporan;
        if (!(date instanceof Date && !isNaN(date.getTime()))) return;
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (
          (this.state.selectedKecamatan === 'Kota Pagar Alam' || data.kecamatan === this.state.selectedKecamatan) &&
          (this.state.selectedMonth === 'Semua Bulan' || monthYear === this.state.selectedMonth)
        ) {
          const key =
            this.state.selectedKecamatan === 'Kota Pagar Alam'
              ? data.komoditas.toLowerCase()
              : `${data.kecamatan}:${data.komoditas.toLowerCase()}`;

          if (groupedData[key]) {
            groupedData[key].luasTambahTanam += data.luasTambahTanam;
          } else {
            groupedData[key] = {
              komoditas: data.komoditas,
              luasTambahTanam: data.luasTambahTanam,
            };
          }
        }
      });

      const COLORS: string[] = ['#4385FF', '#FF7B6F', '#FCD35C', '#3D8963', '#3E58A0', '#98A03E', '#CF57A7'];
      const chartData: ChartData[] = Object.values(groupedData).map((item, i) => ({
        name: item.komoditas,
        value: item.luasTambahTanam,
        color: COLORS[i % COLORS.length],
      }));

      this.setState({ chartData });
    } catch (e) {
      console.error('Error fetchChartData:', e);
      Alert.alert('Error', 'Gagal memuat data grafik. Silakan coba lagi.');
    }
  };

  openModal = () => this.setState({ modalVisible: true });
  closeModal = () => this.setState({ modalVisible: false });
  confirmLogout = () => {
    this.closeModal();
    router.push('./index');
  };

  handleDownload = async () => {
    try {
      const lttData = await fetchLttDataOnce();
      const groupedData: Record<string, ReportData> = {};

      lttData.forEach(data => {
        if (!data.kecamatan || !data.kelurahan || !data.komoditas || !data.jenisLahan || !data.tanggalLaporan) return;
        const date = data.tanggalLaporan;
        if (!(date instanceof Date && !isNaN(date.getTime()))) return;
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        if (
          (this.state.selectedKecamatan === 'Kota Pagar Alam' || data.kecamatan === this.state.selectedKecamatan) &&
          (this.state.selectedMonth === 'Semua Bulan' || monthYear === this.state.selectedMonth)
        ) {
          const key = `${data.kecamatan}:${data.kelurahan}:${data.komoditas}:${data.jenisLahan}`;
          if (groupedData[key]) {
            groupedData[key].luasTambahTanam += data.luasTambahTanam || 0;
          } else {
            groupedData[key] = {
              kecamatan: data.kecamatan,
              kelurahan: data.kelurahan,
              komoditas: data.komoditas,
              jenisLahan: data.jenisLahan,
              luasTambahTanam: data.luasTambahTanam || 0,
            };
          }
        }
      });

      const data = Object.values(groupedData).sort((a, b) => {
        if (a.kecamatan !== b.kecamatan) {
          return a.kecamatan.localeCompare(b.kecamatan);
        }
        if (a.kelurahan !== b.kelurahan) {
          return a.kelurahan.localeCompare(b.kelurahan);
        }
        if (a.komoditas !== b.komoditas) {
          return a.komoditas.localeCompare(b.komoditas);
        }
        return a.jenisLahan.localeCompare(b.jenisLahan);
      });

      if (data.length === 0) {
        Alert.alert(
          'Tidak Ada Data',
          `Tidak ada data untuk ${this.state.selectedKecamatan} pada ${
            this.state.selectedMonth === 'Semua Bulan'
              ? 'semua bulan'
              : new Date(this.state.selectedMonth + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })
          }.`
        );
        return;
      }

      const monthDisplay =
        this.state.selectedMonth === 'Semua Bulan'
          ? 'Semua Bulan'
          : new Date(this.state.selectedMonth + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' });

      const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 25px; }
          h2 { text-align: center; color: #000000; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { border: 1px solid #ddd; padding: 5px; text-align: center; }
          td { border: 1px solid #ddd; padding: 5px; text-align: left; }
          th { background-color: #E9F5EC; }
        </style>
      </head>
      <body>
        <h2>Laporan Luas Tambah Tanam (LTT) <br> ${this.state.selectedKecamatan} - ${monthDisplay}</h2>
        <table>
          <tr>
            <th>Kecamatan</th>
            <th>Kelurahan</th>
            <th>Komoditas</th>
            <th>Jenis Lahan</th>
            <th>Luas Tambah Tanam (Ha)</th>
          </tr>
          ${data
            .map(
              item => `
            <tr>
              <td>${item.kecamatan || 'N/A'}</td>
              <td>${item.kelurahan || 'N/A'}</td>
              <td>${item.komoditas || 'N/A'}</td>
              <td>${item.jenisLahan || 'N/A'}</td>
              <td>${Math.floor(item.luasTambahTanam)} Ha</td>
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

      const fileName = `LTT_${this.state.selectedKecamatan}_${this.state.selectedMonth === 'Semua Bulan' ? 'All' : this.state.selectedMonth}.pdf`;
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
    const { selectedKecamatan, kecamatanList, selectedMonth, monthList, chartData } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Dashboard</Text>
          <TouchableOpacity onPress={this.openModal}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.pickerContainer}>
            <View style={styles.kecamatanPickerWrapper}>
              <Picker
                style={styles.ket}
                selectedValue={selectedKecamatan}
                onValueChange={value => this.setState({ selectedKecamatan: value })}
              >
                <Picker.Item label="Kota Pagar Alam" value="Kota Pagar Alam" />
                {kecamatanList.map(kec => (
                  <Picker.Item key={kec} label={kec} value={kec} />
                ))}
              </Picker>
            </View>
            <View style={styles.monthPickerWrapper}>
              <Picker
                style={styles.ket}
                selectedValue={selectedMonth}
                onValueChange={value => this.setState({ selectedMonth: value })}
              >
                {monthList.map(month => (
                  <Picker.Item
                    key={month}
                    label={month === 'Semua Bulan' ? 'Semua Bulan' : new Date(month + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    value={month}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.body2}>
            {chartData.length > 0 ? (
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
                Tidak ada data untuk {selectedKecamatan === 'Kota Pagar Alam'
                  ? 'Kota Pagar Alam'
                  : `kecamatan ${selectedKecamatan}`} pada {
                  this.state.selectedMonth === 'Semua Bulan'
                    ? 'semua bulan'
                    : new Date(this.state.selectedMonth + '-01').toLocaleString('id-ID', { month: 'long', year: 'numeric' })
                }.
              </Text>
            )}
          </View>

          <View style={styles.body3}>
            <View style={styles.rowTop}>
              <Image source={require('@/assets/ikon/image.png')} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Download Laporan</Text>
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
    ket: {
      fontFamily: 'Lexend3',
      marginBottom: 10,
    },
    body: {
      padding: 20,
      marginTop: 5,
      marginBottom: 20,
    },
    pickerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    kecamatanPickerWrapper: {
      flex: 3.5, 
      marginHorizontal: 5,
    },
    monthPickerWrapper: {
      flex: 2, 
      marginHorizontal: 5,
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
      fontSize: 16,
      textAlign: 'center',
      margin: 'auto',
      fontFamily: 'Lexend4',
    },
    noDataText: {
      textAlign: 'center',
      fontFamily: 'Lexend3',
      marginTop: 40,
      fontSize: 13,
      color: '#666',
    },
    textContainer: {},
});