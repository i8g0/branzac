import { useState, useEffect, useRef } from 'react';

const MF_SCRIPT_URL = 'https://sa.myfatoorah.com/payment/v1/session.js';

function loadMFScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${MF_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = MF_SCRIPT_URL;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load MyFatoorah SDK'));
    document.head.appendChild(script);
  });
}

export default function MyFatoorahCheckout({ amount, customerName, orderId, onSuccess, onError }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/initiate-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            customerName: customerName || 'عميل برانزك',
            orderId: orderId || `BRZ-${Date.now()}`,
          }),
        });

        const sessionData = await res.json();
        if (!res.ok) throw new Error(sessionData.error || 'Failed to create session');

        await loadMFScript();

        if (cancelled) return;

        const config = {
          sessionId: sessionData.sessionId,
          countryCode: sessionData.countryCode || 'SA',
          currencyCode: 'SAR',
          amount: String(amount),
          callback: handlePaymentResponse,
          containerId: 'mf-embedded-payment',
          paymentOptions: ['ApplePay', 'Card'],
        };

        window.myfatoorah.init(config);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
          onError?.(err.message);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [amount, customerName, orderId]);

  const handlePaymentResponse = async (response) => {
    try {
      const res = await fetch('/api/execute-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: response.SessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      if (data.paymentStatus === 'Paid') {
        onSuccess?.(data);
      } else if (data.paymentURL) {
        window.location.href = data.paymentURL;
      }
    } catch (err) {
      setError(err.message);
      onError?.(err.message);
    }
  };

  if (loading) {
    return (
      <div className="mf-loading">
        <span className="checkout-spinner" />
        <p>جاري تجهيز الدفع...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div className="mf-checkout">
      <div id="mf-embedded-payment" ref={containerRef} />
      <div className="checkout-security">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        الدفع آمن ومشفر - معتمد من مؤسسة النقد السعودي
      </div>
    </div>
  );
}
