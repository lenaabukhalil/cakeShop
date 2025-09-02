const mongoose = require('mongoose');
require('dotenv').config();

const Cake = require('./models/Cake');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // 1. حذف كل البيانات القديمة
  await Cake.deleteMany({});
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await Review.deleteMany({});

  // 2. إضافة كيكات
  const cakesToInsert = [
    {
      _id: new mongoose.Types.ObjectId('68541b6495683f14bcbfe716'),
      name: "Custom Cake",
      description: "This cake was added manually with a specific id.",
      price: 30,
      flavor: "vanilla",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      ratings: [5, 4, 5],
      customizable: true,
      stock: 5,
      category: "Custom",
      ingredients: ["flour", "sugar", "eggs"],
      createdAt: new Date(),
      baker: "Manual Baker"
    },
    // Birthday Cakes
    {
      name: "Classic Chocolate Birthday Cake",
      description: "A rich and moist chocolate cake, perfect for any birthday celebration.",
      price: 45,
      flavor: "Chocolate",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b1f?w=400",
      ratings: [5, 5, 4],
      customizable: true,
      stock: 10,
      category: "Birthday",
      ingredients: ["chocolate", "flour", "sugar", "butter"],
      baker: "Sweet Celebrations"
    },
    // Wedding Cakes
    {
      name: "Elegant Tiered Wedding Cake",
      description: "A stunning three-tiered wedding cake with delicate floral decorations.",
      price: 350,
      flavor: "Vanilla Bean",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1588201735440-927b58f27a35?w=400",
      ratings: [5, 5, 5],
      customizable: true,
      stock: 3,
      category: "Wedding",
      ingredients: ["vanilla bean", "almond flour", "buttercream"],
      baker: "Bridal Bakes"
    },
    // Cupcakes
    {
      name: "Red Velvet Cupcakes",
      description: "A dozen classic red velvet cupcakes with cream cheese frosting.",
      price: 35,
      flavor: "Red Velvet",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1614707267537-7897254d4314?w=400",
      ratings: [4, 5, 4],
      customizable: false,
      stock: 20,
      category: "Cupcakes",
      ingredients: ["cocoa powder", "buttermilk", "cream cheese"],
      baker: "Cupcake Corner"
    },
    // Cookies
    {
      name: "Chocolate Chip Cookies",
      description: "A batch of warm, gooey, homemade chocolate chip cookies.",
      price: 15,
      flavor: "Chocolate Chip",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1598184288482-6f17a5a3d78f?w=400",
      ratings: [5, 4, 5],
      customizable: false,
      stock: 50,
      category: "Cookies",
      ingredients: ["chocolate chips", "brown sugar", "vanilla extract"],
      baker: "Cookie Co."
    },
    // Cheesecakes
    {
      name: "New York Cheesecake",
      description: "A classic, dense, and creamy New York-style cheesecake.",
      price: 40,
      flavor: "Original",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1565299543923-a3dd32a7925c?w=400",
      ratings: [5, 5, 5],
      customizable: false,
      stock: 8,
      category: "Cheesecakes",
      ingredients: ["cream cheese", "graham cracker crust", "sour cream"],
      baker: "The Cheesecake Factory"
    },
    // Holiday Cakes
    {
      name: "Festive Holiday Log Cake",
      description: "A beautiful and delicious log cake, perfect for the holiday season.",
      price: 55,
      flavor: "Chocolate Ganache",
      available: true,
      imageUrl: "https://images.unsplash.com/photo-1574085449297-9370a9e440d2?w=400",
      ratings: [4, 5, 5],
      customizable: true,
      stock: 12,
      category: "Holiday",
      ingredients: ["chocolate sponge", "ganache", "powdered sugar"],
      baker: "Holiday Bakes"
    }
  ];

  console.log(`About to insert ${cakesToInsert.length} cakes into the database.`);

  const cakes = await Cake.insertMany(cakesToInsert);

  // 3. إضافة مستخدمين
  const hashedPassword = await bcrypt.hash('123456', 10);
  const users = await User.insertMany([
    {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      phoneNumber: "1234567890",
      role: "user",
      favorites: [cakes[0]._id]
    },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin"
    }
  ]);

  // 4. إضافة سلة لمستخدم
  await Cart.create({
    user: users[0]._id,
    items: [
      { cake: cakes[0]._id, quantity: 2 }
    ]
  });

  // 5. إضافة طلب
  await Order.create({
    user: users[0]._id,
    cakes: [
      { cake: cakes[0]._id, quantity: 1 }
    ],
    totalAmount: cakes[0].price * 1,
    paymentMethod: "Cash",
    shippingAddress: "123 Main St",
    contactPhone: "1234567890",
    isPaid: false,
    status: "Pending"
  });

  // 6. إضافة مراجعة
  await Review.create({
    user: users[0]._id,
    cake: cakes[0]._id,
    rating: 5,
    comment: "Amazing cake!"
  });

  console.log("✅ Seed data inserted successfully!");
  process.exit();
}

seed(); 