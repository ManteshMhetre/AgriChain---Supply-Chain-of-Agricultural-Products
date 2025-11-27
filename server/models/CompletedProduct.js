const mongoose = require("mongoose");

/**
 * MongoDB Schema for Completed Supply Chain Products
 * This stores archived data of products that have reached the customer
 * Serves as backup and enables fast queries without blockchain interaction
 */
const CompletedProductSchema = new mongoose.Schema(
  {
    // ========================================
    // PRODUCT IDENTIFICATION
    // ========================================
    uid: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      description: "Universal Product ID from blockchain",
    },
    sku: {
      type: Number,
      description: "Stock Keeping Unit",
    },

    // ========================================
    // PRODUCT DETAILS
    // ========================================
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productCode: {
      type: Number,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
      trim: true,
    },

    // ========================================
    // MANUFACTURER INFORMATION
    // ========================================
    manufacturer: {
      address: {
        type: String,
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      details: {
        type: String,
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
      manufacturedDate: {
        type: Date,
        required: true,
      },
    },

    // ========================================
    // THIRD PARTY (RETAILER) INFORMATION
    // ========================================
    thirdParty: {
      address: {
        type: String,
        index: true,
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
    },

    // ========================================
    // DELIVERY HUB INFORMATION
    // ========================================
    deliveryHub: {
      address: {
        type: String,
        index: true,
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
    },

    // ========================================
    // CUSTOMER INFORMATION
    // ========================================
    customer: {
      address: {
        type: String,
        required: true,
        index: true,
      },
    },

    // ========================================
    // SUPPLY CHAIN JOURNEY (Complete History)
    // ========================================
    history: [
      {
        state: {
          type: Number,
          description: "State enum value (0-8)",
        },
        stateName: {
          type: String,
          description: "Human-readable state name",
        },
        timestamp: {
          type: Date,
        },
        blockNumber: {
          type: Number,
        },
        transactionHash: {
          type: String,
        },
      },
    ],

    // ========================================
    // COMPLETION INFORMATION
    // ========================================
    completedDate: {
      type: Date,
      default: Date.now,
      index: true,
      description: "When product reached customer",
    },
    totalTimeInSupplyChain: {
      type: String,
      description: 'Total time from manufacture to delivery (e.g., "15 days")',
    },

    // ========================================
    // BLOCKCHAIN REFERENCES (For Verification)
    // ========================================
    blockchainContractAddress: {
      type: String,
      required: true,
      description: "Address of SupplyChain contract",
    },
    finalTransactionHash: {
      type: String,
      description: "Transaction hash of final delivery",
    },
    finalBlockNumber: {
      type: Number,
      description: "Block number of final delivery",
    },

    // ========================================
    // METADATA
    // ========================================
    archivedAt: {
      type: Date,
      default: Date.now,
      description: "When this record was saved to database",
    },
    archivedBy: {
      type: String,
      default: "Automated Service",
      description: "Who/what archived this record",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "completed_products",
  }
);

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================
CompletedProductSchema.index({ completedDate: -1 });
CompletedProductSchema.index({ "manufacturer.address": 1 });
CompletedProductSchema.index({ "customer.address": 1 });
CompletedProductSchema.index({ productCategory: 1 });
CompletedProductSchema.index({ uid: 1, completedDate: -1 });

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Get formatted completion summary
 */
CompletedProductSchema.methods.getSummary = function () {
  return {
    uid: this.uid,
    productName: this.productName,
    manufacturer: this.manufacturer.name,
    customer: this.customer.address,
    completedDate: this.completedDate,
    totalTime: this.totalTimeInSupplyChain,
    stateChanges: this.history.length,
  };
};

/**
 * Check if product can be verified on blockchain
 */
CompletedProductSchema.methods.getVerificationInfo = function () {
  return {
    contractAddress: this.blockchainContractAddress,
    uid: this.uid,
    finalTxHash: this.finalTransactionHash,
    finalBlock: this.finalBlockNumber,
  };
};

// ========================================
// STATIC METHODS
// ========================================

/**
 * Get statistics for dashboard
 */
CompletedProductSchema.statics.getStatistics = async function () {
  const totalCompleted = await this.countDocuments();

  const last30Days = await this.countDocuments({
    completedDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  const last7Days = await this.countDocuments({
    completedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  // Get oldest and newest records
  const oldest = await this.findOne().sort({ completedDate: 1 });
  const newest = await this.findOne().sort({ completedDate: -1 });

  return {
    totalCompleted,
    last30Days,
    last7Days,
    oldestRecord: oldest?.completedDate,
    newestRecord: newest?.completedDate,
  };
};

/**
 * Search products with filters
 */
CompletedProductSchema.statics.searchProducts = async function (filters) {
  const query = {};

  if (filters.manufacturer) {
    query["manufacturer.address"] = filters.manufacturer;
  }

  if (filters.customer) {
    query["customer.address"] = filters.customer;
  }

  if (filters.category) {
    query.productCategory = filters.category;
  }

  if (filters.startDate || filters.endDate) {
    query.completedDate = {};
    if (filters.startDate) {
      query.completedDate.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.completedDate.$lte = new Date(filters.endDate);
    }
  }

  return await this.find(query).sort({ completedDate: -1 });
};

module.exports = mongoose.model("CompletedProduct", CompletedProductSchema);
