import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addLtt } from '@/services/dataService'; // Assuming addLtt is updated
import { subscribeToWilayahByPenyuluh, WilayahData } from '@/services/wilayahService';
import { getCurrentUser } from '@/services/authService';

export interface CreateLttData {
  wilayah_id: string;
  bpp: string;
  tanggalLaporan: Date;
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
}

type State = {
  kecamatan: string;
  kelurahan: string;
  bpp: string;
  tanggalLaporan: Date;
  showDatePicker: boolean;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: string;
  wilayahData: WilayahData[];
  filteredKelurahan: string[];
  currentUserId: string | null; // Add currentUserId to state
};

class InputLTTForm extends Component<{}, State> {
  state: State = {
    kecamatan: '',
    kelurahan: '',
    bpp: '',
    tanggalLaporan: new Date(),
    showDatePicker: false,
    komoditas: '',
    jenisLahan: '',
    luasTambahTanam: '',
    wilayahData: [],
    filteredKelurahan: [],
    currentUserId: null, // Initialize currentUserId
  };

  unsubscribe: (() => void) | null = null;

  async componentDidMount() {
    try {
      const user = await getCurrentUser();
      if (user && user.id) {
        this.setState({ currentUserId: user.id }); // Set the current user ID
        this.unsubscribe = subscribeToWilayahByPenyuluh(user?.id || null, (items, error) => {
          if (error) {
            Alert.alert('Error', error);
            return;
          }
          this.setState({ wilayahData: items });
        });
      } else {
        Alert.alert('Error', 'Gagal mendapatkan data pengguna. Silakan login kembali.');
        router.replace('/index'); // Redirect to login if user not found
      }
    } catch (error) {
      console.error('Gagal mendapatkan pengguna:', error);
      Alert.alert('Error', 'Gagal mendapatkan data pengguna. Silakan login kembali.');
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleKecamatanChange = (kecamatan: string) => {
    const filteredKelurahan = this.state.wilayahData
      .filter((item) => item.kecamatan === kecamatan)
      .map((item) => item.kelurahan);
    this.setState({ kecamatan, kelurahan: '', filteredKelurahan });
  };

  handleSubmit = async () => {
    const {
      kecamatan,
      kelurahan,
      bpp,
      tanggalLaporan,
      komoditas,
      jenisLahan,
      luasTambahTanam,
      currentUserId, // Get currentUserId from state
    } = this.state;

    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      router.replace('/index');
      return;
    }

    if (!kecamatan || !kelurahan || !bpp || !komoditas || !jenisLahan || !luasTambahTanam) {
      Alert.alert('Validasi', 'Mohon lengkapi semua data sebelum mengirim.');
      return;
    }

    const luasTambahTanamNum = parseFloat(luasTambahTanam);
    if (isNaN(luasTambahTanamNum)) {
      Alert.alert('Validasi', 'Luas Tambah Tanam harus berupa angka valid.');
      return;
    }

    const wilayah = this.state.wilayahData.find(
      (item) => item.kecamatan === kecamatan && item.kelurahan === kelurahan,
    );

    const payload = {
      userId: currentUserId, // Include userId in the payload
      wilayah_id: wilayah?.id || kecamatan,
      bpp,
      tanggalLaporan,
      kecamatan,
      kelurahan,
      komoditas,
      jenisLahan,
      luasTambahTanam: luasTambahTanamNum,
    };

    try {
      const newId = await addLtt(payload);
      console.log('Data LTT berhasil ditambahkan dengan ID:', newId);
      Alert.alert('Sukses', 'Data berhasil ditambahkan!');

      this.setState({
        kecamatan: '',
        kelurahan: '',
        bpp: '',
        tanggalLaporan: new Date(),
        komoditas: '',
        jenisLahan: '',
        luasTambahTanam: '',
        filteredKelurahan: [],
      });

      router.replace('/(tabs)/Penyuluh/homepage');
    } catch (error) {
      console.error('Gagal menambahkan data LTT:', error);
      Alert.alert('Error', 'Gagal menambahkan data. Silakan coba lagi nanti.');
    }
  };

  handleNavigate = () => {
    router.replace('/(tabs)/Penyuluh/homepage');
  };

  render() {
    const {
      kecamatan,
      kelurahan,
      bpp,
      tanggalLaporan,
      showDatePicker,
      komoditas,
      jenisLahan,
      luasTambahTanam,
      wilayahData,
      filteredKelurahan,
    } = this.state;

    const kecamatanOptions = Array.from(new Set(wilayahData.map((item) => item.kecamatan)));

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={this.handleNavigate}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Input Data Luas Tambah Tanam</Text>
              </View>

              <Text style={styles.sectionTitle}>Wilayah Kerja</Text>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={kecamatan}
                  onValueChange={this.handleKecamatanChange}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Pilih Kecamatan" value="" />
                  {kecamatanOptions.map((kec) => (
                    <Picker.Item key={kec} label={kec} value={kec} />
                  ))}
                </Picker>
              </View>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={kelurahan}
                  onValueChange={(value) => this.setState({ kelurahan: value })}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={filteredKelurahan.length > 0}
                >
                  <Picker.Item label="Pilih Kelurahan" value="" />
                  {filteredKelurahan.map((kel) => (
                    <Picker.Item key={kel} label={kel} value={kel} />
                  ))}
                </Picker>
              </View>

              <TextInput
                placeholder="Nama BPP"
                style={styles.inputBox2}
                value={bpp}
                onChangeText={(text) => this.setState({ bpp: text })}
              />

              <Text style={styles.sectionTitle}>Data Laporan</Text>

              <TouchableOpacity onPress={() => this.setState({ showDatePicker: true })} style={styles.date}>
                <Text style={styles.dateText}>{tanggalLaporan.toDateString()}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={tanggalLaporan}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    this.setState({ showDatePicker: false });
                    if (date) this.setState({ tanggalLaporan: date });
                  }}
                />
              )}

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={komoditas}
                  onValueChange={(value) => this.setState({ komoditas: value })}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Pilih Jenis Komoditas Pangan" value="" />
                  <Picker.Item label="Padi" value="Padi" />
                  <Picker.Item label="Jagung" value="Jagung" />
                  <Picker.Item label="Kedelai" value="Kedelai" />
                  <Picker.Item label="Kacang Tanah" value="Kacang Tanah" />
                  <Picker.Item label="Kacang Hijau" value="Kacang Hijau" />
                  <Picker.Item label="Singkong" value="Singkong" />
                  <Picker.Item label="Ubi Jalar" value="Ubi Jalar" />
                  <Picker.Item label="Sorgum" value="Sorgum" />
                  <Picker.Item label="Gandum" value="Gandum" />
                  <Picker.Item label="Talas" value="Talas" />
                  <Picker.Item label="Ganyong" value="Ganyong" />
                  <Picker.Item label="Umbi Lainnya" value="Umbi Lainnya" />
                </Picker>
              </View>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={jenisLahan}
                  onValueChange={(value) => this.setState({ jenisLahan: value })}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Pilih Jenis Lahan" value="" />
                  <Picker.Item label="Sawah" value="Sawah" />
                  <Picker.Item label="Non-Sawah" value="Non-Sawah" />
                </Picker>
              </View>

              <TextInput
                placeholder="Luas Tambah Tanam Harian (Ha)"
                style={styles.inputBox2}
                keyboardType="numeric"
                value={luasTambahTanam}
                onChangeText={(text) => this.setState({ luasTambahTanam: text })}
              />

              <TouchableOpacity style={styles.submitButton} onPress={this.handleSubmit}>
                <Text style={styles.submitText}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#40744E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 5,
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 13,
  },
  button: {
    marginRight: 10,
  },
  sectionTitle: {
    paddingLeft: 10,
    fontFamily: 'Lexend4',
    fontSize: 13,
    marginBottom: 15,
    marginTop: 15,
  },
  inputBox: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    marginBottom: 7,
    width: 345,
    height: 50,
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    paddingLeft: 20,
    marginBottom: 7,
    width: 345,
    height: 50,
    fontFamily: 'Lexend3',
    fontSize: 13,
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  pickerItem: {
    fontFamily: 'Lexend3',
    fontSize: 13,
  },
  date: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    marginBottom: 7,
    width: 345,
    height: 50,
    justifyContent: 'center',
  },
  dateText: {
    paddingLeft: 20,
    fontFamily: 'Lexend3',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 90,
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 16,
  },
});

export default InputLTTForm;