// src/types/payment.ts
export interface CheckoutRequest {
  baseAmount: number;
  discountCode?: string;
}

export interface CheckoutResponse {
  success: boolean;
  orderId?: string;
  finalAmount?: number;
  error?: string;
}

export interface PaymentSuccessData {
  orderId: string;
  payerId: string;
  finalAmount: number;
  discountCode?: string;
  payerEmail?: string | null; // Made explicit that it can be null
}
