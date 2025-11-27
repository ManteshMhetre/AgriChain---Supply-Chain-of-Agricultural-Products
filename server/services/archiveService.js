const CompletedProduct = require("../models/CompletedProduct");

/**
 * Blockchain Event Listener Service
 * Listens for product delivery events and archives to database
 */

// State names mapping
const STATE_NAMES = [
  "Manufactured",
  "PurchasedByThirdParty",
  "ShippedByManufacturer",
  "ReceivedByThirdParty",
  "PurchasedByCustomer",
  "ShippedByThirdParty",
  "ReceivedByDeliveryHub",
  "ShippedByDeliveryHub",
  "ReceivedByCustomer",
];

/**
 * Fetch complete product data from blockchain
 * @param {Contract} contract - Smart contract instance
 * @param {number} uid - Product UID
 * @returns {Object} Complete product data
 */
async function fetchCompleteProductData(contract, uid) {
  try {
    // Fetch all parts of current product state
    const part1 = await contract.methods
      .fetchProductPart1(uid, "product", 0)
      .call();
    const part2 = await contract.methods
      .fetchProductPart2(uid, "product", 0)
      .call();
    const part3 = await contract.methods
      .fetchProductPart3(uid, "product", 0)
      .call();

    // Fetch complete history
    const historyLength = await contract.methods
      .fetchProductHistoryLength(uid)
      .call();
    const history = [];

    for (let i = 0; i < historyLength; i++) {
      const histPart1 = await contract.methods
        .fetchProductPart1(uid, "history", i)
        .call();
      const histPart2 = await contract.methods
        .fetchProductPart2(uid, "history", i)
        .call();
      const histPart3 = await contract.methods
        .fetchProductPart3(uid, "history", i)
        .call();

      history.push({
        state: parseInt(histPart2[5]),
        stateName: STATE_NAMES[histPart2[5]],
        timestamp: new Date(parseInt(histPart2[0]) * 1000),
        transactionHash: histPart3[5],
      });
    }

    // Calculate total time in supply chain
    const startTime = new Date(parseInt(part2[0]) * 1000);
    const endTime = new Date();
    const daysInSupplyChain = Math.floor(
      (endTime - startTime) / (1000 * 60 * 60 * 24)
    );

    return {
      uid: parseInt(part1[0]),
      sku: parseInt(part1[1]),

      productName: part2[1],
      productCode: parseInt(part2[2]),
      productPrice: parseInt(part2[3]),
      productCategory: part2[4],

      manufacturer: {
        address: part1[3],
        name: part1[4],
        details: part1[5],
        longitude: part1[6],
        latitude: part1[7],
        manufacturedDate: new Date(parseInt(part2[0]) * 1000),
      },

      thirdParty: {
        address: part2[6],
        longitude: part2[7],
        latitude: part3[0],
      },

      deliveryHub: {
        address: part3[1],
        longitude: part3[2],
        latitude: part3[3],
      },

      customer: {
        address: part3[4],
      },

      history: history,
      totalTimeInSupplyChain: `${daysInSupplyChain} days`,
    };
  } catch (error) {
    console.error(`❌ Error fetching product ${uid}:`, error.message);
    throw error;
  }
}

/**
 * Archive product to database
 * @param {Contract} contract - Smart contract instance
 * @param {number} uid - Product UID
 * @param {string} txHash - Transaction hash
 * @param {number} blockNumber - Block number
 * @param {string} contractAddress - Contract address
 */
async function archiveProduct(
  contract,
  uid,
  txHash,
  blockNumber,
  contractAddress
) {
  try {
    // Check if already archived
    const existing = await CompletedProduct.findOne({ uid: uid });
    if (existing) {
      console.log(`⚠️  Product ${uid} already archived. Skipping.`);
      return existing;
    }

    console.log(`📦 Fetching product ${uid} data from blockchain...`);

    // Fetch complete data from blockchain
    const productData = await fetchCompleteProductData(contract, uid);

    // Add blockchain reference info
    productData.blockchainContractAddress = contractAddress;
    productData.finalTransactionHash = txHash;
    productData.finalBlockNumber = blockNumber;
    productData.completedDate = new Date();

    // Save to MongoDB
    const archived = new CompletedProduct(productData);
    await archived.save();

    console.log(`✅ Product ${uid} successfully archived!`);
    console.log(`   Product: ${productData.productName}`);
    console.log(`   Category: ${productData.productCategory}`);
    console.log(`   Manufacturer: ${productData.manufacturer.name}`);
    console.log(`   Total time: ${productData.totalTimeInSupplyChain}`);
    console.log(`   History states: ${productData.history.length}`);

    return archived;
  } catch (error) {
    console.error(`❌ Error archiving product ${uid}:`, error.message);
    throw error;
  }
}

/**
 * Start listening for blockchain events
 * @param {Contract} contract - Smart contract instance
 * @param {string} contractAddress - Contract address
 */
function startEventListener(contract, contractAddress) {
  console.log("👂 Starting event listener...");
  console.log("   Listening for: ReceivedByCustomer events\n");

  // Listen for product delivery events
  contract.events
    .ReceivedByCustomer()
    .on("data", async (event) => {
      const uid = event.returnValues.uid;
      const blockNumber = event.blockNumber;
      const transactionHash = event.transactionHash;

      console.log(`\n🎉 DELIVERY COMPLETED! Product ${uid}`);
      console.log(`   Block: ${blockNumber}`);
      console.log(`   TX: ${transactionHash}`);
      console.log(`   Archiving to database...`);

      try {
        await archiveProduct(
          contract,
          uid,
          transactionHash,
          blockNumber,
          contractAddress
        );
      } catch (error) {
        console.error(`❌ Failed to archive product ${uid}:`, error.message);
      }
    })
    .on("error", (error) => {
      console.error("❌ Event listener error:", error.message);
    })
    .on("connected", (subscriptionId) => {
      console.log(`✅ Event listener connected (ID: ${subscriptionId})`);
    });
}

module.exports = {
  fetchCompleteProductData,
  archiveProduct,
  startEventListener,
};
