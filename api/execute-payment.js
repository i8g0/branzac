export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, paymentMethodId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const apiKey = req.headers['x-mf-key'] || process.env.MF_API_KEY;
    const baseUrl = process.env.MF_BASE_URL || 'https://apitest.myfatoorah.com';

    const response = await fetch(`${baseUrl}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        SessionId: sessionId,
        PaymentMethodId: paymentMethodId || 0,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.IsError) {
      throw new Error(data.Message || 'Payment execution failed');
    }

    res.status(200).json({
      success: true,
      paymentId: data.Data.PaymentId,
      invoiceId: data.Data.InvoiceId,
      paymentStatus: data.Data.PaymentStatus,
      paymentURL: data.Data.PaymentURL,
    });
  } catch (error) {
    console.error('MyFatoorah execute error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
