const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const swagger = require("./docs/swagger.js");
const User = require("./models/userModel");
const Invoice = require("./models/invoiceModel");
const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paypalRoutes = require("./routes/paypalRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");
const Product = require('./models/productModel');
const { fetchProductInfo } = require("./controllers/productController.js");

// Initialize dotenv for environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use("/api-docs", swagger.serve, swagger.setup);

// CSRF Protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  },
});

// MongoDB connection setup
let mongoServer;
console.log("NODE_ENV:", process.env.NODE_ENV);
const isTest = process.env.NODE_ENV === "test";

async function connectDatabase() {
  if (isTest) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri(); // Use in-memory DB
  }

  const dbURI = process.env.MONGO_URI || "mongodb://localhost:27017/trinity";
  await mongoose.connect(dbURI);
  console.log(`Connected to ${isTest ? "Test" : "Main"} Database`);

  try {
    // Create admin user (test or main database)
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      let password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD || "testpassword", 10);
      const defaultAdmin = new User({
        username: "admin",
        email: "admin@gmail.com",
        password: password,
        role: "admin",
      });

      await defaultAdmin.save();
      console.log("Default admin user created.");
    } else {
      console.log("Admin user already exists.");
    }

    // Create default products

    const products = await Product.find({});
    if (products.length === 0) {
      fetchProductInfo({ barCode: "1234" });
      fetchProductInfo({ barCode: "12" });
      fetchProductInfo({ barCode: "123" });
      fetchProductInfo({ barCode: "12345" });
      fetchProductInfo({ barCode: "456" });

      console.log("Default products created.");
    } else {
      console.log("Products already exist in database.");
    }

    // Only generate invoices in non-test environments
    if (!isTest) {
      const getRandomDate = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 15);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      };
    
      // Fetch all products first with barCode
      const products = await Product.find({}).select('_id price barCode');

      if (products.length === 0) {
        console.log("No products found in database. Skipping invoice generation.");
        return;
      }

      for (let i = 0; i < 20; i++) {
        // Generate 1-5 random items using real product IDs
        const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          return {
            productId: randomProduct._id,
            quantity: Math.floor(Math.random() * 10) + 1,
            price: randomProduct.price || parseFloat((Math.random() * 100).toFixed(2)),
          };
        });

        const totalAmount = parseFloat(items.reduce((sum, item) => 
          sum + item.quantity * item.price, 0).toFixed(2));
        const randomDate = getRandomDate();

        const invoice = new Invoice({
          id: Math.random() * 100,
          userId: "0",
          items: items,
          totalAmount: totalAmount,
          status: ["pending", "paid", "canceled"][Math.floor(Math.random() * 3)],
          createdAt: randomDate,
          updatedAt: randomDate,
        });

        await invoice.save();
      }
    
      console.log("Default invoices created with real product IDs.");
    }
  
  } catch (err) {
    console.error(err);
  }
}



// Connect to MongoDB when not testing
if (!isTest) {
  connectDatabase();
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", authMiddleware, csrfProtection, invoiceRoutes);
app.use("/api/products", authMiddleware, csrfProtection, productRoutes);
app.use("/api/reports", authMiddleware, csrfProtection, reportRoutes);
app.use("/api/users", authMiddleware, csrfProtection, userRoutes);
app.use("/api/admin", authMiddleware, csrfProtection, adminRoutes);
app.use("/api/paypal", authMiddleware, csrfProtection, paypalRoutes);

// CSRF token route
/**
 * @swagger
 * /api/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSRF token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   example: 'csrf-token-value'
 *       401:
 *         description: Unauthorized
 */
app.get("/api/csrf-token", authMiddleware, csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// CSRF error handling
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 8080;
let server;

if (!module.parent) {
  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

module.exports.closeServer = async () => {
  if (server) {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    server.close();
  }
};
