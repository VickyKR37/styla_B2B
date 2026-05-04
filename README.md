
# Firebase Studio - Styla

This is a Next.js application built with Firebase Studio. It provides a style questionnaire, AI-powered recommendations, and a simulated payment flow to receive a personalized style report.

## Features  
  
- Multi-step style questionnaire  
- AI-powered personalized style recommendations  
- PayPal payments gateway
- Discount code support (validated via Firestore)  
- Secure, production-ready code  

## Getting Started

1.  **Set up Environment Variables:**
    *   Create a `.env.local` file in the root directory.
```bash
//Google API Keys
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

//Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

//PayPal Sandbox Configuration (for testing)
NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_SANDBOX_SECRET=your_paypal_sandbox_secret
DEVELOPER_PAYPAL_EMAIL=your_developer_paypal_email@example.com
```
1. For deployment, ensure these environment variables are set in your Firebase Hosting/Functions environment
2. Never expose your Firebase Admin SDK private key or PayPal secret in any NEXT_PUBLIC_ variable
3. Only use the public Firebase config for the frontend

4.  **Install Dependencies:**
    ```bash
    npm install
    ```

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9003` (or the port specified in `package.json`).

6.  **Run Genkit Developer UI (Optional):**
    To inspect and test Genkit flows locally:
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```
    Access the Genkit Developer UI at `http://localhost:4000

## PayPal Integration

This project uses the official [PayPal React SDK](https://github.com/paypal/react-paypal-js) for secure payment processing.

### 1. Install the PayPal React SDK

Run this command in your project root:

```bash
npm install @paypal/react-paypal-js
```

***Project Structure***
```
src/  
  app/  
    layout.tsx           # App layout, wraps with PayPalProvider  
    payment/  
      page.tsx           # Payment page with PayPal checkout  
  components/  
    PayPalCheckout.tsx   # PayPal checkout button and logic  
    DiscountCodeInput.tsx# Discount code input and validation  
  contexts/  
    PayPalProvider.tsx   # PayPalScriptProvider wrapper   
  app/api/  
    checkout/route.ts    # API route for PayPal order creation/discount validation
```
## Key Features

*   **Style Questionnaire:** A multi-step form to gather user input on body line, scale, and shape.
*   **AI-Powered Recommendations:** Uses Genkit with Google AI to generate personalized style advice.
*   **Direct Report Flow:** Users complete the questionnaire, provide an email, and receive their report after a simulated payment. No user accounts are required.
*   **Styling:** Uses ShadCN UI components and Tailwind CSS.

## Deployment to Firebase

1.  **Build the Application:**
    ```bash
    npm run build
    ```
2.  **Deploy:**
    Ensure your Firebase CLI is configured and you are logged in.
    ```bash
    firebase deploy
    ```
    Make sure your Firebase environment has all necessary environment variables set (see Step 1 of "Getting Started").

