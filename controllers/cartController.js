const Cart = require('../models/Cart');
const Cake = require('../models/Cake');

// Get user's cart
exports.getUserCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found.' });
    }
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.cake');
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add cake to cart
exports.addToCart = async (req, res) => {
  try {
    const { cakeId, quantity } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found. Cannot add to cart.' });
    }
    const userId = req.user.id;

    const cake = await Cake.findById(cakeId);
    if (!cake) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.cake.toString() === cakeId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ cake: cakeId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(400).json({ message: 'Error adding to cart: ' + error.message });
  }
};

// Remove cake from cart
exports.removeFromCart = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found.' });
    }
    const { cakeId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.cake.toString() !== cakeId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cake quantity in cart
exports.updateCartItem = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication error: User not found.' });
    }
    const { cakeId } = req.params;
    const { quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex(item => item.cake.toString() === cakeId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Item not found in cart' });
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
