const { ethers, artifacts } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const contractAddress = "0x5CB2545Ed2E73056d3B93ce16d202453f2F7C5d9";
  const walletAddress = "0xfddcd9cF2445b6e7B90B5a0239167A42c8b71a28";

  /// fetching the abi
  const contractArtifact = await artifacts.readArtifact("ErebrusSubscription");
  const contract = new ethers.Contract(
    contractAddress,
    contractArtifact.abi,
    accounts[0]
  );

  /// TO grant ADMIN Role
  const ADMIN_ROLE = await contract.ADMIN_ROLE();

  const transactionResponse = await contract.grantRole(
    ADMIN_ROLE,
    walletAddress
  );

  const transactionReceipt = await transactionResponse.wait();

  if (transactionReceipt.status === 1) {
    console.log("Transaction successful");
  } else {
    console.log("Transaction failed");
  }

  //   const transactionResponse1 =
  //     await contract.delegateTicketCreationWithCustomRoyalty(
  //       walletAddress,
  //       "www.xyz.com",
  //       walletAddress,
  //       300
  //     );

  //   const transactionReceipt1 = await transactionResponse1.wait();

  //   if (transactionReceipt1.status === 1) {
  //     console.log("Transaction successful");
  //   } else {
  //     console.log("Transaction failed");
  //   }

  // const isAdmin = await contract.isOperator(walletAddress)
  // console.log(
  //     `Is the Wallet Address ${walletAddress} is Operator :  ${isAdmin}`
  // )
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
