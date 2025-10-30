import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from './config/env';

/**
 * Razorpay Service for handling payment operations
 */
class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    // Credentials are already validated by env.ts
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a new payment order
   */
  async createOrder(amount: number, currency: string = 'INR', receipt?: string) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
      };

      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order created:', order.id);
      
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify payment signature to ensure payment authenticity
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
        .update(body)
        .digest('hex');

      const isValid = expectedSignature === signature;
      console.log('Payment signature verification:', isValid ? 'SUCCESS' : 'FAILED');
      
      return isValid;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  /**
   * Get payment details from Razorpay
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      console.log('Payment details fetched:', payment.id, payment.status);
      
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }

  /**
   * Get order details from Razorpay
   */
  async getOrderDetails(orderId: string) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      console.log('Order details fetched:', order.id, order.status);
      
      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  /**
   * Refund a payment (for future use)
   */
  async createRefund(paymentId: string, amount?: number, notes?: any) {
    try {
      const refundOptions: any = {
        payment_id: paymentId,
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }

      if (notes) {
        refundOptions.notes = notes;
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundOptions);
      console.log('Refund created:', refund.id);
      
      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService(); 