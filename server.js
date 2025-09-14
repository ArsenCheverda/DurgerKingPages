const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON bodies

// A simple route to check if the server is running
app.get('/', (req, res) => {
  res.send('Telegram Shop Backend is running!');
});

/**
 * Endpoint to receive order data from the Telegram Web App.
 * In a real application, this is where you would:
 * 1. Validate the data received from the web app.
 * 2. Verify the user identity using `initData` from Telegram.
 * 3. Create a payment intent with a payment provider (like Stripe).
 * 4. Save the order to your database.
 * 5. Return a payment link or client secret to the frontend.
 */
app.post('/create-order', (req, res) => {
  const orderData = req.body;

  console.log('--- NEW ORDER RECEIVED ---');
  console.log('Cart:', JSON.stringify(orderData.cart, null, 2));
  console.log('Shipping Info:', JSON.stringify(orderData.shippingInfo, null, 2));
  console.log('--------------------------');

  // Basic validation
  if (!orderData.cart || !orderData.shippingInfo) {
    return res.status(400).json({ error: 'Missing order data.' });
  }

  // In a real app, you would now process payment and save to a DB.
  // For this example, we just acknowledge receipt.
  res.status(200).json({
    message: 'Order received successfully!',
    orderId: `order_${Date.now()}`, // Send back a mock order ID
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
