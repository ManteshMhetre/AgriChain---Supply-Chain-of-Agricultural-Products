const express = require("express");
const router = express.Router();
const CompletedProduct = require("../models/CompletedProduct");
const { archiveProduct } = require("../services/archiveService");

/**
 * @route   GET /api/products
 * @desc    Get all completed products
 * @access  Public
 */
router.get("/products", async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;

    const products = await CompletedProduct.find()
      .sort({ completedDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CompletedProduct.countDocuments();

    res.json({
      success: true,
      count: products.length,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/products/:uid
 * @desc    Get specific product by UID
 * @access  Public
 */
router.get("/products/:uid", async (req, res) => {
  try {
    const product = await CompletedProduct.findOne({
      uid: parseInt(req.params.uid),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found in archive",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get archive statistics
 * @access  Public
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await CompletedProduct.getStatistics();

    // Calculate average delivery time
    const products = await CompletedProduct.find();
    let totalDays = 0;
    let count = 0;

    products.forEach((p) => {
      const days = parseInt(p.totalTimeInSupplyChain);
      if (!isNaN(days)) {
        totalDays += days;
        count++;
      }
    });

    const avgDeliveryTime = count > 0 ? Math.round(totalDays / count) : 0;

    // Category breakdown
    const categories = await CompletedProduct.aggregate([
      { $group: { _id: "$productCategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        ...stats,
        averageDeliveryTime: `${avgDeliveryTime} days`,
        categoryBreakdown: categories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/search
 * @desc    Search products with filters
 * @access  Public
 */
router.get("/search", async (req, res) => {
  try {
    const filters = {
      manufacturer: req.query.manufacturer,
      customer: req.query.customer,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const products = await CompletedProduct.searchProducts(filters);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/archive/:uid
 * @desc    Manually archive a product (if event was missed)
 * @access  Public
 */
router.post("/archive/:uid", async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const { contract, contractAddress } = req.app.locals;

    // Check if already archived
    const existing = await CompletedProduct.findOne({ uid: uid });
    if (existing) {
      return res.json({
        success: true,
        message: "Product already archived",
        data: existing,
      });
    }

    // Verify product is completed on blockchain
    const state = await contract.methods.fetchProductState(uid).call();
    if (state != 8) {
      // 8 = ReceivedByCustomer
      return res.status(400).json({
        success: false,
        error: `Product not yet completed on blockchain (current state: ${state})`,
      });
    }

    // Archive the product
    const archived = await archiveProduct(
      contract,
      uid,
      "manual",
      0,
      contractAddress
    );

    res.json({
      success: true,
      message: "Product archived successfully",
      data: archived,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/export
 * @desc    Export all archived data (backup)
 * @access  Public
 */
router.get("/export", async (req, res) => {
  try {
    const allProducts = await CompletedProduct.find();

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=supplychain-archive-backup.json"
    );
    res.json({
      exportDate: new Date(),
      totalRecords: allProducts.length,
      data: allProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/manufacturer/:address
 * @desc    Get all products by manufacturer
 * @access  Public
 */
router.get("/manufacturer/:address", async (req, res) => {
  try {
    const products = await CompletedProduct.find({
      "manufacturer.address": req.params.address,
    }).sort({ completedDate: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/customer/:address
 * @desc    Get all products received by customer
 * @access  Public
 */
router.get("/customer/:address", async (req, res) => {
  try {
    const products = await CompletedProduct.find({
      "customer.address": req.params.address,
    }).sort({ completedDate: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
