import React, { Component } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { logoutUser } from '@/services/authService';
interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default class LogoutModal extends Component<Props> {
  handleLogout = async () => {
    try {
      await logoutUser(); // logout + router.replace('/')
    } catch (err: any) {
      Alert.alert('Logout gagal', err.message || 'Terjadi kesalahan');
    }
  };

  render() {
    const { visible, onClose } = this.props;

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Konfirmasi Logout</Text>
            <Text style={styles.message}>Apakah kamu yakin ingin logout?</Text>
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={this.handleLogout}>
                <Text style={styles.confirmText}>Ya</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Lexend4',
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Lexend2',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 5,
    backgroundColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 5,
    backgroundColor: '#40744E',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#000',
    fontFamily: 'Lexend2',
  },
  confirmText: {
    color: '#fff',
    fontFamily: 'Lexend2',
  },
});
