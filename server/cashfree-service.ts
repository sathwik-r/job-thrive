import axios from 'axios';
import { env } from './config/env';

class CashfreeService {
  private baseUrl: string;
  private apiVersion: string;

  constructor() {
    this.baseUrl = env.CASHFREE_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
    this.apiVersion = '2023-08-01';
  }

  private getHeaders() {
    return {
      'x-client-id': env.CASHFREE_CLIENT_ID,
      'x-client-secret': env.CASHFREE_CLIENT_SECRET,
      'x-api-version': this.apiVersion,
      'Content-Type': 'application/json',
    } as const;
  }

  async createOrder(params: {
    amount: number;
    currency?: string;
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl: string;
    orderNote?: string;
    receipt?: string;
  }) {
    const request = {
      order_amount: String(params.amount),
      order_currency: params.currency || 'INR',
      customer_details: {
        customer_id: params.customerId,
        customer_name: params.customerName || '',
        customer_email: params.customerEmail || '',
        customer_phone: params.customerPhone || '',
      },
      order_meta: {
        return_url: params.returnUrl,
      },
      order_note: params.orderNote || '',
      order_tags: params.receipt ? { receipt: params.receipt } : undefined,
    };

    const response = await axios.post(`${this.baseUrl}/orders`, request, { headers: this.getHeaders() });
    return response.data; // contains order_id and payment_session_id
  }

  async fetchOrder(orderId: string) {
    const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, { headers: this.getHeaders() });
    return response.data;
  }
}

export const cashfreeService = new CashfreeService();


