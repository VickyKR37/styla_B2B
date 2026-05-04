// src/types/discount.ts
export interface DiscountCode {
  id: string;          // doc id, e.g. "SANDY50"
  code: string;
  percentOff: number;  // 0-100
  owner: string;       // influencer uid/email
  uses: number;
  isActive: boolean;
  maxUses?: number;
  expiresAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;          // Firestore doc id == PayPal orderId
  orderId: string;
  payerId: string;
  amount: number;
  baseAmount: number;
  discountCode?: string;
  discountAmount?: number;
  influencerId?: string;
  status: 'completed' | 'failed';
  createdAt: string;
  capturedAt?: string;
  payerEmail?: string; // Added payerEmail to Order interface
}