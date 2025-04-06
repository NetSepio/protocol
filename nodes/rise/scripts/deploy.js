const fs = require("fs");
const { ethers, run, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const initialBalance = await deployer.getBalance();

  let chainId;
  if (network.config.chainId != undefined) {
    chainId = network.config.chainId;
  } else {
    chainId = network.config.networkId;
  }

  console.log(
    "Deployer balance before deployment:",
    ethers.utils.formatEther(initialBalance),
    "ETH in chainId: ",
    chainId
  );

  const netsepioFactory = await hre.ethers.getContractFactory("NetSepioV1");
  const netsepio = await netsepioFactory.deploy();

  await netsepio.deployed();

  console.log("Netsepio Contract Deployed to:", netsepio.address);

  const finalBalance = await deployer.getBalance();
  console.log(
    "Deployer balance after deployment:",
    ethers.utils.formatEther(finalBalance),
    "ETH"
  );

  console.log("Netsepio Contract Deployed to:", netsepio.address);
  
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
