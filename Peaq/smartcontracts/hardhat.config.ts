import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ETH-RPC-URL";

const PEAQ_AUGUNG_TESTNET = "https://rpcpc1-qa.agung.peaq.network";

//// MAINNET

const PEAQ_RPC_URL = "https://peaq-rpc.dwellir.com";

const MNEMONIC =
  process.env.MNEMONIC ||
  "ajkskjfjksjkf ssfaasff asklkfl klfkas dfklhao asfj sfk klsfjs fkjs";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key";

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
    },
    // TESTNET NETWORKS
    sepolia: {
      networkId: 11155111,
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      // accounts: {
      //   mnemonic: MNEMONIC,
      // },
    },
    augungTestnet: {
      networkId: 9990,
      url: PEAQ_AUGUNG_TESTNET,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    peaq: {
      networkId: 3338,
      url: PEAQ_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};
