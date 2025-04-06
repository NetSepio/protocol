import dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-verify";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";

//MONAD TESTNET
const MONAD_TESTNET_RPC = "https://monad-testnet.drpc.org/";
//PEAQ TESTNET
const AUGUNG_RPC = "https://wss-async.agung.peaq.network";
// BASE TESTNET
const BASE_SEPOLIA_RPC =
  process.env.BASE_SEPOLIA_RPC || "wss://base-sepolia-rpc.publicnode.com";

//BASE MAINNET
const BASE_MAINNET_RPC = "https://mainnet.base.org";
//PEAQ MAINNET
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
      url: AUGUNG_RPC,
      accounts: [PRIVATE_KEY_TESTNET],
    },
    baseSepolia: {
      networkId: 84532,
      url: BASE_SEPOLIA_RPC,
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
    enabled: false,
  },
  sourcify: {
    enabled: true,
    blockExplorerUrl: "https://testnet.monadexplorer.com",
    blockExplorerApiUrl: "https://sourcify-api-monad.blockvision.org",
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
