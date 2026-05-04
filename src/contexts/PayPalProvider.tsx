// src/contexts/PayPalProvider.tsx
'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface PayPalProviderProps {
  children: ReactNode;
}

export const PayPalProvider = ({ children }: PayPalProviderProps) => {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;

  const options = {
    clientId: clientId || '',
    currency: 'GBP', // Ensure currency is set to GBP
    intent: 'capture' as const,
  };

  // Don't render PayPal if no client ID
  if (!clientId) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">
          PayPal configuration error: Client ID is missing.
          <br />
          Please check your .env.local file and restart the dev server.
        </p>
        {children}
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={options}>
      {children}
    </PayPalScriptProvider>
  );
};
