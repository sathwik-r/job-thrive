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
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

export const openPaymentModal = (options: RazorpayOptions) => {
  const rzp = new window.Razorpay(options);
  rzp.open();
};

export const createRazorpayOrder = async (amount: number): Promise<{ orderId: string }> => {
  // In production, this would call your backend to create a Razorpay order
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId: 'order_' + Date.now(),
      });
    }, 500);
  });
};
