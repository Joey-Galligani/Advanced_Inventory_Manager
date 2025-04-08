// controllers/productController.js
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Product Name
 *         category:
 *           type: string
 *           example: Category Name
 *         ingredients:
 *           type: array
 *           items:
 *             type: string
 *             example: Ingredient 1
 *         imageUrl:
 *           type: string
 *           example: http://example.com/image.jpg
 *         barCode:
 *           type: string
 *           example: 123456789012
 *         ratings:
 *           type: array
 *           items:
 *             type: number
 *             example: 4.5
 *         averageRating:
 *           type: number
 *           example: 4.5
 *         price:
 *           type: number
 *           example: 19.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-10-16T12:34:56Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-10-16T12:34:56Z
 */

const Invoice = require("../models/invoiceModel");
const Product = require("../models/productModel");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function generateRandomPrice(category) {
  let minPrice = 1.0;
  let maxPrice = 20.0;

  // Define price ranges based on the category
  if (category) {
    if (category.includes("Boissons")) {
      minPrice = 1.0; // Minimum price for beverages
      maxPrice = 5.0; // Maximum price for beverages
    } else if (category.includes("Snacks")) {
      minPrice = 0.5; // Minimum price for snacks
      maxPrice = 3.0; // Maximum price for snacks
    } else if (category.includes("Produits frais")) {
      minPrice = 2.0; // Minimum price for fresh products
      maxPrice = 10.0; // Maximum price for fresh products
    }
  }

  // Generate a random price within the range
  const randomPrice = (
    Math.random() * (maxPrice - minPrice) +
    minPrice
  ).toFixed(2);
  return parseFloat(randomPrice); // Return the price as a number
}

// Get all products
const getProducts = async (req, res) => {
  try {
    const { limit = 25, offset = 0 } = req.query;
    const products = await Product.find()
      .skip(parseInt(offset))
      .limit(parseInt(limit)); // Retrieve all products from MongoDB
    for (const product of products) {
      // Check if the product was updated more than a day ago
      if (
        product.updatedAt <
        new Date(new Date().setDate(new Date().getDate() - 1))
      ) {
        // Fetch the product information from Open Food Facts API
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${product.barCode}.json`
        );
        const data = await response.json();

        if (data.status === 1) {
          product.name = data.product.product_name;
          product.description = data.product.generic_name;
          product.stock = data.product.stock;
          product.imageUrl = data.product.image_url;
          product.category = data.product.categories;
          product.ingredients = data.product.ingredients_text_fr;
          product.price = generateRandomPrice(data.product.categories);
        }
      }
      // Save the updated product with the average rating==)
      await product.save();
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error retrieving products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBoughtProducts = async (req, res) => {
  try {
    const ownInvoices = await Invoice.find({ userId: req.user.userId });

    const productIds = ownInvoices.flatMap(
      (i) => i.items?.map((item) => item.productId) || []
    );

    if (productIds.length === 0) {
      return res.status(200).json([]);
    }

    const allInvoicesProducts = await Product.find({
      barCode: { $in: productIds },
    }).lean();

    const productsWithUserRating = allInvoicesProducts.map((p) => {
      const rating =
        p.ratings.find(
          (r) => r.user.toString() === req.user.userId.toString()
        )?.rating || 0;
      return { ...p, rating };
    });

    res.status(200).json(productsWithUserRating);
  } catch (err) {
    console.error("Error retrieving bought products:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const { name, category, ingredients, imageUrl, barCode, price, stock } =
    req.body;

  try {
    // Check if the product already exists in the database
    const existingProduct = await Product.findOne({
      barCode,
    });
    if (stock === undefined) {
      stock = 0;
    }
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }
    // Check if the price is provided
    if (price === undefined) {
      price = generateRandomPrice(category);
    }
    // Create new product with the provided data
    const newProduct = new Product({
      name,
      category,
      ingredients,
      imageUrl,
      barCode,
      stock,
      price,
    });

    // Save the product to the database
    await newProduct.save();

    // Save the updated product with the average rating
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch product information from Open Food Facts API
const fetchProductInfo = async (req, res) => {
  const { barCode } = req.params;

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barCode}.json`
    );

    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error("Error parsing response:", err);
      res.status(500).json({ error: "Server error" });
    }

    if (data.status === 1) {
      const product = await Product.findOne({ barCode });
      // Check if the product already exists in the database
      if (!product) {
        // Create the product in the database
        const name = data.product.product_name;
        const category = data.product.categories;
        const ingredients = data.product.ingredients_text_fr;
        const imageUrl = data.product.image_url;
        const price = generateRandomPrice(data.product.categories);
        const newProduct = new Product({
          name,
          category,
          ingredients,
          imageUrl,
          barCode,
          price,
        });

        res.status(200).json(newProduct);

        // Save the product to the database
        await newProduct.save();

        // Calculate the average rating after saving
        newProduct.calculateAverageRating();

        // Save the updated product with the average rating
        await newProduct.save();
      } else {
        if (
          product.updatedAt <
          new Date(new Date().setDate(new Date().getDate() - 1))
        ) {
          product.name = data.product.product_name;
          product.description = data.product.generic_name;
          product.imageUrl = data.product.image_url;
          product.category = data.product.categories;
          product.ingredients = data.product.ingredients_text_fr;
          product.ratings = data.product.ratings;
          product.price = generateRandomPrice(data.product.categories);
          await product.save();
        }

        res.status(200).json(product);
      }
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (err) {
    console.error("Error fetching product info:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  const { barCode } = req.params;
  const { name, description, price, category, stock, imageUrl } = req.body;

  try {
    const product = await Product.findOne({ barCode });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (stock === undefined) {
      stock = product.stock;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.imageUrl = imageUrl;
    product.barCode = barCode;

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateRating = async (req, res) => {
  const { barCode } = req.params;
  const { rating, comment } = req.body;
  const { user } = req;
  console.log(user);

  try {
    const product = await Product.findOne({ barCode });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (rating < 0 || rating > 5 || isNaN(rating)) {
      return res.status(400).json({ error: "Invalid rating value" });
    }

    // Check if the user already rated the product
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === user.userId.toString()
    );

    if (existingRating) {
      // Update the existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      // Add a new rating
      product.ratings.push({ user: user.userId, rating, comment });
    }

    // Recalculate the average rating
    product.calculateAverageRating();

    await product.save();

    res.status(200).json(product);
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  const { barCode } = req.params;

  try {
    const product = await Product.findOneAndDelete({
      barCode,
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const searchProductsByName = async (req, res) => {
  const { query } = req.query;

  try {
    const products = await Product.find({
      name: {
        $regex: query,
        $options: "i",
      },
    });

    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({
        error: "No products found for the query",
      });
    }
  } catch (err) {
    console.error("Error searching for products:", err);
    res.status(500).json({
      error: "Server error",
    });
  }
};

module.exports = {
  getProducts,
  getBoughtProducts,
  createProduct,
  fetchProductInfo,
  updateProduct,
  updateRating,
  deleteProduct,
  searchProductsByName,
};
