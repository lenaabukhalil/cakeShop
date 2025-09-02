const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// تسجيل مستخدم جديد
const register = async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not configured');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      phoneNumber: phoneNumber || null,
      role: 'user',
      favorites: []
    });

    await newUser.save();

    const token = jwt.sign(
      { _id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
};

// تسجيل الدخول
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // إنشاء توكن JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // إرسال التوكن وبيانات المستخدم
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
        favorites: user.favorites
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
};

// تسجيل الدخول بـ Google
const googleLogin = async (req, res) => {
  try {
    const { email, username, googleId, profileImage } = req.body;

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret is not configured');
    }

    // البحث عن المستخدم بالبريد الإلكتروني
    let user = await User.findOne({ email });

    if (!user) {
      // إنشاء مستخدم جديد إذا لم يكن موجود
      user = new User({
        name: username,
        email,
        googleId,
        profileImage,
        role: 'user',
        favorites: []
      });
      await user.save();
    } else {
      // تحديث googleId إذا كان المستخدم موجود
      user.googleId = googleId;
      if (profileImage) {
        user.profileImage = profileImage;
      }
      await user.save();
    }

    // إنشاء توكن JWT
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
        favorites: user.favorites
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      message: 'Google login failed',
      error: error.message 
    });
  }
};

// عرض الملف الشخصي
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get profile',
      error: error.message 
    });
  }
};

// تحديث الملف الشخصي
const updateProfile = async (req, res) => {
  console.log('UPDATE PROFILE:', {
    paramsId: req.params.id,
    userFromToken: req.user,
    body: req.body
  });
  try {
    const updates = { ...req.body };
    delete updates.password; // منع تحديث الباسورد من هنا

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure 'id' is present for frontend compatibility
    const userObj = user.toObject();
    userObj.id = userObj._id;

    res.json({ 
      message: 'Profile updated successfully', 
      user: userObj
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
};

// إضافة إلى المفضلة
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    const cakeId = req.params.cakeId;

    if (!user.favorites.includes(cakeId)) {
      user.favorites.push(cakeId);
      await user.save();
      return res.status(200).json({ 
        message: 'Cake added to favorites',
        favorites: user.favorites
      });
    }

    res.status(400).json({ message: 'Cake already in favorites' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to add to favorites',
      error: error.message 
    });
  }
};

// إزالة من المفضلة
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const cakeId = req.params.cakeId;

    console.log(`[Backend] Attempting to remove favorite. UserID: ${userId}, CakeID: ${cakeId}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log(`[Backend] User with ID ${userId} not found.`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('[Backend] User favorites before removal:', user.favorites.map(id => id.toString()));
    
    const initialCount = user.favorites.length;
    user.favorites = user.favorites.filter(
      (favId) => favId.toString() !== cakeId
    );
    const finalCount = user.favorites.length;

    console.log('[Backend] User favorites after removal:', user.favorites.map(id => id.toString()));

    if (initialCount === finalCount) {
      console.log(`[Backend] CakeID ${cakeId} was not found in user's favorites. No changes made.`);
    }

    await user.save();
    
    console.log('[Backend] Successfully saved user. Sending success response.');

    res.status(200).json({ 
      message: 'Cake removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    console.error('[Backend] Error in removeFromFavorites:', error);
    res.status(500).json({ 
      message: 'Failed to remove from favorites',
      error: error.message 
    });
  }
};

// عرض المفضلات
const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate('favorites');
    console.log('Populated favorites:', user.favorites);
    res.status(200).json({ 
      message: 'Favorites retrieved successfully',
      favorites: user.favorites 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to get favorites',
      error: error.message 
    });
  }
};

// تحقق من التوكن وأرجع بيانات المستخدم
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  verifyToken
};