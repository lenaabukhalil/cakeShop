const Review = require('../models/Review');

// جلب مراجعات كيك معين مع بيانات المستخدم
exports.getReviewsByCake = async (req, res) => {
  try {
    const reviews = await Review.find({ cake: req.params.cakeId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إضافة مراجعة جديدة
exports.addReview = async (req, res) => {
  try {
    const newReview = new Review({
      user: req.user.id,
      cake: req.params.cakeId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
