const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Cake = require('../models/Cake');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('cakes.cake', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', async (req, res) => {
  try {
    const user = await User.findById(req.body.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cakes = await Promise.all(req.body.cakes.map(async item => {
      const cake = await Cake.findById(item.cake);
      if (!cake || cake.stock < item.quantity) throw new Error('Cake not available');
      cake.stock -= item.quantity;
      await cake.save();
      return { cake: item.cake, quantity: item.quantity };
    }));

    const totalAmount = cakes.reduce((sum, item) => {
      const cake = req.body.cakes.find(c => c.cake === item.cake.toString());
      return sum + cake.quantity * (cake.price || 0);
    }, 0);

    const order = new Order({ ...req.body, cakes, totalAmount });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'Cancelled';
    await order.save();

    for (const item of order.cakes) {
      await Cake.findByIdAndUpdate(item.cake, { $inc: { stock: item.quantity } });
    }

    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
