import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Reservation } from '../types';

interface EditReservationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updatedReservation: Partial<Reservation>) => void;
  reservation: Reservation;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  visible,
  onClose,
  onSave,
  reservation,
}) => {
  const [time, setTime] = useState(reservation.time);
  const [seats, setSeats] = useState(reservation.seats.toString());
  const [specialRequests, setSpecialRequests] = useState(reservation.specialRequests || '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    onSave({
      time,
      seats: parseInt(seats),
      specialRequests,
    });
    onClose();
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifica Prenotazione</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Orario</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{time}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numero di persone</Text>
            <TextInput
              style={styles.input}
              value={seats}
              onChangeText={setSeats}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Richieste speciali</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Annulla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>Salva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${time}`)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
              textColor="#000000"
                accentColor="#2962ff"
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#191919',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4a4a4a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#2962ff',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
  },
});

export default EditReservationModal; 