const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// إضافة مراجعة لكيك معين
router.post('/cake/:cakeId', isAuthenticated, reviewController.addReview);

// جلب مراجعات كيك معين
router.get('/cake/:cakeId', reviewController.getReviewsByCake);

// (اختياري) لو عندك حقل rating في كيك، أو تريد حساب التوب ريتد بك Aggregation
// أزلت الراوتر القديم وحطيت ملاحظة عشان تحتاج تعديل حسب طريقة حساب التقييم
router.get('/top-rated', async (req, res) => {
  try {
    // مثال على aggregation لحساب متوسط التقييم لكل كيك
    const topRated = await Review.aggregate([
      { $group: { _id: "$cake", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cakes",
          localField: "_id",
          foreignField: "_id",
          as: "cake"
        }
      },
      { $unwind: "$cake" },
      {
        $project: {
          _id: 0,
          cakeId: "$cake._id",
          name: "$cake.name",
          avgRating: 1
        }
      }
    ]);
    res.json(topRated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top-rated cakes' });
  }
});

module.exports = router;
