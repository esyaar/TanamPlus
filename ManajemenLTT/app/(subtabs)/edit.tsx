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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { editLttById, getLttDataById } from '@/services/dataService';

export interface LttData {
  wilayah_id?: string;
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
  loading: boolean;
};

type Props = {
  route: {
    params: {
      id?: string;
    };
  };
};

class EditLTTForm extends Component<Props, State> {
  id: string;
  unsubscribe: (() => void) | null = null;

  constructor(props: Props) {
    super(props);
    this.id = props.route?.params?.id || '';
    this.state = {
      kecamatan: '',
      kelurahan: '',
      bpp: '',
      tanggalLaporan: new Date(),
      showDatePicker: false,
      komoditas: '',
      jenisLahan: '',
      luasTambahTanam: '',
      loading: true,
    };
  }

  componentDidMount() {
    if (!this.id) {
      alert('ID data tidak ditemukan.');
      router.back();
      return;
    }
  
    this.unsubscribe = getLttDataById(this.id, (docData: LttData | null) => {
      if (docData) {
        // Pastikan tipe tanggal valid
        let tanggal = new Date(docData.tanggalLaporan);
        if (isNaN(tanggal.getTime())) {
          tanggal = new Date();
        }
        this.setState({
          kecamatan: docData.kecamatan || '',
          kelurahan: docData.kelurahan || '',
          bpp: docData.bpp || '',
          tanggalLaporan: tanggal,
          komoditas: docData.komoditas || '',
          jenisLahan: docData.jenisLahan || '',
          luasTambahTanam: docData.luasTambahTanam !== undefined ? docData.luasTambahTanam.toString() : '',
          loading: false,
        });
      } else {
        alert('Data tidak ditemukan.');
        router.back();
      }
    });
  }
  

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

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

    if (!kecamatan || !kelurahan || !bpp || !komoditas || !jenisLahan || !luasTambahTanam) {
      alert('Harap lengkapi semua data!');
      return;
    }

    const dataToUpdate = {
      kecamatan,
      kelurahan,
      bpp,
      tanggalLaporan,
      komoditas,
      jenisLahan,
      luasTambahTanam: parseFloat(luasTambahTanam),
    };

    try {
      await editLttById(this.id, dataToUpdate);
      alert('Data berhasil diperbarui!');
      router.back();
    } catch (error) {
      console.error('Gagal update data LTT:', error);
      alert('Gagal memperbarui data. Silakan coba lagi.');
    }
  }

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
      loading,
    } = this.state;

    if (loading) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Memuat data...</Text>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Data Luas Tambah Tanam</Text>
              </View>

              <Text style={styles.sectionTitle}>Wilayah Kerja</Text>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={kecamatan}
                  onValueChange={(value) => this.setState({ kecamatan: value })}
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
                placeholder="BPP"
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
                    if (date) {
                      this.setState({ tanggalLaporan: date });
                    }
                  }}
                />
              )}

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={komoditas}
                  onValueChange={(value) => this.setState({ komoditas: value })}>
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
                placeholder="Luas Tambah Tanam (ha)"
                style={styles.inputBox2}
                keyboardType="numeric"
                value={luasTambahTanam}
                onChangeText={(text) => this.setState({ luasTambahTanam: text })}
              />

              <TouchableOpacity style={styles.button} onPress={this.handleSubmit}>
                <Text style={styles.buttonText}>Update</Text>
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
    backgroundColor: 'white',
    padding: 20,
    flex: 1,
  },
  header: {
    backgroundColor: '#3d5af1',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3d5af1',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 15,
    color: 'white',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#3d5af1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  inputBox2: {
    borderWidth: 1,
    borderColor: '#3d5af1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  date: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  datetext: {
    fontSize: 16,
  },
});

export default EditLTTForm;
