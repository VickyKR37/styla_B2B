// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DiscountCode } from '@/types/discount';
import type { CheckoutRequest, CheckoutResponse } from '@/types/payment';

// --- CHANGE 1: PayPal API Base URL ---
// For LIVE PayPal transactions, this should be 'https://api-m.paypal.com'
// For SANDBOX (testing), it's 'https://api-m.sandbox.paypal.com'
const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL || 'https://api-m.paypal.com'; // Default to live if env var not set

async function paypalToken() {
  // --- CHANGE 2: Use LIVE PayPal Client ID and Secret ---
  // These environment variables should be set in your production deployment environment
  const id = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID!; // Assuming you'll use this env var name for live
  const secret = process.env.PAYPAL_SANDBOX_SECRET!; // Assuming you'll use this env var name for live

  if (!id || !secret) {
    console.error("PayPal LIVE API credentials are not set in environment variables!");
    throw new Error("Missing PayPal LIVE API credentials.");
  }

  const res = await fetch(`${PAYPAL_API_BASE_URL}/v1/oauth2/token`, { // Use the dynamic base URL
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("Failed to get PayPal access token:", j);
    throw new Error(j.error_description || JSON.stringify(j));
  }
  return j.access_token as string;
}

async function paypalOrder(amount: number, access: string) {
  const res = await fetch(`${PAYPAL_API_BASE_URL}/v2/checkout/orders`, { // Use the dynamic base URL
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'GBP', value: amount.toFixed(2) },
          description: 'Styla report',
        },
      ],
      // For live, ensure your return_url and cancel_url are publicly accessible
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`, // Use a base URL env var for robustness
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment`,
      },
    }),
  });
  const j = await res.json();
  if (!res.ok) {
    console.error("Failed to create PayPal order:", j);
    throw new Error(JSON.stringify(j));
  }
  return j.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const { baseAmount, discountCode } = (await req.json()) as CheckoutRequest;
    if (baseAmount <= 0) throw new Error('Bad amount');

    let final = baseAmount;

    if (discountCode) {
      const snap = await getDoc(doc(db, 'discountCodes', discountCode));
      if (!snap.exists()) throw new Error('Invalid code');
      const d = snap.data() as DiscountCode;
      if (!d.isActive) throw new Error('Inactive code');
      if (d.expiresAt && new Date(d.expiresAt) < new Date()) throw new Error('Expired');
      if (d.maxUses && d.uses >= d.maxUses) throw new Error('Usage limit');
      final = Math.max(0.5, baseAmount - (baseAmount * d.percentOff) / 100);
    }

    const token = await paypalToken();
    const orderId = await paypalOrder(final, token);

    return NextResponse.json<CheckoutResponse>({
      success: true,
      orderId,
      finalAmount: final,
    });
  } catch (e) {
    console.error("Error in /api/checkout POST handler:", e); // Added more detailed error logging
    return NextResponse.json<CheckoutResponse>(
      { success: false, error: (e as Error).message || "An unknown error occurred during checkout." }, // More descriptive error message
      { status: 400 },
    );
  }
}

// You might also want to add a PUT route for capturing the order if your frontend calls it separately
// For example:
/*
export async function PUT(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const accessToken = await paypalToken(); // Reuse the token generation
    const url = `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`;

    const paypalResponse = await fetch(url, {
      method: "POST", // Capture is a POST request to the capture endpoint
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error("PayPal Capture Order API error:", captureData);
      return NextResponse.json(
        { error: captureData.message || "Failed to capture PayPal order.", details: captureData },
        { status: paypalResponse.status || 500 }
      );
    }

    return NextResponse.json({ captureData });
  } catch (error) {
    console.error("Error in /api/checkout PUT:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
*/
