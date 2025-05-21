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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type State = {
  kecamatan: string;
  kelurahan: string;
  penyuluh: string;
};

class AddUser extends Component<{}, State> {
  state: State = {
    kecamatan: '',
    kelurahan: '',
    penyuluh: '',
  };

  handleSubmit = () => {
    const { kecamatan, kelurahan, penyuluh } = this.state;

    console.log({
        kecamatan,
        kelurahan,
        penyuluh,
    });

    router.replace('/Admin/user');
  };

  handleAddPenyuluh = () => {
    router.push('/Admin/tambahuser');
  };

  render() {
    const { kecamatan, kelurahan, penyuluh} = this.state;

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
                  <Picker.Item label="Dempo Selatan" value="dempo_selatan" />
                  <Picker.Item label="Dempo Tengah" value="dempo_tengah" />
                  <Picker.Item label="Dempo Utara" value="dempo_utara" />
                  <Picker.Item label="Pagar Alam Selatan" value="pagar_alam_selatan" />
                  <Picker.Item label="Pagar Alam Utara" value="pagar_alam_utara" />
                </Picker>
              </View>
              
              <View style={styles.inputBox}>
                <Picker 
                selectedValue={kelurahan}
                onValueChange={(value) => this.setState({ kelurahan: value })}
                >
                    <Picker.Item label="Kelurahan" value="" />
                    <Picker.Item label="Besemah" value="A" />
                    <Picker.Item label="Ayek Pacar" value="B" />
                    </Picker>
                </View>

                <Text style={styles.sectionTitle}>Penyuluh Pertanian</Text>

                <View style={styles.inputBox}>
                <Picker 
                selectedValue={penyuluh}
                onValueChange={(value) => this.setState({ penyuluh: value })}
                >
                    <Picker.Item label="Penyuluh" value="" />
                    <Picker.Item label="Besemah" value="A" />
                    <Picker.Item label="Ayek Pacar" value="B" />
                    </Picker>
                </View>

                <View style={styles.inputBox}>
                <Picker 
                selectedValue={penyuluh}
                onValueChange={(value) => this.setState({ penyuluh: value })}
                >
                    <Picker.Item label="Penyuluh" value="" />
                    <Picker.Item label="Besemah" value="A" />
                    <Picker.Item label="Ayek Pacar" value="B" />
                    </Picker>
                </View>

              <TouchableOpacity style={styles.addWilayahButton} onPress={this.handleAddPenyuluh}>
                <Text style={styles.addWilayahText}>Tambah Penyuluh</Text>
                <MaterialCommunityIcons name="plus" size={24} color="white" />
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

export default AddUser;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
  },
  container: {
    padding: 20,
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
    fontWeight: 'bold',
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
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 10,
    paddingLeft: 20,
    marginBottom: 10,
    width: 345,
    height: 50,
  },
  submitButton: {
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    paddingLeft: 10,
    fontWeight: 'bold',
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
  },
});
