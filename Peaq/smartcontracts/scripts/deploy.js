const fs = require("fs");
const { ethers, run, network } = require("hardhat");
// const jsonContent = JSON.parse(data)

let contractAddress;
let blockNumber;
let Verified = false;

async function main() {
  const netsepioFactory = await hre.ethers.getContractFactory("NetSepioV1");
  const netsepio = await netsepioFactory.deploy();

  await netsepio.deployed();

  console.log("Netsepio Contract Deployed to:", netsepio.address);
  contractAddress = netsepio.address;
  blockNumber = netsepio.provider._maxInternalBlockNumber;

  

  let chainId;

  if (network.config.chainId != undefined) {
    chainId = network.config.chainId;
  } else {
    chainId = network.config.networkId;
  }

  console.log(`The chainId is ${chainId}`);
  const data = { chainId, contractAddress, Verified, blockNumber };
  const jsonString = JSON.stringify(data);
  // Log the JSON string
  console.log(jsonString);
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
