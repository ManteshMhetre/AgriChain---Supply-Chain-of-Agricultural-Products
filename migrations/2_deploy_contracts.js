var SupplyChainContract = artifacts.require("./SupplyChain.sol");

module.exports = function (deployer) {
  deployer.deploy(SupplyChainContract, { gas: 15555555 });
};
