const Invoice = require("../models/invoiceModel");
const Product = require("../models/productModel");
// utils fonction to calcultate total amont of a command

async function calculateTotalAmount(barCodeList) {
  const products = await Product.find({ barCode: { $in: barCodeList } });

  const orderedProducts = barCodeList.map(
    (barCode) => products.find((p) => p.barCode === barCode) || null
  );

  return orderedProducts
    .map((product) => product.price)
    .reduce((a, b) => a + b, 0);
}

//Products are not defined in this file because it's a list of products that are in the invoice
/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the invoice
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product
 *               price:
 *                 type: number
 *                 description: The price of the product
 *         totalAmount:
 *           type: number
 *           description: The total amount of the invoice
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the invoice was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the invoice was last updated
 *       required:
 *         - items
 *         - totalAmount
 *         - createdAt
 *         - updatedAt
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Get all invoices
async function getInvoices(req, res) {
  try {
    // Use req.user.userId to only get the users's invoices
    const invoices = await Invoice.find({
      userId: req.user.userId,
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
}

async function getAllInvoices(req, res) {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
}

// Create a new invoice
// Function to create a new invoice
async function createInvoiceLogic(req, invoiceData) {
  const { barCodes, totalAmount, id } = invoiceData;
  const status = "PENDING";

  // Fetch complete items from the database using barCodes
  const products = await Product.find({ barCode: { $in: barCodes } });

  const completeItems = barCodes.map((barCode) => {
    const product = products.find((p) => p.barCode === barCode);
    return {
      productId: parseInt(product.barCode),
      name: product.name,
      price: product.price,
      quantity: 1, // Assuming quantity is 1 for each barCode
    };
  });

  const newInvoice = new Invoice({
    items: completeItems,
    totalAmount,
    status,
    id,
    userId: req.user.userId,
  });

  await newInvoice.save();
  return newInvoice;
}

async function createInvoice(req, res, invoiceData) {
  try {
    const newInvoice = await createInvoiceLogic(req, invoiceData);
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
}

async function populateInvoiceWithProducts(invoice) {
  const productIds = invoice.items.map((item) => item.productId);
  const products = await Product.find({ barCode: { $in: productIds } });

  return {
    ...invoice.toObject(),
    items: invoice.items.map((item) => {
      const fullProduct =
        products.find((p) => p.barCode === item.productId) || {};
      return {
        ...item.toObject(),
        product: fullProduct,
      };
    }),
  };
}

// Fetch invoice info by ID
async function fetchInvoiceInfo(req, res) {
  try {
    const invoice = await Invoice.findOne({ id: req.params.invoiceId });
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(await populateInvoiceWithProducts(invoice));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
}

// Function to update an invoice
async function updateInvoiceLogic(updateData) {
  const { id, status } = updateData;
  console.log(updateData);

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { id },
    { status },
    { new: true }
  );

  if (!updatedInvoice) {
    throw new Error("Invoice not found");
  }

  return updatedInvoice;
}
async function updateInvoice(req, res) {
  try {
    const { invoiceId } = req.params;
    const updateData = req.body;

    if (!updateData)
      return res.status(400).json({ error: "Request body is empty" });

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true, runValidators: true } // Ensure validators run
    );

    if (!updatedInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(updatedInvoice);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Delete an invoice
async function deleteInvoice(req, res) {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(
      req.params.invoiceId
    );
    if (!deletedInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
}

module.exports = {
  getInvoices,
  getAllInvoices,
  createInvoice,
  createInvoiceLogic,
  fetchInvoiceInfo,
  updateInvoice,
  updateInvoiceLogic,
  deleteInvoice,
  calculateTotalAmount,
  populateInvoiceWithProducts,
};
