import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

//ARBITRUM TESTNET
const ARBITRUM_TESTNET = "https://wss-async.agung.peaq.network";
//ARBITRUM MAINNET
const ARBITRUM_RPC_URL = "https://peaq-rpc.dwellir.com";

const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET;
const PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET;

const ARBITRUM_API_KEY = process.env.ARBITRUM_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.25",
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
    arbitrumTestnet: {
      networkId: 421613,
      url: ARBITRUM_TESTNET,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    // MAINNET NETWORKS
    arbitrum: {
      networkId: 42161,
      url: ARBITRUM_RPC_URL,
      accounts: [PRIVATE_KEY_MAINNET],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ARBITRUM_API_KEY,
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
