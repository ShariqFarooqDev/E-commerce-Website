// FILE: backend/utils/paypal.js
// This is a new file.

import https from 'https';

async function getPayPalAccessToken() {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_APP_SECRET = process.env.PAYPAL_APP_SECRET;
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_APP_SECRET).toString(
    'base64'
  );

  const options = {
    hostname: 'api-m.sandbox.paypal.com',
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        const response = JSON.parse(data);
        resolve(response.access_token);
      });
    });
    req.on('error', (e) => reject(e));
    req.write('grant_type=client_credentials');
    req.end();
  });
}

export async function checkIfNewTransaction(orderModel, paypalTransactionId) {
  try {
    const orders = await orderModel.find({
      'paymentResult.id': paypalTransactionId,
    });
    return orders.length === 0;
  } catch (err) {
    console.error(err);
  }
}

export async function verifyPayPalPayment(paypalTransactionId) {
  const accessToken = await getPayPalAccessToken();
  const options = {
    hostname: 'api-m.sandbox.paypal.com',
    path: `/v2/checkout/orders/${paypalTransactionId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        const response = JSON.parse(data);
        if (response.status === 'COMPLETED') {
          resolve({ verified: true, value: response.purchase_units[0].amount.value });
        } else {
          resolve({ verified: false });
        }
      });
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}
