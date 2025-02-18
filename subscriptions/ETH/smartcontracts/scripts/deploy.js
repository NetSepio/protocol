const fs = require("fs");
const { ethers, run, network } = require("hardhat");
// const jsonContent = JSON.parse(data)

let contractAddress;
let blockNumber;
let Verified = false;

async function main() {
  const erebrusTrialSubscriptionFactory = await hre.ethers.getContractFactory(
    "ErebrusTrialSubscription"
  );
  const erebrusTrialSubscription =
    await erebrusTrialSubscriptionFactory.deploy();

  await erebrusTrialSubscription.deployed();
  console.log(
    "ErebrusTrialSubscription Contract Deployed to:",
    erebrusTrialSubscription.address
  );

  let chainId;

  if (network.config.chainId != undefined) {
    chainId = network.config.chainId;
  } else {
    chainId = network.config.networkId;
  }

  await verify(erebrusTrialSubscription.address, []);

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
