import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebaseConfig';
import { wilayahService, CreateWilayah } from '@/services/wilayahService';

export class User {
  constructor(public id: string, public name: string, public role: string) {}

  static fromFirestore(doc: any): User {
    const data = doc.data();
    return new User(doc.id, data.name, data.role);
  }
}

type State = {
  id: string;
  users_id: string;
  kecamatan: string;
  kelurahan: string;
  penyuluh1: string;
  penyuluh2: string;
  penyuluh3: string;
  penyuluhList: User[];
  showAdditionalPicker: boolean;
  availableKelurahan: string[]; 
};

const kecamatanToKelurahan: { [key: string]: string[] } = {
  'Dempo Selatan': ['Agung Lawongan', 'Alun Dua', 'Atung Bungsu'],
  'Dempo Tengah': ['Bangun Jaya', 'Bangun Rejo', 'Beringin Jaya'],
  'Dempo Utara': ['Besemah Serasan', 'Bumi Agung', 'Burung Dinang'],
  'Pagar Alam Selatan': ['Candi Jaya', 'Curup Jare', 'Dempo Makmur'],
  'Pagar Alam Utara': ['Gunung Dempo', 'Jangkar Mas', 'Jokoh'],
};

class AddWilayah extends Component<{}, State> {
  state: State = {
    id: '',
    users_id: '',
    kecamatan: '',
    kelurahan: '',
    penyuluh1: '',
    penyuluh2: '',
    penyuluh3: '',
    penyuluhList: [],
    showAdditionalPicker: false,
    availableKelurahan: []
  };

  handleKecamatanChange = (kecamatan: string) => {
    const availableKelurahan = kecamatanToKelurahan[kecamatan] || [];
    this.setState({
      kecamatan,
      kelurahan: '',
      availableKelurahan,
    });
    console.log('Kecamatan changed:', kecamatan, 'Available Kelurahan:', availableKelurahan);
  };

  toggleAdditionalPicker = () => {
    this.setState(prevState => ({
      showAdditionalPicker: !prevState.showAdditionalPicker,
      penyuluh3: prevState.showAdditionalPicker ? '' : prevState.penyuluh3,
    }));
  };

  unsubscribeUsers: (() => void) | null = null;

  componentDidMount() {
    const q = query(collection(db, 'users'), where('role', '==', 'penyuluh'));
    this.unsubscribeUsers = onSnapshot(q, (querySnapshot) => {
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        users.push(User.fromFirestore(doc));
      });
      this.setState({ penyuluhList: users });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeUsers) this.unsubscribeUsers();
  }

  handleSubmit = async () => {
    const { kecamatan, kelurahan, penyuluh1, penyuluh2, penyuluh3, penyuluhList } = this.state;

    if (!kecamatan || !kelurahan || !penyuluh1) {
      Alert.alert('Validasi', 'Mohon lengkapi semua data sebelum mengirim.');
      return;
    }

    try {
      const getPenyuluhName = (id: string) => penyuluhList.find(user => user.id === id)?.name || '';

      const penyuluhData = [
        penyuluh1 && { id: penyuluh1, name: getPenyuluhName(penyuluh1) },
        penyuluh2 && { id: penyuluh2, name: getPenyuluhName(penyuluh2) },
        penyuluh3 && { id: penyuluh3, name: getPenyuluhName(penyuluh3) },
      ].filter(Boolean); 

      const wilayahData: CreateWilayah = {
        user_id: penyuluh1,
        kecamatan,
        kelurahan,
        penyuluh: penyuluhData, 
      };

      const docId = await wilayahService.addWilayah(wilayahData);
      Alert.alert('Sukses', 'Data wilayah berhasil disimpan!', [
        { text: 'OK', onPress: () => router.back() }, 
      ]);
      console.log('Data tersimpan dengan ID:', docId);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data wilayah. Silakan coba lagi.');
      console.error('Error saat menyimpan data:', error);
    }
  };

  render() {
    const {
      kecamatan,
      kelurahan,
      penyuluh1,
      penyuluh2,
      penyuluh3,
      penyuluhList,
      showAdditionalPicker,
    } = this.state;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.inner}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Tambah Wilayah Kerja</Text>
              </View>

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

              <Text style={styles.sectionTitle}>Penyuluh Pertanian</Text>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={penyuluh1}
                  onValueChange={(value) => this.setState({ penyuluh1: value })}
                >
                  <Picker.Item label="Pilih Penyuluh 1" value="" />
                  {penyuluhList.map((user) => (
                    <Picker.Item key={user.id} label={user.name} value={user.id} />
                  ))}
                </Picker>
              </View>

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={penyuluh2}
                  onValueChange={(value) => this.setState({ penyuluh2: value })}
                >
                  <Picker.Item label="Pilih Penyuluh 2" value="" />
                  {penyuluhList.map((user) => (
                    <Picker.Item key={user.id + '_2'} label={user.name} value={user.id} />
                  ))}
                </Picker>
              </View>

              {showAdditionalPicker && (
                <View style={styles.inputBox}>
                  <Picker
                    selectedValue={penyuluh3}
                    onValueChange={(value) => this.setState({ penyuluh3: value })}
                  >
                    <Picker.Item label="Pilih Penyuluh 3" value="" />
                    {penyuluhList.map((user) => (
                      <Picker.Item key={user.id + '_3'} label={user.name} value={user.id} />
                    ))}
                  </Picker>
                </View>
              )}

              <TouchableOpacity style={styles.addWilayahButton} onPress={this.toggleAdditionalPicker}>
                <Text style={styles.addWilayahText}>
                  {showAdditionalPicker ? 'Hapus Penyuluh' : 'Tambah Penyuluh'}
                </Text>
                <MaterialCommunityIcons name={showAdditionalPicker ? 'minus' : 'plus'} size={24} color="white" />
              </TouchableOpacity>

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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
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
  inputBox: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 10,
    width: 345,
    height: 50,
    paddingHorizontal: 10,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 16,
  },
  sectionTitle: {
    paddingLeft: 10,
    fontFamily: 'Lexend4',
    marginBottom: 15,
    marginTop: 15,
  },
  addWilayahButton: {
    backgroundColor: '#40744E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addWilayahText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Lexend4',
  },
});

export default AddWilayah;