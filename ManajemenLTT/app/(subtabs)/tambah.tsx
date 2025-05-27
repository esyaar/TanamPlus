import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addLtt } from '@/services/dataService';

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
    } = this.state;

    if (
      !kecamatan ||
      !kelurahan ||
      !bpp ||
      !komoditas ||
      !jenisLahan ||
      !luasTambahTanam
    ) {
      Alert.alert('Validasi', 'Mohon lengkapi semua data sebelum mengirim.');
      return;
    }

    const payload: CreateLttData = {
      wilayah_id: kecamatan,
      bpp,
      tanggalLaporan,
      kecamatan,
      kelurahan,
      komoditas,
      jenisLahan,
      luasTambahTanam: parseFloat(luasTambahTanam),
    };

    try {
      const newId = await addLtt(payload);
      console.log('Data LTT berhasil ditambahkan dengan ID:', newId);
      Alert.alert('Sukses', 'Data berhasil ditambahkan!');

      // Reset form
      this.setState({
        kecamatan: '',
        kelurahan: '',
        bpp: '',
        tanggalLaporan: new Date(),
        komoditas: '',
        jenisLahan: '',
        luasTambahTanam: '',
      });

      // Navigate back
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
    } = this.state;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
                onValueChange={(value) => this.setState({ kecamatan: value })}
                itemStyle={{ fontFamily: 'Lexend3', fontSize: 13 }}
              >
                <Picker.Item label="Kecamatan" value="" />
                  <Picker.Item label="Dempo Selatan" value="Dempo Selatan" />
                  <Picker.Item label="Dempo Tengah" value="Dempo Tengah" />
                  <Picker.Item label="Dempo Utara" value="Dempo Utara" />
                  <Picker.Item label="Pagar Alam Selatan" value="Pagar Alam Selatan" />
                  <Picker.Item label="Pagar Alam Utara" value="Pagar Alam Utara" />
              </Picker>
            </View>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={kelurahan}
                  onValueChange={(value) => this.setState({ kelurahan: value })}
                >
                  <Picker.Item label="Kelurahan" value="" />
                  <Picker.Item label="Agung Lawongan" value="Agung Lawongan" />
                  <Picker.Item label="Alun Dua" value="Alun Dua" />
                  <Picker.Item label="Atung Bungsu" value="Atung Bungsu" />
                  <Picker.Item label="Bangun Jaya" value="Bangun Jaya" />
                  <Picker.Item label="Bangun Rejo" value="Bangun Rejo" />
                  <Picker.Item label="Beringin Jaya" value="Beringin Jaya" />
                  <Picker.Item label="Besemah Serasan" value="Besemah Serasan" />
                  <Picker.Item label="Bumi Agung" value="Bumi Agung" />
                  <Picker.Item label="Burung Dinang" value="Burung Dinang" />
                  <Picker.Item label="Candi Jaya" value="Candi Jaya" />
                  <Picker.Item label="Curup Jare" value="Curup Jare" />
                  <Picker.Item label="Dempo Makmur" value="Dempo Makmur" />
                  <Picker.Item label="Gunung Dempo" value="Gunung Dempo" />
                  <Picker.Item label="Jangkar Mas" value="Jangkar Mas" />
                  <Picker.Item label="Jokoh" value="Jokoh" />
                  <Picker.Item label="Kance Diwe" value="Kance Diwe" />
                  <Picker.Item label="Karang Dalo" value="Karang Dalo" />
                  <Picker.Item label="Kusipan Babas" value="Kusipan Babas" />
                  <Picker.Item label="Lubuk Buntak" value="Lubuk Buntak" />
                  <Picker.Item label="Muara Siban" value="Muara Siban" />
                  <Picker.Item label="Nendagung" value="Nendagung" />
                  <Picker.Item label="Padang Temu" value="Padang Temu" />
                  <Picker.Item label="Pagar Wangi" value="Pagar Wangi" />
                  <Picker.Item label="Pagaralam" value="Pagaralam" />
                  <Picker.Item label="Pelang Kenidai" value="Pelang Kenidai" />
                  <Picker.Item label="Penjalang" value="Penjalang" />
                  <Picker.Item label="Prabu Dipo" value="Prabu Dipo" />
                  <Picker.Item label="Reba Tinggi" value="Reba Tinggi" />
                  <Picker.Item label="Selibar" value="Selibar" />
                  <Picker.Item label="Sidorejo" value="Sidorejo" />
                  <Picker.Item label="Sukorejo" value="Sukorejo" />
                  <Picker.Item label="Tanjung Payang" value="Tanjung Payang" />
                  <Picker.Item label="Tebat Giri Indah" value="Tebat Giri Indah" />
                  <Picker.Item label="Tumbak Ulas" value="Tumbak Ulas" />
                  <Picker.Item label="Ulu Rurah" value="Ulu Rurah" />
                </Picker>
              </View>

              <TextInput
                placeholder="Nama BPP"
                style={styles.inputBox2}
                value={bpp}
                onChangeText={(text) => this.setState({ bpp: text })}
              />

              <Text style={styles.sectionTitle}>Data Laporan</Text>

              <TouchableOpacity
                onPress={() => this.setState({ showDatePicker: true })}
                style={styles.date}
              >
                <Text style={styles.datetext}>{tanggalLaporan.toDateString()}</Text>
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
                >
                  <Picker.Item label="Jenis Komoditas Pangan" value="" />
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
                >
                  <Picker.Item label="Jenis Lahan" value="" />
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
    alignContent: 'center',
    marginBottom: 7,
    width: 345,
    height: 50,
    fontFamily: 'Lexend3',
    fontSize: 13,
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    alignContent: 'center',
    paddingLeft: 20,
    marginBottom: 7,
    width: 345,
    height: 50,
    fontFamily: 'Lexend3',
    fontSize: 13,
  },
  date: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    alignContent: 'center',
    marginBottom: 7,
    width: 345,
    height: 50,
  },
  datetext: {
    paddingLeft: 20,
    paddingTop: 15,
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