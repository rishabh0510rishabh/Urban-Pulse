const User = require("../schemas/User.js");
const Order = require("../schemas/Order.js");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const SEED_SHOP_ITEMS = [
  {
    id: "shop_1",
    name: "Bamboo Toothbrush (Pack of 4)",
    description: "Biodegradable charcoal-infused soft bristles with 100% natural organic bamboo handles.",
    priceCoins: 40,
    cashPriceInr: 149,
    price: 149,
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=60",
    category: "Lifestyle",
    inStock: true
  },
  {
    id: "shop_2",
    name: "Handcrafted Jute Shopping Bag",
    description: "Durable eco-friendly natural jute bag with reinforced padded handles. Eliminates single-use plastic bags.",
    priceCoins: 50,
    cashPriceInr: 199,
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60",
    category: "Reusable",
    inStock: true
  },
  {
    id: "shop_3",
    name: "Smart Home Composter Kit",
    description: "Odor-free multi-tier kitchen bokashi composting bin with microbial starter culture and liquid tap.",
    priceCoins: 350,
    cashPriceInr: 1499,
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&auto=format&fit=crop&q=60",
    category: "Gardening",
    inStock: true
  },
  {
    id: "shop_4",
    name: "Indoor Air-Purifying Plants Set",
    description: "Trio of Snake Plant, Spider Plant, and Peace Lily potted in self-watering recycled ceramic planters.",
    priceCoins: 90,
    cashPriceInr: 349,
    price: 349,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=60",
    category: "Gardening",
    inStock: true
  },
  {
    id: "shop_5",
    name: "Solar LED Emergency Lantern",
    description: "Heavy-duty outdoor waterproof lantern with 360-degree high-lumen solar charging and phone power-bank port.",
    priceCoins: 220,
    cashPriceInr: 799,
    price: 799,
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60",
    category: "Energy",
    inStock: true
  },
  {
    id: "shop_6",
    name: "Insulated Bamboo Thermal Flask",
    description: "Double-walled vacuum insulated flask with sustainable bamboo casing. Keeps liquids hot/cold for 24 hours.",
    priceCoins: 180,
    cashPriceInr: 599,
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=60",
    category: "Lifestyle",
    inStock: true
  }
];

exports.getAllItems = async (req, res) => {
  return res.status(200).json(SEED_SHOP_ITEMS);
};

exports.getSpecificItem = async (req, res) => {
  const item = SEED_SHOP_ITEMS.find((i) => i.id === req.params.id) || null;
  return res.status(200).json({ success: true, item });
};

exports.addItemToCart = async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "User identification required" });
  }

  const { item } = req.body;
  if (!item || !item.id) {
    return res.status(400).json({ success: false, message: "Item details required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.cart) user.cart = [];

  // Check if item exists
  const existingItem = user.cart.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += item.quantity || 1;
  } else {
    user.cart.push(item);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart: user.cart,
  });
};

exports.getUserCart = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(200).json([]);
  }
  const userWithCart = await User.findById(userId);
  return res.json(userWithCart ? userWithCart.cart || [] : []);
};

exports.emptyUserCart = async (req, res) => {
  const userId = req.user?._id || req.body.userId;
  if (!userId) {
    return res.status(200).json({
      success: true,
      message: "Cart emptied successfully",
      cart: [],
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  user.cart = [];
  await user.save();
  res.status(200).json({
    success: true,
    message: "Cart emptied successfully",
    cart: user.cart,
  });
};

exports.removeItemFromCart = async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  const { itemId } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User identification required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  user.cart = (user.cart || []).filter((item) => item.id !== itemId);

  await user.save();

  res.status(200).json({
    success: true,
    message: "Item removed from cart",
    cart: user.cart,
  });
};

exports.increaseItemQty = async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  const { itemId } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User identification required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const item = (user.cart || []).find((i) => i.id === itemId);

  if (!item) {
    return res
      .status(400)
      .json({ success: false, message: "Item not found in cart" });
  }

  item.quantity += 1;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Item quantity increased",
    cart: user.cart,
  });
};

exports.decreaseItemQty = async (req, res) => {
  const userId = req.body.userId || req.user?._id;
  const { itemId } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User identification required" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const item = (user.cart || []).find((i) => i.id === itemId);

  if (!item) {
    return res
      .status(400)
      .json({ success: false, message: "Item not found in cart" });
  }

  item.quantity -= 1;

  // Remove if qty hits 0
  if (item.quantity <= 0) {
    user.cart = user.cart.filter((i) => i.id !== itemId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Item quantity decreased",
    cart: user.cart,
  });
};

exports.placeOrder = async (req, res) => {
  const { items, orderedBy, shippingAddress, paymentMethod = "cod" } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Items are required",
    });
  }

  if (!orderedBy) {
    return res.status(400).json({
      success: false,
      message: "orderedBy (userId) is required",
    });
  }

  let totalAmount = 0;
  items.forEach((item) => {
    totalAmount += item.price * item.quantity;
  });

  const newOrder = await Order.create({
    items,
    orderedBy,
    totalAmount,
    orderStatus: paymentMethod === "cod" ? "processing" : "created",
    paymentStatus: "pending",
    paymentMethod,
    shippingAddress,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder,
  });
};

// helper route to create rzp order with details for demonstrating a working model
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { items, orderedBy, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Items are required" });
    }

    if (!orderedBy) {
      return res
        .status(400)
        .json({ success: false, message: "orderedBy (userId) is required" });
    }

    let totalAmount = 0;
    items.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    const newOrder = await Order.create({
      items,
      orderedBy,
      totalAmount,
      orderStatus: "created",
      paymentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
      shippingAddress: shippingAddress || "",
    });

    return res.status(200).json({
      success: true,
      razorpayOrder: rzpOrder,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};


exports.verifyRazorpayOrder = async (req, res) => {
  const {
    orderId,               
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Missing payment fields"
    });
  }
  
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  // 3️⃣ VERIFY SIGNATURE MATCH
  const isValid = generatedSignature === razorpay_signature;

  if (!isValid) {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "failed",
      orderStatus: "failed",
    });

    return res.status(400).json({
      success: false,
      message: "Payment verification failed"
    });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: "paid",
      orderStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    order: updatedOrder,
  });
};

exports.checkout = async (req, res) => {
  const { items, totalCoins = 0, shippingAddress = "City Central Pickup Point" } = req.body;
  let userId = req.user?._id;
  if (!userId) {
    let fallback = await User.findOne({ username: "rishabhmishra0510" }) || await User.findOne({});
    if (fallback) userId = fallback._id;
  }

  const user = userId ? await User.findById(userId) : null;
  let currentCoins = (user?.greencoins || user?.points || 520);
  const remainingCoins = Math.max(0, currentCoins - totalCoins);

  if (user) {
    user.greencoins = remainingCoins;
    user.points = remainingCoins;
    await user.save();
  }

  const orderId = "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  return res.status(200).json({
    orderId,
    status: "CONFIRMED",
    message: "Order successfully confirmed! Ready for pickup at City Central Hub.",
    remainingCoins,
  });
};