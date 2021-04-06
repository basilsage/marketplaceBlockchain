// this file takes the smart contracts and puts them on the blockchain

const Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
};
