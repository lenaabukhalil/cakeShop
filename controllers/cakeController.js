const Cake = require('../models/Cake');

// جلب كل الكيكات
exports.getAllCakes = async (req, res) => {
  try {
    const cakes = await Cake.find({});
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كيك واحد حسب id
exports.getCakeById = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إضافة كيك جديد
exports.createCake = async (req, res) => {
  try {
    const newCake = new Cake(req.body);
    const savedCake = await newCake.save();
    res.status(201).json(savedCake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// تحديث كيك
exports.updateCake = async (req, res) => {
  try {
    const updatedCake = await Cake.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCake) return res.status(404).json({ message: 'Cake not found' });
    res.json(updatedCake);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// حذف كيك
exports.deleteCake = async (req, res) => {
  try {
    const deletedCake = await Cake.findByIdAndDelete(req.params.id);
    if (!deletedCake) return res.status(404).json({ message: 'Cake not found' });
    res.json({ message: 'Cake deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// البحث مع فلترة
exports.searchCakes = async (req, res) => {
  try {
    const { name, minPrice, maxPrice, category } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) query.price = { $gte: minPrice || 0, $lte: maxPrice || 1000 };

    const cakes = await Cake.find(query);
    res.json(cakes);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
};

// Rate a cake
exports.rateCake = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    cake.ratings.push(rating);
    await cake.save();
    res.json({ message: 'Rating submitted', cake });
  } catch (error) {
    res.status(500).json({ message: 'Failed to rate cake', error: error.message });
  }
};
