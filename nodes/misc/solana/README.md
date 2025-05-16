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
   or
   yarn
   ```

## Available Commands

### User Commands (netsepio_user.js)

#### Register a Node

Register a new node with the NetSepio program.

```bash
node netsepio_user.js registerNode <nodeId> <name> <nodeType> <config> <ipaddress> <region> <location> <metadata> <owner>
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
node netsepio_user.js registerNode \
  "node-$(($RANDOM % 10000))" \
  "Zoro" \
  validator \
  '{"cpu":"16 cores","memory":"64GB","disk":"5TB"}' \
  34.92.123.456 \
  us-east \
  "New York, NY" \
  '{"version":"2.0.1","lastUpdate":"2023-06-15"}' \
  "EdPJtnunTwxQLo3FCNWN464VLJMb4B6LhBN2HrbAYKpD"
```

#### Get Node Data

Retrieve information about a registered node.

```bash
node netsepio_user.js getNodeData <nodeId>

```

Example :

```bash
node netsepio_user.js getNodeData node-1234


```

#### Create Checkpoint

Create a checkpoint for a node.

```bash
node netsepio_user.js createCheckpoint <nodeId> <checkpointData>
```

Example:

```bash
node netsepio_user.js createCheckpoint node-1234 '{"timestamp":"2023-05-15T12:00:00Z","status":"healthy","metrics":{"uptime":"99.9%","cpu":"45%","memory":"60%"}}'
```

#### Deactivate Node

Deactivate a registered node.

```bash
node netsepio_user.js deactivateNode <nodeId>
```

Example:

```bash
node netsepio_user.js deactivateNode node-1234 CollectionPublicKeyHere
```

#### Force Deactivate Node

```bash
node netsepio_user.js forceDeactivate <nodeId>

```

Example:

```bash
node netsepio_user.js forceDeactivate node-1234
```

### Admin Commands (netsepio_admin.js)

#### INTIALIZE GLOBAL CONFIG

ADMIN WILL INTIALIZE THE GLOBAL CONFIG

```bash
node netsepio_admin.js intializeGlobalConfig

```

#### Create Collection

Create a new NFT collection.

```bash
node netsepio_admin.js createCollection <collectionName> <collectionUri>
```

Example:

```bash
node netsepio_admin.js createCollection NetSepio www.exampleuri.com

```

#### Mint NFT

Mint a new NFT for a node.

```bash
node netsepio_admin.js mintNFT <nodeId> <nftName> <nftUri> <owner>
```

Example:

```bash
node netsepio_admin.js mintNFT node-6909 CyberPunk1 "www.exampleuri.com" EdPJtnunTwxQLo3FCNWN464VLJMb4B6LhBN2HrbAYKpD
```

#### Update Metadata

Update NFT metadata.

```bash
node netsepio_admin.js updateMetadata  <newNftUri>
```

#### Update Node Status

Update the status of a node.

```bash
node netsepio_admin.js updateNodeStatus <nodeId> <newStatus>
```

## Node Status Values

The node status can be one of the following:

- `0`: OFFLINE
- `1`: ONLINE
- `2`: MAINTENANCE

## Keypair Management

The scripts use keypair configuration from the .env file:

- Add your Keypair to .env as `PRIVATE_KEY=your_base58_private_key`
- The private key is used to create a keypair for signing transactions
- If no private key is provided, the script will exit with an error

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
