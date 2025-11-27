require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./config/database");
const { connectBlockchain, loadContract } = require("./config/blockchain");
const { startEventListener } = require("./services/archiveService");
const apiRoutes = require("./routes/api");
const SupplyChainContract = require("../client/src/contracts/SupplyChain.json");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment variables
const {
  MONGODB_URI,
  BLOCKCHAIN_RPC,
  CONTRACT_ADDRESS,
  PORT = 5000,
  NODE_ENV = "development",
} = process.env;

// Validate environment variables
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

if (!BLOCKCHAIN_RPC) {
  console.error("❌ BLOCKCHAIN_RPC not found in environment variables");
  process.exit(1);
}

if (!CONTRACT_ADDRESS) {
  console.error("❌ CONTRACT_ADDRESS not found in environment variables");
  console.log("💡 Hint: Run truffle migrate and copy the contract address");
  process.exit(1);
}

// Startup function
async function startServer() {
  try {
    console.log("\n🚀 Starting Supply Chain Archive Service...\n");

    // Connect to MongoDB
    await connectDB(MONGODB_URI);

    // Connect to Blockchain
    const web3 = connectBlockchain(BLOCKCHAIN_RPC);

    // Load smart contract
    const contract = loadContract(web3, SupplyChainContract, CONTRACT_ADDRESS);

    // Store contract instance in app locals for route access
    app.locals.contract = contract;
    app.locals.contractAddress = CONTRACT_ADDRESS;

    // Start event listener
    startEventListener(contract, CONTRACT_ADDRESS);

    // Mount API routes
    app.use("/api", apiRoutes);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "running",
        environment: NODE_ENV,
        database: "connected",
        blockchain: "connected",
        contract: CONTRACT_ADDRESS,
        timestamp: new Date().toISOString(),
      });
    });

    // Root endpoint
    app.get("/", (req, res) => {
      res.json({
        service: "Supply Chain Archive Service",
        version: "1.0.0",
        status: "operational",
        endpoints: {
          health: "/health",
          products: "/api/products",
          productById: "/api/products/:uid",
          stats: "/api/stats",
          search: "/api/search",
          export: "/api/export",
          manualArchive: "/api/archive/:uid",
          byManufacturer: "/api/manufacturer/:address",
          byCustomer: "/api/customer/:address",
        },
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: "Endpoint not found",
        path: req.path,
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error("❌ Server error:", err);
      res.status(500).json({
        success: false,
        error:
          NODE_ENV === "development" ? err.message : "Internal server error",
      });
    });

    // Start listening
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("✅ Archive Service Running Successfully!");
      console.log("=".repeat(60));
      console.log(`   Environment: ${NODE_ENV}`);
      console.log(`   Server: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   Stats: http://localhost:${PORT}/api/stats`);
      console.log(`   Contract: ${CONTRACT_ADDRESS}`);
      console.log("=".repeat(60) + "\n");
    });
  } catch (error) {
    console.error("\n❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n⚠️  SIGTERM received, shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n⚠️  SIGINT received, shutting down gracefully...");
  await closeDB();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Start the server
startServer();
