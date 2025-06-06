# Smart Contract For EVM Networks

This repository contains the implementation of the NetSepio smart contract, designed to manage nodes in a decentralized network on EVM blockchains.

## Overview

This smart contract enables:

- Node registration and management
- Status tracking for network nodes
- Checkpoint creation and verification
- Role-based access control (Admin and Operator roles)

## Smart Contract Features

- **Node Registration**: Register nodes with detailed information including specs, configuration, location, and metadata
- **Status Management**: Track node status (Offline, Online, Maintenance, Deactivated)
- **Checkpoint System**: Create and verify checkpoints for registered nodes
- **Access Control**: Role-based permissions for administrators and operators

## Project Structure

```markdown
evm/
├── smartcontracts/ # Main smart contracts directory
│ ├── contracts/ # Smart contract source files
│ │ └── NetSepioV1.sol # Main NetSepio contract implementation
│ ├── scripts/ # Deployment and utility scripts
│ │ └── deploy.js # Contract deployment script
│ ├── test/ # Test files directory
│ │ └── netsepiov1.test.ts # Contract test suite
│ └── hardhat.config.ts # Hardhat configuration file
```

## Prerequisites

- Node.js (v12 or higher)
- Yarn or NPM
- A wallet with sufficient EVM gas tokens for deployment

## Setup

1. Clone the repository:

```bash
git clone https://github.com/NetSepio/protocol.git
cd protocol/evm/smartcontracts
```

2. Install dependencies:

```bash
yarn install
```

3. Copy the example environment variables file and set your private keys:

```bash
cp .env.example .env
PRIVATE_KEY_MAINNET=your_mainnet_private_key
PRIVATE_KEY_TESTNET=your_testnet_private_key
```

4. Compile the smart contracts:

```bash
yarn compile
```

5. Run tests:

```bash
yarn test
```

6. Generate coverage reports:

```bash
yarn coverage
```

7. Deploy to evm testnet

```bash
npx hardhat run scripts/deploy.js --network augungTestnet
```

8. Deploy to evm mainnet

```bash
npx hardhat run scripts/deploy.js --network peaq
```

## Networks

- **Peaq Mainnet**
  - RPC URL: https://peaq-rpc.dwellir.com
  - Network ID: 3338

- **Peaq Agung (Testnet)**
  - RPC URL: https://rpcpc1-qa.agung.peaq.network
  - Network ID: 9990

- **Arbitrum Mainnet**
  - RPC URL: 
  - Network ID: 42161

- **Arbitrum Goerli (Testnet)**
  - RPC URL: 
  - Network ID: 421613

- **Monad (Testnet)**
  - RPC URL: 
  - Network ID: 10143

- **Rise Sepolia (Testnet)**
  - RPC URL: 
  - Network ID: 11155931


## Testing

The test suite covers:

- Contract deployment
- Role management
- Node registration
- Status updates
- Checkpoint creation
- Access control validation

Run the full test suite:

## License

This project is licensed under the GNU GPLv3 License.
