import React, { useState, useEffect } from 'react';
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
  Keyboard,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { editLttById, fetchLttById } from '@/services/dataService';
import { subscribeToWilayahByPenyuluh, WilayahData } from '@/services/wilayahService';
import { getCurrentUser } from '@/services/authService';

interface LttData {
  id: string;
  wilayah_id?: string;
  bpp: string;
  tanggalLaporan: Date;
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
}

const EditLTTForm: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [state, setState] = useState({
    kecamatan: '',
    kelurahan: '',
    bpp: '',
    tanggalLaporan: new Date(),
    showDatePicker: false,
    komoditas: '',
    jenisLahan: '',
    luasTambahTanam: '',
    loading: true,
    wilayahData: [] as WilayahData[],
    filteredKelurahan: [] as string[],
    currentUserId: null as string | null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initialize = async () => {
      try {
        const user = await getCurrentUser();
        if (!user || !user.id) {
          Alert.alert('Error', 'Gagal mendapatkan data pengguna. Silakan login kembali.');
          router.replace('@/index');
          return;
        }

        setState((prev) => ({ ...prev, currentUserId: user.id }));

        unsubscribe = subscribeToWilayahByPenyuluh(user.id, (items, error) => {
          if (error) {
            Alert.alert('Error', error);
            return;
          }
          setState((prev) => ({ ...prev, wilayahData: items }));
        });

        if (!id) {
          Alert.alert('Error', 'ID data tidak ditemukan.');
          router.back();
          return;
        }

        const docData = await fetchLttById(id as string);
        if (docData) {
          let tanggal = new Date(docData.tanggalLaporan);
          if (isNaN(tanggal.getTime())) {
            tanggal = new Date();
          }
          setState((prev) => ({
            ...prev,
            kecamatan: docData.kecamatan || '',
            kelurahan: docData.kelurahan || '',
            bpp: docData.bpp || '',
            tanggalLaporan: tanggal,
            komoditas: docData.komoditas || '',
            jenisLahan: docData.jenisLahan || '',
            luasTambahTanam: docData.luasTambahTanam !== undefined ? docData.luasTambahTanam.toString() : '',
            loading: false,
            filteredKelurahan: prev.wilayahData
              .filter((item) => item.kecamatan === docData.kecamatan)
              .map((item) => item.kelurahan),
          }));
        } else {
          Alert.alert('Error', 'Data tidak ditemukan.');
          router.back();
        }
      } catch (error) {
        console.error('Gagal mengambil data:', error);
        Alert.alert('Error', 'Gagal mengambil data. Silakan coba lagi.');
        router.back();
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  const handleKecamatanChange = (kecamatan: string) => {
    const filteredKelurahan = state.wilayahData
      .filter((item) => item.kecamatan === kecamatan)
      .map((item) => item.kelurahan);
    setState((prev) => ({ ...prev, kecamatan, kelurahan: '', filteredKelurahan }));
  };

  const handleSubmit = async () => {
    const {
      kecamatan,
      kelurahan,
      bpp,
      tanggalLaporan,
      komoditas,
      jenisLahan,
      luasTambahTanam,
      currentUserId,
      wilayahData,
    } = state;

    if (!currentUserId) {
      Alert.alert('Error', 'User not authenticated. Please log in again.');
      router.replace('/index');
      return;
    }

    if (!kecamatan || !kelurahan || !bpp || !komoditas || !jenisLahan || !luasTambahTanam) {
      Alert.alert('Validasi', 'Harap lengkapi semua data!');
      return;
    }

    const luasTambahTanamNum = parseFloat(luasTambahTanam);
    if (isNaN(luasTambahTanamNum)) {
      Alert.alert('Validasi', 'Luas Tambah Tanam harus berupa angka valid.');
      return;
    }

    const wilayah = wilayahData.find(
      (item) => item.kecamatan === kecamatan && item.kelurahan === kelurahan,
    );

    const dataToUpdate = {
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
      await editLttById(id as string, dataToUpdate);
      Alert.alert('Sukses', 'Data berhasil diperbarui!');
      router.back();
    } catch (error) {
      console.error('Gagal update data LTT:', error);
      Alert.alert('Error', 'Gagal memperbarui data. Silakan coba lagi.');
    }
  };

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
    wilayahData,
    filteredKelurahan,
  } = state;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Memuat data...</Text>
      </View>
    );
  }

  const kecamatanOptions = Array.from(new Set(wilayahData.map((item) => item.kecamatan)));

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
                onValueChange={handleKecamatanChange}
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
                onValueChange={(value) => setState((prev) => ({ ...prev, kelurahan: value }))}
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
              onChangeText={(text) => setState((prev) => ({ ...prev, bpp: text }))}
            />

            <Text style={styles.sectionTitle}>Data Laporan</Text>

            <TouchableOpacity
              onPress={() => setState((prev) => ({ ...prev, showDatePicker: true }))}
              style={styles.date}
            >
              <Text style={styles.dateText}>{tanggalLaporan.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={tanggalLaporan}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setState((prev) => ({
                    ...prev,
                    showDatePicker: false,
                    tanggalLaporan: date || prev.tanggalLaporan,
                  }));
                }}
              />
            )}

            <View style={styles.inputBox}>
              <Picker
                selectedValue={komoditas}
                onValueChange={(value) => setState((prev) => ({ ...prev, komoditas: value }))}
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
                onValueChange={(value) => setState((prev) => ({ ...prev, jenisLahan: value }))}
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
              onChangeText={(text) => setState((prev) => ({ ...prev, luasTambahTanam: text }))}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Perbarui Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

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

export default EditLTTForm;