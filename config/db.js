// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // لو تستخدم نسخة أقدم من mongoose
      // useFindAndModify: false // حسب النسخة
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // خروج من التطبيق بسبب فشل الاتصال
  }
};

module.exports = connectDB;
