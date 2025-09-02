const Order = require('../models/Order');
const User = require('../models/User');
const Cake = require('../models/Cake');

// جلب كل الطلبات مع معلومات المستخدم والكيك
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('cakes.cake', 'name price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// إنشاء طلب جديد
exports.createOrder = async (req, res) => {
  try {
    const { user, cakes, paymentMethod, shippingAddress, contactPhone, deliveryDate } = req.body;

    // تحقق من وجود المستخدم
    const userExists = await User.findById(user);
    if (!userExists) return res.status(404).json({ error: 'User not found' });

    let totalAmount = 0;

    // تحقق من توفر الكيكات وتحديث الكمية
    const orderCakes = await Promise.all(cakes.map(async (item) => {
      const cake = await Cake.findById(item.cake);
      if (!cake || cake.stock < item.quantity) {
        throw new Error(`Cake not available or insufficient stock: ${item.cake}`);
      }
      totalAmount += cake.price * item.quantity;
      cake.stock -= item.quantity;
      await cake.save();
      return { cake: cake._id, quantity: item.quantity };
    }));

    // إنشاء الطلب
    const order = new Order({
      user,
      cakes: orderCakes,
      totalAmount,
      paymentMethod,
      shippingAddress,
      contactPhone,
      deliveryDate,
    });

    await order.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// إلغاء طلب موجود
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'Cancelled') return res.status(400).json({ error: 'Order already cancelled' });

    order.status = 'Cancelled';
    await order.save();

    // استرجاع الكمية للكيك في المخزون
    for (const item of order.cakes) {
      await Cake.findByIdAndUpdate(item.cake, { $inc: { stock: item.quantity } });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
