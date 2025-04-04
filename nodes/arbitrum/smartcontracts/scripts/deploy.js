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

  if (network.name != "hardhat") {
    console.log("Waiting for block confirmations...");
    await netsepio.deployTransaction.wait(6);
    await verify(netsepio.address)
  }
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
