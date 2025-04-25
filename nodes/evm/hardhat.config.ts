import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

//TESTNET NETWORKS
const PEAQ_AUGUNG_TESTNET = "https://wss-async.agung.peaq.network";
const MONAD_TESTNET_RPC = "https://monad-testnet.drpc.org/";
const RISE_TESTNET_URL = "https://testnet.riselabs.xyz";
const BASE_SEPOLIA_RPC =
  process.env.BASE_SEPOLIA_RPC || "wss://base-sepolia-rpc.publicnode.com";
const ARBITRUM_SEPOLIA_RPC =
  process.env.ARBITRUM_SEPOLIA_RPC ||
  "wss://arbitrum-sepolia-rpc.publicnode.com";

// MAINNET
const PEAQ_RPC_URL = "https://peaq-rpc.dwellir.com";

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
    monadTestnet: {
      networkId: 10143,
      url: MONAD_TESTNET_RPC,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    augungTestnet: {
      networkId: 9990,
      url: PEAQ_AUGUNG_TESTNET,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    riseSepolia: {
      networkId: 11155931,
      url: RISE_TESTNET_URL,
      accounts: [PRIVATE_KEY_TESTNET],
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
    // MAINNET NETWORKS
    peaq: {
      networkId: 3338,
      url: PEAQ_RPC_URL,
      accounts: [PRIVATE_KEY_MAINNET],
    },
  },
  etherscan: {
    apiKey: {
      "rise-sepolia": "empty",
      baseSepolia: process.env.BASESCAN_API_KEY,
      arbitrumSepolia: process.env.ARBITRUMSCAN_API_KEY,
    },
    customChains: [
      {
        network: "rise-sepolia",
        chainId: 11155931,
        urls: {
          apiURL: "https://explorer.testnet.riselabs.xyz/api",
          browserURL: "https://explorer.testnet.riselabs.xyz",
        },
      },
    ],
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
