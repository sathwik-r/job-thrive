import { apiRequest } from '@/lib/queryClient';

declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CreateCashfreeOrderResponse {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  currency: string;
  mode: 'sandbox' | 'production';
}

export const initializeCashfree = async (): Promise<boolean> => {
  if (window.Cashfree) return true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openCashfreeCheckout = async (paymentSessionId: string, mode: 'sandbox' | 'production', redirectTarget: '_self' | '_blank' | '_top' | '_modal' = '_modal') => {
  const cashfree = window.Cashfree({ mode });
  const checkoutOptions = { paymentSessionId, redirectTarget } as any;
  return cashfree.checkout(checkoutOptions);
};

export const createCashfreeOrder = async (
  amount: number,
  jobId: string | number,
  currency: string = 'INR',
  customerPhone?: string
): Promise<CreateCashfreeOrderResponse> => {
  const response = await apiRequest('POST', '/api/payment/create-order', { amount, currency, jobId, customerPhone });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create order');
  }
  return response.json();
};

export const verifyCashfreePayment = async (orderId: string, referralId: number | string) => {
  const response = await apiRequest('POST', '/api/payment/verify', { orderId, referralId });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Payment verification failed');
  }
  return response.json();
};


