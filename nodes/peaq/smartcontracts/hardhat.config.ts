import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

//PEAQ TESTNET
const PEAQ_AUGUNG_TESTNET = "https://wss-async.agung.peaq.network";
//PEAQ MAINNET
const PEAQ_RPC_URL = "https://peaq-rpc.dwellir.com";

const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET;
const PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET;

module.exports = {
  solidity: {
    version: "0.8.24",
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
    augungTestnet: {
      networkId: 9990,
      url: PEAQ_AUGUNG_TESTNET,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    peaq: {
      networkId: 3338,
      url: PEAQ_RPC_URL,
      accounts: [PRIVATE_KEY_MAINNET],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
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
