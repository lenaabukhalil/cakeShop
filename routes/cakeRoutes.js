const express = require('express');
const router = express.Router();
const Cake = require('../models/Cake');

// Create cake
router.post('/', async (req, res) => {
  try {
    const cake = new Cake(req.body);
    await cake.save();
    res.status(201).json(cake);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all cakes
router.get('/', async (req, res) => {
  try {
    const cakes = await Cake.find();
    res.json(cakes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single cake
router.get('/:id', async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);
    if (!cake) return res.status(404).json({ message: 'Cake not found' });
    res.json(cake);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cake
router.put('/:id', async (req, res) => {
  try {
    const cake = await Cake.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cake);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete cake
router.delete('/:id', async (req, res) => {
  try {
    await Cake.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cake deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
