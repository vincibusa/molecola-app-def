import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextField, Button, Colors, Text, DateTimePicker, Picker, PickerValue } from 'react-native-ui-lib';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import { Reservation, allTimes } from '../types';
import { addReservation, getShiftsForDate } from '../services/ReservationService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

const AddReservationScreen: React.FC<Props> = ({ navigation }) => {
  const [reservation, setReservation] = useState<Partial<Reservation>>({
    fullName: '',
    phone: '',
    email: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    seats: 1,
    specialRequests: '',
  });

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableTimes();
  }, [reservation.date]);

  const loadAvailableTimes = async () => {
    if (reservation.date) {
      const shifts = await getShiftsForDate(reservation.date);
      const enabledTimes = shifts
        .filter(shift => shift.enabled)
        .map(shift => shift.time);
      setAvailableTimes(enabledTimes);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validazione
      if (!reservation.fullName || !reservation.phone || !reservation.email || 
          !reservation.date || !reservation.time || !reservation.seats) {
        Toast.show({
          type: 'error',
          text1: 'Errore',
          text2: 'Tutti i campi obbligatori devono essere compilati',
        });
        return;
      }

      // Aggiungi la prenotazione
      await addReservation(reservation as Reservation);
      
      Toast.show({
        type: 'success',
        text1: 'Prenotazione aggiunta con successo',
      });
      
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Errore',
        text2: error.message || 'Errore durante l\'aggiunta della prenotazione',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextField
          placeholder="Nome completo"
          value={reservation.fullName}
          onChangeText={(text) => setReservation({ ...reservation, fullName: text })}
          style={styles.input}
        />

        <TextField
          placeholder="Telefono"
          value={reservation.phone}
          onChangeText={(text) => setReservation({ ...reservation, phone: text })}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextField
          placeholder="Email"
          value={reservation.email}
          onChangeText={(text) => setReservation({ ...reservation, email: text })}
          keyboardType="email-address"
          style={styles.input}
        />

        <Text text70 style={styles.label}>Data</Text>
        <DateTimePicker
          mode="date"
          value={new Date(reservation.date || '')}
          onChange={(date) => setReservation({ 
            ...reservation, 
            date: format(date, 'yyyy-MM-dd'),
            time: '' // Reset time when date changes
          })}
          minimumDate={new Date()}
          style={styles.datePicker}
        />

        <Text text70 style={styles.label}>Orario</Text>
        <Picker
          value={reservation.time}
          placeholder="Seleziona orario"
          enableModalBlur={false}
          onChange={(item: PickerValue) => setReservation({ ...reservation, time: item as string })}
          style={styles.picker}
        >
          {availableTimes.map((time) => (
            <Picker.Item key={time} value={time} label={time} />
          ))}
        </Picker>

        <Text text70 style={styles.label}>Numero di persone</Text>
        <Picker
          value={reservation.seats}
          enableModalBlur={false}
          onChange={(value: PickerValue) => setReservation({ ...reservation, seats: value as number })}
          style={styles.picker}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <Picker.Item key={num} value={num} label={`${num} ${num === 1 ? 'persona' : 'persone'}`} />
          ))}
        </Picker>

        <TextField
          placeholder="Richieste speciali (opzionale)"
          value={reservation.specialRequests}
          onChangeText={(text) => setReservation({ ...reservation, specialRequests: text })}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <Button
          label={loading ? 'Caricamento...' : 'Conferma Prenotazione'}
          disabled={loading}
          backgroundColor={Colors.blue30}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  datePicker: {
    marginBottom: 16,
  },
  picker: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    height: 48,
  },
});

export default AddReservationScreen; 