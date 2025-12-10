const Order = require('../models/order');

const axios = require('axios');

const NOMOD_API_URL = "https://api.nomod.com/v1";

export const createCheckout = async (req, res) => {
  try {
    const {
      userId,
      productId,
      quantity,
      amountAED,
      packSize,
      address
    } = req.body;

    if (!amountAED || !productId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const order = new Order({
        user:userId,
        product:productId,
        quantity:quantity,
        address:address,
        sizeSelected:packSize,
        orderStatus:'Confirmed',
        amountPaid:amountAED
    });

    await order.save();

 const response = await axios.post(
  `${NOMOD_API_URL}/checkout`,
  {
    amount: amountAED * 100, // Nomod uses fils
    currency: "AED",
    metadata: {
      orderId: order._id.toString(),
      userId: userId || null,
      productId,
    },
    customer: {
      email: customer.email,
      phone: customer.phone,
    },
    reference: order._id.toString(),
    description: `Order for ${productName} - ${quantity}x`,
    success_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${order._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-failed?orderId=${order._id}`,
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.NOMOD_KEY}`,
      "Content-Type": "application/json",
    }
  }
);


    const data = response.data;

    if (!response.ok) {
      console.log("NOMOD ERROR:", data);
      return res.status(500).json({ message: "Nomod API failed", error: data });
    }

    order.paymentStatus = "Completed";

    return res.status(200).json({
      checkoutUrl: data.hosted_url,
      orderId: order._id
    });

  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
