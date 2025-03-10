import { ref, get, set, push, update, remove, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database } from '../config/firebase-config';
import { Reservation, Shift, allTimes } from '../types';
import { scheduleLocalNotification } from './NotificationService';
import { format } from 'date-fns';
import { sendAcceptanceEmail, sendRejectionEmail } from './EmailService';

// Mantieni un Set globale per le notifiche già mostrate
let globalProcessedNotifications = new Set<string>();

export const initializeShiftsForDate = async (date: string): Promise<void> => {
    const shiftsRef = ref(database, `shifts/${date}`);
    const defaultShifts: Shift[] = allTimes.map((time: string) => {
        const enabled = (time === "19:00" || time === "20:00" || time === "21:30");
        return { time, enabled, maxReservations: 15 };
    });
    for (const shift of defaultShifts) {
        await set(ref(database, `shifts/${date}/${shift.time}`), shift);
    }
};

export const updateShift = async (
    date: string,
    time: string,
    shift: Partial<Shift>
): Promise<void> => {
    const shiftRef = ref(database, `shifts/${date}/${time}`);
    await update(shiftRef, shift);
};

export const getShiftsForDate = async (date: string): Promise<Shift[]> => {
    const shiftsRef = ref(database, `shifts/${date}`);
    const snapshot = await get(shiftsRef);
    const shifts: Shift[] = [];
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            shifts.push(childSnapshot.val());
        });
    }
    return shifts;
};

export const addReservation = async (reservation: Reservation): Promise<string | null> => {
    try {
        // Verifica che il turno esista e sia abilitato
        const shiftRef = ref(database, `shifts/${reservation.date}/${reservation.time}`);
        const shiftSnapshot = await get(shiftRef);
        if (!shiftSnapshot.exists() || !shiftSnapshot.val().enabled) {
            throw new Error('Turno non disponibile');
        }
        const shift: Shift = shiftSnapshot.val();

        // Somma i posti prenotati per quel turno nella data
        const reservationsQuery = query(
            ref(database, 'reservations'),
            orderByChild('date'),
            equalTo(reservation.date)
        );
        const snapshot = await get(reservationsQuery);
        let totalSeats = 0;
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const res: Reservation = childSnapshot.val();
                if (res.time === reservation.time) {
                    totalSeats += res.seats;
                }
            });
        }

        // Se superiamo il limite, genera un errore
        if (totalSeats + reservation.seats > shift.maxReservations) {
            throw new Error('Turno al completo');
        }

        // Aggiunge la prenotazione con stato pending di default
        const newReservationRef = push(ref(database, 'reservations'));
        await set(newReservationRef, { ...reservation, status: 'pending' });
        return newReservationRef.key;
    } catch (error) {
        console.error('Errore durante l\'aggiunta della prenotazione: ', error);
        throw error;
    }
};

export const subscribeToReservations = (
    callback: (reservations: Reservation[]) => void
): (() => void) => {
    const reservationsRef = ref(database, 'reservations');

    const listener = onValue(reservationsRef, (snapshot) => {
        const reservations: Reservation[] = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const id = childSnapshot.key;
                if (!id) return;

                const reservation: Reservation = {
                    id,
                    ...childSnapshot.val()
                };
                reservations.push(reservation);

                // Mostra la notifica solo se è una nuova prenotazione pending e non l'abbiamo già mostrata
                if (reservation.status === 'pending' && !globalProcessedNotifications.has(id)) {
                    globalProcessedNotifications.add(id);
                    // Aggiungi un piccolo ritardo per evitare notifiche simultanee
                    setTimeout(() => {
                        scheduleLocalNotification(
                            'Nuova Prenotazione',
                            `Nuova prenotazione da ${reservation.fullName} per ${reservation.seats} persone il ${reservation.date} alle ${reservation.time}`
                        );
                    }, 500);
                }
            });
        }
        callback(reservations);
    });

    return () => {
        off(reservationsRef, 'value', listener);
    };
};

export const updateReservation = async (key: string, reservation: Reservation): Promise<void> => {
    try {
        const reservationRef = ref(database, `reservations/${key}`);
        await update(reservationRef, reservation);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della prenotazione: ', error);
        throw error;
    }
};

export const deleteReservation = async (key: string): Promise<void> => {
    try {
        const reservationRef = ref(database, `reservations/${key}`);
        await remove(reservationRef);
    } catch (error) {
        console.error('Errore durante l\'eliminazione della prenotazione: ', error);
        throw error;
    }
};

export const acceptReservation = async (key: string, reservation: Reservation): Promise<void> => {
    try {
        const reservationRef = ref(database, `reservations/${key}`);
        await update(reservationRef, { ...reservation, status: 'accepted' });
        
        // Invia email di conferma
        const formattedDate = format(new Date(reservation.date), "dd/MM/yyyy");
        await sendAcceptanceEmail(
            reservation.fullName,
            reservation.email,
            formattedDate,
            reservation.time,
            reservation.seats
        );
        
        // Notifica locale
        scheduleLocalNotification(
            'Prenotazione accettata',
            `Hai accettato la prenotazione di ${reservation.fullName} per ${reservation.seats} persone`
        );
        
    } catch (error) {
        console.error('Errore durante l\'accettazione della prenotazione: ', error);
        throw error;
    }
};

export const rejectReservation = async (key: string, reservation: Reservation): Promise<void> => {
    try {
        const reservationRef = ref(database, `reservations/${key}`);
        await update(reservationRef, { ...reservation, status: 'rejected' });
        
        // Invia email di rifiuto
        const formattedDate = format(new Date(reservation.date), "dd/MM/yyyy");
        await sendRejectionEmail(
            reservation.fullName,
            reservation.email,
            formattedDate,
            reservation.time,
            reservation.seats
        );
        
        // Notifica locale
        scheduleLocalNotification(
            'Prenotazione rifiutata',
            `Hai rifiutato la prenotazione di ${reservation.fullName} per ${reservation.seats} persone`
        );
        
    } catch (error) {
        console.error('Errore durante il rifiuto della prenotazione: ', error);
        throw error;
    }
}; 