const Web3 = require("web3");

/**
 * Connect to blockchain via Web3
 * @param {string} rpcUrl - RPC endpoint (WebSocket or HTTP)
 * @returns {Web3} Web3 instance
 */
const connectBlockchain = (rpcUrl) => {
  try {
    // Use WebSocket for event listening
    const provider = rpcUrl.startsWith("ws")
      ? new Web3.providers.WebsocketProvider(rpcUrl)
      : new Web3.providers.HttpProvider(rpcUrl);

    const web3 = new Web3(provider);

    console.log("✅ Connected to Blockchain");
    console.log(`   RPC: ${rpcUrl}`);

    return web3;
  } catch (error) {
    console.error("❌ Blockchain connection failed:", error.message);
    throw error;
  }
};

/**
 * Load smart contract instance
 * @param {Web3} web3 - Web3 instance
 * @param {Object} contractJSON - Contract ABI and networks
 * @param {string} address - Contract address
 * @returns {Contract} Contract instance
 */
const loadContract = (web3, contractJSON, address) => {
  try {
    const contract = new web3.eth.Contract(contractJSON.abi, address);

    console.log("✅ Contract loaded");
    console.log(`   Address: ${address}`);

    return contract;
  } catch (error) {
    console.error("❌ Contract loading failed:", error.message);
    throw error;
  }
};

module.exports = { connectBlockchain, loadContract };
