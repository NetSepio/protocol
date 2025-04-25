const { ChildProcess } = require("child_process");
const fs = require("fs");
const { ethers, run, network } = require("hardhat");
// const jsonContent = JSON.parse(data)

async function main() {
  const erebrusSubscriptionFactory = await hre.ethers.getContractFactory(
    "ErebrusSubscription"
  );
  const erebrusSubscription = await erebrusSubscriptionFactory.deploy();

  await erebrusSubscription.deployed();
  console.log(
    "ErebrusSubscription Contract Deployed to:",
    erebrusSubscription.address
  );

  if (network.name != "hardhat") {
    console.log("Waiting for block confirmations...");
    await erebrusSubscription.deployTransaction.wait(6);
    await verify(erebrusSubscription.address, []);
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
