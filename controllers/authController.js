const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// تسجيل مستخدم جديد
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    
    // التحقق من عدم تكرار البريد الإلكتروني
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'البريد الإلكتروني مسجل مسبقاً' 
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء مستخدم جديد
    user = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });

    await user.save();
    
    // إنشاء توكن JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // إعداد كائن المستخدم بدون كلمة المرور
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id;
    console.log('AUTH REGISTER RESPONSE USER:', userObj);

    res.status(201).json({ 
      success: true,
      message: 'تم تسجيل المستخدم بنجاح',
      token,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}

// تسجيل دخول باستخدام JWT
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'بيانات الاعتماد غير صحيحة' 
      });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'بيانات الاعتماد غير صحيحة' 
      });
    }

    // إنشاء توكن JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // إعداد كائن المستخدم بدون كلمة المرور
    const userObj = user.toObject();
    delete userObj.password;
    userObj.id = userObj._id;
    console.log('AUTH LOGIN RESPONSE USER:', userObj);

    res.json({ 
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
}

// تسجيل خروج (مع JWT عادة يتم التعامل معه من جانب العميل)
function logout(req, res) {
  res.json({ 
    success: true,
    message: 'تم تسجيل الخروج بنجاح' 
  });
}

// التحقق من صحة التوكن
async function verifyToken(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'لا يوجد توكن مصادقة' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'المستخدم غير موجود' 
      });
    }

    const userObj = user.toObject ? user.toObject() : user;
    userObj.id = userObj._id;
    console.log('AUTH VERIFYTOKEN RESPONSE USER:', userObj);
    res.json({ 
      success: true,
      user: userObj
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'توكن غير صالح أو منتهي الصلاحية' 
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyToken
};