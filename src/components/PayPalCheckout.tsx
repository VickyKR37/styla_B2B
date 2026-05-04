"use client";
// components/PayPalCheckout.tsx

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState } from 'react';
import type { PaymentSuccessData } from '@/types/payment';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface Props {
  baseAmount: number;
  discountCode: string | null;
  discountPercent: number;
  onSuccess: (d: PaymentSuccessData) => void;
  onError: (e: unknown) => void; // Keep onError for general errors
}

export default function PayPalCheckout({
  baseAmount,
  discountCode,
  discountPercent,
  onSuccess,
  onError,
}: Props) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [busy, setBusy] = useState(false);
  const { toast } = useToast(); // Initialize useToast

  const savings = (baseAmount * discountPercent) / 100;
  const final = Math.max(0.5, baseAmount - savings);

  return (
    <>
      <div className="mb-3">
        <p>Subtotal: £{baseAmount.toFixed(2)}</p>
        {discountCode && (
          <p>
            Discount ({discountCode}): −£{savings.toFixed(2)}
          </p>
        )}
        <p className="font-semibold">Total: £{final.toFixed(2)}</p>
      </div>

      {isPending && <p className="text-center text-muted-foreground">Loading PayPal SDK...</p>}

      {!isPending && ( // Only render PayPalButtons when SDK is not pending
        <PayPalButtons
          style={{ layout: 'vertical' }}
          disabled={busy} // Disable only when busy, not when pending (as we wait for it to load)
          createOrder={async () => {
            setBusy(true);
            console.log("PayPalCheckout: Attempting to create order via /api/checkout.");
            try {
              const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ baseAmount, discountCode }),
              });
              const result = (await res.json()) as { orderId?: string; error?: string };
              if (!res.ok || !result.orderId) {
                const errorMessage = result.error || 'Failed to create PayPal order on server.';
                console.error("PayPalCheckout: Error creating order:", errorMessage);
                toast({
                  title: "Payment Setup Error",
                  description: `Could not initiate PayPal payment: ${errorMessage}`,
                  variant: "destructive",
                });
                throw new Error(errorMessage); // Throw to stop PayPal flow
              }
              console.log("PayPalCheckout: Order created with ID:", result.orderId);
              return result.orderId;
            } catch (e) {
              console.error("PayPalCheckout: Exception during createOrder:", e);
              onError(e); // Propagate error to parent
              setBusy(false);
              throw e; // Re-throw to indicate failure to PayPal SDK
            }
          }}
          onApprove={async (data, actions) => {
            console.log("PayPalCheckout: onApprove callback initiated. Data:", data);
            setBusy(true);
            try {
              const details = await actions.order!.capture();
              console.log("PayPalCheckout: Order captured successfully. Details:", details);

              const paymentSuccessData: PaymentSuccessData = {
                orderId: details.id!,
                payerId: details.payer?.payer_id || '',
                finalAmount: final,
                discountCode: discountCode ?? undefined,
                payerEmail: null, // Email will be collected in the next step
              };

              console.log("PayPalCheckout: Calling onSuccess with data:", paymentSuccessData);
              onSuccess(paymentSuccessData);
              toast({
                title: "Payment Completed",
                description: "Your PayPal payment was successfully processed!",
                duration: 3000,
              });

            } catch (e) {
              console.error("PayPalCheckout: Error during onApprove capture:", e);
              toast({
                title: "Payment Processing Error",
                description: `There was an issue capturing your payment: ${(e as Error).message}. Please try again.`,
                variant: "destructive",
              });
              onError(e); // Propagate error to parent
            } finally {
              setBusy(false);
              console.log("PayPalCheckout: onApprove process finished. Busy set to false.");
            }
          }}
          onError={(e) => {
            console.error("PayPalCheckout: Error from PayPalButtons onError:", e);

            const errorMessage =
              e instanceof Error
                ? e.message
                : typeof e === "string"
                  ? e
                  : "An unknown error occurred with PayPal.";

            toast({
              title: "PayPal Error",
              description: `An error occurred with the PayPal integration: ${errorMessage}. Please check your browser's pop-up blocker.`,
              variant: "destructive",
              duration: 5000,
            });

            onError(e); // Propagate error to parent
          }}
        />
      )}
    </>
  );
}
