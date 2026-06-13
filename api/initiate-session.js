export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currencyIso = 'SAR', customerName, customerMobile, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const apiKey = req.headers['x-mf-key'] || process.env.MF_API_KEY;
    const baseUrl = process.env.MF_BASE_URL || 'https://apitest.myfatoorah.com';

    const response = await fetch(`${baseUrl}/v2/InitiateSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        InvoiceAmount: amount,
        CurrencyIso: currencyIso,
        CustomerName: customerName || 'عميل برانزك',
        CustomerMobile: customerMobile || '',
        InvoiceReference: orderId || `BRZ-${Date.now()}`,
        Language: 'ar',
        DisplayCurrencyIso: currencyIso,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.IsError) {
      throw new Error(data.Message || 'Failed to initiate session');
    }

    res.status(200).json({
      sessionId: data.Data.SessionId,
      countryCode: data.Data.CountryCode,
    });
  } catch (error) {
    console.error('MyFatoorah session error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
