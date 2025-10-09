import { apiRequest } from './queryClient';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id?: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

/**
 * Initialize Razorpay by loading the checkout script
 */
export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay payment modal with the given options
 */
// Deprecated: Razorpay integration removed in favor of Cashfree
export const openPaymentModal = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay is not loaded');
  }

  const rzp = new window.Razorpay(options);
  rzp.open();
};

/**
 * Create a Razorpay order by calling the backend API
 */
// Deprecated: Kept for migration safety. Server now returns Cashfree data
export const createRazorpayOrder = async (
  amount: number, 
  jobId: string | number,
  currency: string = 'INR'
): Promise<CreateOrderResponse> => {
  try {
    const response = await apiRequest('POST', '/api/payment/create-order', {
      amount,
      currency,
      jobId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    const orderData = await response.json();
    return orderData;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verify payment on the backend
 */
// Deprecated: Kept for migration safety. Use verifyCashfreePayment instead
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  referralId: string | number
) => {
  try {
    const response = await apiRequest('POST', '/api/payment/verify', {
      paymentId,
      orderId,
      signature,
      referralId,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
