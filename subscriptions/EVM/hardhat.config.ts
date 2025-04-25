import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

// TESTNET
const BASE_SEPOLIA_RPC =
  process.env.BASE_SEPOLIA_RPC || "wss://base-sepolia-rpc.publicnode.com";
const ARBITRUM_SEPOLIA_RPC =
  process.env.ARBITRUM_SEPOLIA_RPC ||
  "wss://arbitrum-sepolia-rpc.publicnode.com";
const AUGUNG_RPC = "https://wss-async.agung.peaq.network";

// MAINNET
const BASE_MAINNET_RPC = "https://mainnet.base.org";
const ARBITRUM_MAINNET_RPC = "https://arbitrum-mainnet.infura.io/v3/";
const PEAQ_RPC_URL = "https://peaq-rpc.dwellir.com";

// PRIVATE KEYS
const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET;
const PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET;

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
    baseSepolia: {
      networkId: 84532,
      url: BASE_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    arbitrumSepolia: {
      networkId: 421614,
      url: ARBITRUM_SEPOLIA_RPC,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    augungTestnet: {
      networkId: 9990,
      url: AUGUNG_RPC,
      accounts: [PRIVATE_KEY_TESTNET],
    },

    // MAINNET NETWORKS
    baseMainnet: {
      networkId: 8453,
      url: BASE_MAINNET_RPC,
      accounts: [PRIVATE_KEY_MAINNET],
    },
    peaq: {
      networkId: 3338,
      url: PEAQ_RPC_URL,
      accounts: [PRIVATE_KEY_MAINNET],
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      arbitrumSepolia: process.env.ARBITRUMSCAN_API_KEY,
    },
  },
  sourcify: {
    enabled: true,
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
