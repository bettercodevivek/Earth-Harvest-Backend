const Order = require('../models/order');

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      message: "Order created",
      order
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};


export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });

    res.json({
      success: true,
      orders
    });

  } catch (err) {
    console.error("Get User Orders Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });

  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = req.body.status;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order
    });

  } catch (err) {
    console.error("Update Order Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
