const fs = require("fs");
const { ethers, run, network } = require("hardhat");
// const jsonContent = JSON.parse(data)

async function main() {
  const erebrusSubscriptionFactory = await hre.ethers.getContractFactory(
    "NetSepioV1"
  );
  const erebrusSubscription = await erebrusSubscriptionFactory.deploy();

  await erebrusSubscription.deployed();
  console.log(
    "NetSepioV1 Contract Deployed to:",
    erebrusSubscription.address
  );
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
