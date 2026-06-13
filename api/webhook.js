import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);

      // TODO: Update order status in Supabase
      // const { orderId } = paymentIntent.metadata;
      // await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId);

      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
}
