
import { ADMIN_WHATSAPP, APP_NAME, ADMIN_PAYMENT_NAME } from '../constants';

/**
 * PaymentService refactored for manual WhatsApp-based payments.
 * All functions now prioritize directing the user to the Admin's WhatsApp.
 */
export const PaymentService = {
  /**
   * Directs user to WhatsApp for STK Push/Manual payment
   */
  async initiateWhatsAppPayment(phone: string, amount: number, reference: string) {
    console.log(`[WhatsApp Payment] Routing ${amount} TZS payment for ${phone} to Admin ${ADMIN_PAYMENT_NAME}`);
    
    // Check if it's a minutes purchase based on the reference or amount context
    const isMinutes = reference.includes('MINUTES_PURCHASE');
    const purpose = isMinutes 
      ? `kwa ajili ya kununua dakika za ziada (TZS 500 kwa dakika)` 
      : `kwa ajili ya kuendelea na huduma`;

    const message = `Habari ${ADMIN_PAYMENT_NAME},\n\nNahitaji kulipia ${amount.toLocaleString()} TZS ${purpose} kwenye ${APP_NAME}.\n\nSimu Yangu: ${phone}\nReference: ${reference}\n\nNitachagua kulipia kwa:\n1. HALOPESA (0621275922 - EDSON SADICK)\n2. MPESA (0757232716 - GRACE KILEKA)\n3. AIRTEL MONEY (0757232716 - EDSON SADICK)\n\nTafadhali niongezee dakika/uwezo sasa hivi.`;
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
    
    // Direct open
    window.open(url, '_blank');

    return {
      status: 'REDIRECTED',
      message: 'Redirecting to WhatsApp...'
    };
  },

  /**
   * Mock verification
   */
  async verifyTransaction(reference: string) {
    return { status: 'PENDING', message: 'Admin is verifying your manual payment.' };
  }
};
