import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { PayPalProvider } from '../contexts/PayPalProvider';
import CookieConsentBanner from '../components/CookieConsentBanner';
import Link from 'next/link';
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: 'Styla',
  description: 'Automated Style Analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Analytics Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LLZ1XNNXET"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LLZ1XNNXET', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={playfair.className}>
        {children}
        <PayPalProvider>
          <main className="flex-grow">
            {children}
          </main>

          <footer className="p-4 text-l text-muted-foreground">
            <a
              href="https://www.instagram.com/perfectlystyled.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Need help or have feedback to give? Message us on Instagram
            </a>
            <p>Or email us at <a href="mailto:contact@perfectlystyled.co.uk">contact@perfectlystyled.co.uk</a></p>
            <p>
              <Link href="/privacy">Privacy Policy</Link>
            </p>
            <p>
              Styla is a trading name of Rai Tech Solutions Ltd.
              Registered in England & Wales. Company No. 13846682.
            </p>
            <p>
              <Link href="/terms">
                Terms of Service
              </Link>
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} Rai Tech Solutions Ltd. All rights reserved.
            </p>
          </footer>
          <CookieConsentBanner /> {/* Mount the banner */}
        </PayPalProvider>
      </body>
    </html>
  );
}
