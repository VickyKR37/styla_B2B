'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    gtagScriptLoaded?: boolean;
  }
}


export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'granted') {
      loadGoogleAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    loadGoogleAnalytics();
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setShowBanner(false);
  };

  const loadGoogleAnalytics = () => {
    if (typeof window === 'undefined') return;

    if (!window.gtagScriptLoaded) {
      const script1 = document.createElement('script');
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-LLZ1XNNXET';
      script1.async = true;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-LLZ1XNNXET', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);

      window.gtagScriptLoaded = true;
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 text-white text-sm z-50 flex justify-between items-center flex-wrap">
      <p className="mb-2 md:mb-0">
        We use cookies to improve your experience and to analyse traffic. Do you consent to analytics cookies?
      </p>
      <div className="space-x-2">
        <button
          onClick={handleAccept}
          className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
