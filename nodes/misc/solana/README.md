# NetSepio Node Management CLI

A command-line tool for managing nodes on the Solana blockchain using the NetSepio program. This tool provides both user and admin functionalities for node registration, management, and NFT operations.

## Prerequisites

- Node.js installed
- Solana CLI tools installed and configured
- A funded Solana wallet (devnet)
- Required npm packages:
  ```bash
  npm install @solana/web3.js @coral-xyz/anchor
  ```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Available Commands

### User Commands (netsepioV1_user.js)

#### Register a Node

Register a new node with the NetSepio program.

```bash
node netsepioV1_user.js registerNode <nodeId> <name> <nodeType> <config> <ipaddress> <region> <location> <metadata> <owner>
```

Parameters:

- `nodeId`: Unique identifier for the node
- `name`: Name of the node
- `nodeType`: Type of node (e.g., validator, edge)
- `config`: JSON string with node specifications
- `ipaddress`: IP address of the node
- `region`: Geographic region
- `location`: Physical location description
- `metadata`: JSON string with additional metadata
- `owner`: Solana wallet public key that will own this node

Example:

```bash
node netsepioV1_user.js registerNode \
  node-123 \
  "Luffy" \
  validator \
  '{"cpu":"16 cores","memory":"64GB","disk":"5TB"}' \
  34.92.123.456 \
  us-east \
  "New York, NY" \
  '{"version":"2.0.1","lastUpdate":"2023-06-15"}' \
  "3nKn5GhMTJ1hHCYjhWAV1etPfypWBqM9dpPrW85VfPWD"
```

#### Get Node Data

Retrieve information about a registered node.

```bash
node netsepioV1_user.js get <nodeId>
```

#### Create Checkpoint

Create a checkpoint for a node.

```bash
node netsepioV1_user.js createCheckpoint <nodeId> <checkpointData>
```

#### Deactivate Node

Deactivate a registered node.

```bash
node netsepioV1_user.js deactivateNode <nodeId>
```

### Admin Commands (netsepioV1_admin.js)

#### Create Collection

Create a new NFT collection.

```bash
node netsepioV1_admin.js createCollection <collectionName> <collectionUri>
```

#### Mint NFT

Mint a new NFT for a node.

```bash
node netsepioV1_admin.js mintNFT <nodeId> <nftName> <nftUri> <owner>
```

#### Update Metadata

Update NFT metadata.

```bash
node netsepioV1_admin.js updateMetadata <assetKeypair> <collectionKey> <newNftUri>
```

#### Update Node Status

Update the status of a node.

```bash
node netsepioV1_admin.js updateNodeStatus <nodeId> <newStatus>
```

## Node Status Values

The node status can be one of the following:

- `0`: OFFLINE
- `1`: ONLINE
- `2`: MAINTENANCE

## Keypair Management

The scripts automatically handle keypair management:

- If `Keypair.json` exists, it will be used
- If not, a new keypair will be generated and saved
- The keypair is used for signing transactions

## Error Handling

All commands return JSON-formatted responses with:

- `action`: The performed action
- `success`: Boolean indicating success/failure
- `message`: Description of the result
- `data`: Additional data (if successful)
- `error`: Error message (if failed)

## Network Configuration

- All operations are performed on the Solana devnet
- Connection URL: `https://api.devnet.solana.com`
- Commitment level: `confirmed`

## Notes

- Ensure your wallet has sufficient SOL for transactions
- For JSON string parameters, use single quotes around the entire JSON object
- Make sure to escape quotes and special characters as needed
- The scripts use the MPL Core Program for NFT operations
- All transactions are signed using the provided keypair

## Security Considerations

- Keep your keypair file secure
- Never share your private keys
- Use environment variables for sensitive data
- Regularly backup your keypair file

## Support

For issues and feature requests, please open an issue in the repository.
