import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {error && (
        <div className="checkout-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="checkout-pay-btn"
      >
        {loading ? (
          <span className="checkout-spinner" />
        ) : (
          `ادفع ${amount} ر.س`
        )}
      </button>
    </form>
  );
}

export default function StripeCheckout({ amount, items = [], orderId, onSuccess, onError }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, items, orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [amount]);

  if (loading) {
    return (
      <div className="checkout-loading">
        <span className="checkout-spinner" />
        <p>جاري تجهيز الدفع...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-error-box">
        <p>حدث خطأ: {error}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h3>الدفع الآمن</h3>
        <div className="checkout-amount">{amount} ر.س</div>
      </div>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#c4a035',
              colorBackground: '#ffffff',
              colorText: '#2d3a20',
              borderRadius: '12px',
            },
          },
          paymentMethodOrder: ['apple_pay', 'card'],
        }}
      >
        <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
      </Elements>

      <div className="checkout-security">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        الدفع آمن ومشفر عبر Stripe
      </div>
    </div>
  );
}
