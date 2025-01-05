const fs = require("fs");
const { ethers, run, network } = require("hardhat");
// const jsonContent = JSON.parse(data)

let contractAddress;
let blockNumber;
let Verified = false;

async function main() {
  const erebrusFactory = await hre.ethers.getContractFactory("ErebrusV1");
  const erebrus = await erebrusFactory.deploy();

  await erebrus.deployed();

  console.log("Erebrus Contract Deployed to:", erebrus.address);
  contractAddress = erebrus.address;
  blockNumber = erebrus.provider._maxInternalBlockNumber;

  /// VERIFY
  if (hre.network.name != "hardhat") {
    await erebrus.deployTransaction.wait(6);
    await verify(erebrus.address, []);
  }

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

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    Verified = true;
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
