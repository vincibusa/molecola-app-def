/**
 * Servizio per l'invio delle email utilizzando l'API REST di EmailJS
 */

interface EmailTemplateParams {
  to_name: string;
  to_email: string;
  reservation_date: string;
  reservation_time: string;
  seats: number;
  [key: string]: any;
}

/**
 * Invia un'email usando l'API REST di EmailJS
 * 
 * @param templateId - ID del template di EmailJS
 * @param templateParams - Parametri del template
 * @returns Promise che si risolve quando l'email è stata inviata
 */
export const sendEmail = async (templateId: string, templateParams: EmailTemplateParams): Promise<void> => {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost', // Necessario per l'API REST
      },
      body: JSON.stringify({
        service_id: 'service_jlzz6px',
        template_id: templateId,
        user_id: 'iIz1ynV6Pc7STPfuf',
        template_params: {
          ...templateParams,
          from_name: 'Fermento 2.0',
        },
        accessToken: 'iIz1ynV6Pc7STPfuf', // Usa la chiave pubblica come accessToken
      }),
    });

    const responseText = await response.text();
    console.log('Risposta EmailJS:', responseText);
    
    if (!response.ok) {
      throw new Error(`Errore nell'invio dell'email: ${responseText}`);
    }
    
    console.log('Email inviata con successo');
    return;
  } catch (err: any) {
    console.error('Errore nell\'invio dell\'email:', err?.message || err);
    throw new Error(`Errore nell'invio dell'email: ${err?.message || err}`);
  }
};

/**
 * Invia un'email di conferma a un cliente che ha avuto la prenotazione accettata
 */
export const sendAcceptanceEmail = async (
  fullName: string,
  email: string,
  date: string,
  time: string,
  seats: number
): Promise<void> => {
  const templateParams: EmailTemplateParams = {
    to_name: fullName,
    to_email: email,
    reservation_date: date,
    reservation_time: time,
    seats,
  };
  
  return sendEmail('template_5ltxf0t', templateParams);
};

/**
 * Invia un'email di rifiuto a un cliente che ha avuto la prenotazione rifiutata
 */
export const sendRejectionEmail = async (
  fullName: string,
  email: string,
  date: string,
  time: string,
  seats: number
): Promise<void> => {
  const templateParams: EmailTemplateParams = {
    to_name: fullName,
    to_email: email,
    reservation_date: date,
    reservation_time: time,
    seats,
  };
  
  return sendEmail('template_3cehio9', templateParams);
}; 