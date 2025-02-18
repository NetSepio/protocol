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
const MONAD_TESTNET = "https://monad-testnet.drpc.org/";

const PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET;

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
    monadTestnet: {
      networkId: 10143,
      url: MONAD_TESTNET,
      accounts: [PRIVATE_KEY_TESTNET],
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
