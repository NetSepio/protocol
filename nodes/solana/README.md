# Netsepio: A Solana-Based Node and NFT Management System

Welcome to **Netsepio**, a Solana-based program designed to make managing validator nodes and soulbound NFTs (non-transferable digital assets) simple and secure! . We'll cover what the program does, how to set it up, how to run tests, and provide detailed explanations of each function in the smart contract, including who can call them, what they do, and why they need to be called in a specific order.

## What is Netsepio?

Netsepio is a **Solana program** (like a smart contract in Ethereum) that allows you to:

- **Manage nodes**: Register, update, and deactivate nodes in a network, similar to servers in a decentralized system.
- **Create NFT collections**: Set up a collection to group NFTs (digital assets).
- **Mint soulbound NFTs**: Create non-transferable NFTs tied to specific nodes, proving ownership or participation.
- **Update node metadata**: Change the information (like a URL) associated with an NFT.
- **Track node checkpoints**: Record snapshots of a node’s state, like health checks.

Netsepio uses:

- **Solana**: A fast and low-cost blockchain (like Ethereum but optimized for speed).
- **Anchor**: A framework that makes writing Solana programs easier, like a helpful toolkit for Rust developers.
- **MPL Core**: A Solana program for creating and managing NFTs, which Netsepio relies on for NFT functionality.
- **Rust**: The programming language for the smart contract, known for safety and performance.

---

## Prerequisites

1. **Node.js and npm** (v16 or higher):

   - Download from [nodejs.org](https://nodejs.org/). Choose the LTS version.
   - Verify installation:

     ```bash
     node -v
     npm -v

     ```

2. **Solana CLI** (v1.16.0 or higher):
   - The Solana Command Line Interface lets you interact with the Solana blockchain.
   - Install it:
     ```bash
     sh -c "$(curl -sSfL <https://release.solana.com/v1.16.0/install>)"
     ```
   - Verify:
     ```bash
     solana --version
     ```
3. **Anchor CLI** (latest version):
   - Anchor is a framework for writing Solana programs.
   - Install it globally using npm:
     ```bash
     npm install -g @coral-xyz/anchor
     ```
   - Verify:
     ```bash
     anchor --version
     ```
4. **Rust** (latest stable version):
   - Install using rustup:
     ```bash
     curl --proto '=https' --tlsv1.2 -sSf <https://sh.rustup.rs> | sh
     ```
   - Follow the prompts to install, then verify:
     ```bash
     rustc --version
     cargo --version
     ```
5. **Git**:
   - Download from [git-scm.com](https://git-scm.com/) or install via your package manager (e.g., `apt install git` on Ubuntu).
   - Verify:
     ```bash
     git --version
     ```

## Setting Up the Project

### Step 1: Clone the Repository

    mkdir ~/solana-projects
    cd ~/solana-projects

    git clone <repository-url>
    cd netsepio

    cd path/to/netsepio

### Step 2: Install Dependencies

```bash
    npm install
```
or

```bash
    yarn
```
### Step 3: Configure Anchor.toml

The `Anchor.toml` file tells Anchor how to build and test the program. You need to ensure it’s set up for local testing.

- Verify or update it to match this configuration:

   ```toml
   [programs.localnet]
   netsepio = "39vVDTvVqdTkXLZujJuA11SS1ohmNH2JLcuXZVqEyFZx"
   mpl_core_program = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"

   [provider]
   cluster = "Localnet"
   wallet = "~/.config/solana/id.json"

   [scripts]
   test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"

   [[test.genesis]]
   address = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
   program = "tests/programs/mpl-core.so"

   ```

   - **Explanation**:
     - `programs.localnet`: Lists the program IDs for Netsepio and MPL Core.
     - `provider.cluster`: Set to `Localnet` for local testing.
     - `provider.wallet`: Points to your Solana wallet (created automatically by Solana CLI).
     - `test.genesis`: Loads the MPL Core program into the local validator for testing.
     - `scripts.test`: Defines how to run tests using Mocha.

### Step 4: Download MPL Core Program

Netsepio uses **MPL Core** for NFT functionality. You need to download the MPL Core program binary from Solana’s mainnet to use it in your local validator.

1. Create a directory for programs:

   ```bash
   mkdir -p tests/programs
   ```

2. Download the MPL Core binary:

   ```bash
   solana program dump -u mainnet-beta CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
   ```
This command fetches the MPL Core program (ID: `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`) from Solana’s mainnet and saves it as `mpl-core.so` in `tests/programs`.

### Step 5: Build the Program

```bash
    anchor build
```

After building, new keypairs and program IDs are generated in the target directory. To sync these with your Anchor.toml configuration:

```bash
    anchor keys sync
```

This ensures your program ID in Anchor.toml matches the generated keypair, which is essential for successful deployment and testing.

### Step 6: Run the Local Validator with MPL Core

```bash
    solana-test-validator --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
```

This starts a local Solana blockchain and loads the MPL Core program so Netsepio can interact with it.
The validator will keep running, showing logs. Don’t close this terminal.

### Step 7: Run Tests

```bash
    anchor test --skip-local-validator
```

## Smart Contract Overview

### Program Structure

- **Instructions**: Functions users can call (e.g., `register_node`, `mint_nft`).
- **Accounts**: Data structures stored on the blockchain, which are `Node` (for node details) and `GlobalConfig` (for collection settings).
- **Events**: Messages emitted when actions occur (e.g., `NodeRegistered`).
- **Errors**: Custom error codes for invalid actions (e.g., `NotAuthorized`).

## Smart Contract Functions

### intialize_global_config

**Working**: Sets up the `GlobalConfig` account, which tracks whether a collection has been created and stores its details. Think of it as initializing the program’s settings.

**Parameters**:

- None (just sets default values).

**Accounts**:

- `global_config`: A new PDA (`[b"netsepio", ADMIN_KEY]`) to store collection status. Initialized with:
  - `is_collection_intialization`: Set to `NOTINITIALIZED`.
  - `collection_mint`: Set to `None`.
  - `collection_metadata`: Set to `None`.
- `payer`: The admin’s wallet, signs and pays for creating the account.
- `system_program`: Solana’s System Program, handles account creation.

**"Caller Restrictions**:

- Only the admin
- Enforced by `constraint = payer.key() == ADMIN_KEY.key()`.

**Overview**:

- Creates the `GlobalConfig` account, which is required before creating a collection.
- Ensures the program knows no collection exists yet.

### create_collection

**Working**: Creates an NFT collection using MPL Core, like a folder to organize NFTs. Updates `GlobalConfig` to mark the collection as initialized and store its public key and URI.

**Parameters**:

- `name`: The collection’s name (e.g., “Netsepio Collection”).
- `uri`: A URL to the collection’s metadata (e.g., “[https://example.com/collection.json”](https://example.com/collection.json%E2%80%9D)).

**Accounts**:

- `global_config`: The `GlobalConfig` PDA, updated to mark the collection as `INITIALIZED` and store `collection_mint` and `collection_metadata`.
- `authority`: The admin’s wallet, signs and authorizes the collection creation.
- `payer`: The admin’s wallet, pays for the transaction (usually the same as `authority`).
- `collection`: A new keypair for the collection account, signs to create it.
- `mpl_core_program`: MPL Core program, handles NFT collection creation.
- `system_program`: Solana’s System Program, manages account creation.

**"Caller Restrictions**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()` and `constraint = global_config.is_collection_intialization == CollectionStatus::NOTINITIALIZED`.

**Overview**:

- Creates a collection to group NFTs, required before minting NFTs.
- Ensures only one collection is created (checked via `GlobalConfig`).

### register_node

**Working**: Registers a new node (like a server) in the network, storing its details in a `Node` account. Think of it as signing up a computer to join the network.

**Parameters**:

- `id`: A unique string ID for the node (e.g., “node123”).
- `name`: The node’s name (e.g., “Test Node”).
- `node_type`: The type of node (e.g., “validator”).
- `config`: Configuration details as a JSON string (e.g., `{"cpu": "4 cores"}`).
- `ipaddress`: The node’s IP address (e.g., “192.168.1.100”).
- `region`: The node’s region (e.g., “us-west”).
- `location`: The node’s location (e.g., “San Francisco, CA”).
- `metadata`: Additional metadata as a JSON string (e.g., `{"version": "1.0.0"}`).
- `owner`: The public key of the node’s owner (usually the `payer`).

**Accounts**:

- `node`: A new PDA (`[b"netsepio", id]`) to store node details (e.g., `id`, `name`, `status`).
- `payer`: The user registering the node, signs and pays for the account creation.
- `system_program`: Solana’s System Program, creates the `node` account.

**"Caller Restrictions**:

- Anyone with a Solana wallet (no admin restriction).
- The `payer` becomes the `user` in the `Node` account, and `owner` is set to the provided `owner` parameter.

**Overview**:

- Registers a node so it can be part of the network and later receive an NFT.
- Stores node details for tracking and management.

### mint_nft

**Working**: Mints a soulbound NFT (non-transferable digital badge) for a node, tying it to the node’s owner. The NFT is added to the collection and marked as frozen (non-transferable).

**Parameters**:

- `node_id`: The ID of the registered node (e.g., “node123”).
- `name`: The NFT’s name (e.g., “Soulbound NFT”).
- `uri`: A URL to the NFT’s metadata (e.g., “[https://example.com/nft.json”](https://example.com/nft.json%E2%80%9D)).

**Accounts**:

- `authority`: The admin’s wallet, authorizes the minting.
- `payer`: The admin’s wallet, pays for the transaction (usually the same as `authority`).
- `asset`: A new keypair for the NFT, signs to create it.
- `node`: The `Node` PDA for the given `node_id`, updated to store the NFT’s public key.
- `owner`: The node’s owner, receives the NFT.
- `collection`: The collection account, links the NFT to the collection.
- `mpl_core_program`: MPL Core program, creates the NFT.
- `system_program`: Solana’s System Program, manages account creation.

**"Caller Restrictions**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()`.

**Overview**:

- Creates an NFT to prove a node is part of the network.
- Ties the NFT to the node and its owner, ensuring it’s soulbound (non-transferable).

### deactivate_node

**Working**: Deactivates a node by burning its NFT (removing it) and closing the `Node` account, returning lamports (Solana’s currency) to the owner.

**Parameters**:

- `node_id`: The ID of the node to deactivate (e.g., “node123”).

**Accounts**:

- `node`: The `Node` PDA, closed after deactivation.
- `payer`: The node’s owner, signs and receives lamports.
- `asset`: The NFT to burn, validated against `node.asset`.
- `collection`: The collection the NFT belongs to.
- `mpl_core_program`: MPL Core program, burns the NFT.
- `system_program`: Solana’s System Program, closes the account.

**"Caller Restrictions**:

- Only the node’s owner (stored in `node.owner`).
- Enforced by `constraint = node.owner == payer.key()`.

**Overview**:

- Allows node owners to remove their node from the network, cleaning up data and reclaiming lamports.
- Burns the NFT to ensure it’s no longer valid.

### update_node_status

**Working**: Updates a node’s status to `OFFLINE` (0), `ONLINE` (1), or `MAINTENANCE` (2), like changing a server’s operational state.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).
- `new_status`: A number (0, 1, or 2) for the new status.

**Accounts**:

- `node`: The `Node` PDA, updated with the new status.
- `payer`: The admin’s wallet, signs and pays.
- `system_program`: Solana’s System Program, handles account updates.

**"Caller Restrictions**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = payer.key() == ADMIN_KEY.key()`.

**Overview**:

- Allows the admin to manage node states (e.g., mark a node as online when it’s ready).
- Tracks node availability in the network.

### update_node_metadata

**Working**: Updates the URI (metadata URL) of a node’s NFT, like changing the link to its description.

**Parameters**:

- `uri`: The new URI (e.g., “[https://example.com/updated-nft.json”](https://example.com/updated-nft.json%E2%80%9D)).

**Accounts**:

- `authority`: The admin’s wallet, authorizes the update.
- `asset`: The NFT to update, validated by MPL Core.
- `collection`: The collection the NFT belongs to.
- `mpl_core_program`: MPL Core program, updates the NFT.
- `system_program`: Solana’s System Program, handles updates.
- `payer`: The admin’s wallet, pays for the transaction.

**"Caller Restrictions**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()`.

**Overview**:

- Allows the admin to update NFT metadata (e.g., fix a broken link).
- Keeps NFT information current.

### create_checkpoint

**Working**: Records a snapshot (checkpoint) of a node’s state, like a health check or status update.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).
- `data`: A string (e.g., JSON) with checkpoint details (e.g., `{"status": "healthy"}`).

**Accounts**:

- `node`: The `Node` PDA, updated with the checkpoint data.
- `payer`: The node’s owner or admin, signs and pays.
- `system_program`: Solana’s System Program, handles updates.

**"Caller Restrictions**:

- The node’s owner (stored in `node.owner`) or the admin (`ADMIN_KEY`).
- Enforced by `constraint = node.owner == payer.key() || payer.key() == ADMIN_KEY.key()`.

**Overview**:

- Tracks node state over time for monitoring or auditing.
- Allows owners and admins to update node records.

### force_deactivate_node

**Working**: Deactivates a node without requiring an NFT, closing the `Node` account and returning lamports. Used in rare cases when the NFT is missing.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).

**Accounts**:

- `node`: The `Node` PDA, closed after deactivation.
- `payer`: The node’s owner, signs and receives lamports.
- `system_program`: Solana’s System Program, closes the account.

**"Caller Restrictions**:

- Only the node’s owner (stored in `node.owner`).
- Enforced by `constraint = node.owner == payer.key()`.

**Overview**:

- Provides a fallback to deactivate a node if the NFT is lost or not minted.
- Ensures owners can clean up their nodes.

## Test Cases Overview

The test file (`tests/netsepio.ts`) verifies that the Netsepio program works as expected. It uses TypeScript, Anchor, and Mocha to run automated tests.

### Individual Test Cases

1. **Register Node**:
   - Tests registering a node with a random user.
   - Verifies the `Node` account stores the correct details (e.g., `id`, `name`, `status`).
2. **Update Node Status**:
   - Tests:
     - Non-admin updating status (should fail with `NotAuthorized`).
     - Admin updating status to `ONLINE` and `OFFLINE` (should succeed).
   - Verifies the `Node` status updates correctly.
3. **Create Checkpoint**:
   - Tests:
     - Owner creating and updating a checkpoint.
     - Admin updating a checkpoint.
   - Verifies the `Node` checkpoint data updates correctly.
4. **Activate Global Config**:
   - Tests initializing the `GlobalConfig` account.
   - Verifies it’s set to `NOTINITIALIZED`.
5. **Create Collection**:
   - Tests creating a collection as the admin.
   - Verifies the collection exists and `GlobalConfig` is updated.
6. **Mint NFT as Admin**:
   - Tests minting an NFT for a registered node by the admin.
   - Verifies the NFT’s owner, name, and URI.
7. **Mint NFT as Non-Admin Should Fail**:
   - Tests non-admin attempting to mint an NFT (should fail with `NotAuthorized`).
   - Verifies no NFT is created.
8. **Update Node Metadata as Admin**:
   - Tests admin updating an NFT’s URI.
   - Verifies the URI updates correctly.
9. **Update Node Metadata as Non-Admin Should Fail**:
   - Tests non-admin attempting to update an NFT’s URI (should fail).
   - Verifies the URI remains unchanged.
10. **Deactivate Node as Owner**:
    - Tests owner deactivating a node, burning the NFT, and closing the `Node` account.
    - Verifies the node and NFT are removed.
11. **Deactivate Node with Matching and Non-Matching NFT Asset**:
    - Tests:
      - Deactivating with an incorrect NFT (should fail with `InvalidAsset`).
      - Ensures the node and NFT remain intact.
    - Verifies NFT validation.
12. **Deactivate Node as Non-Owner Should Fail**:
    - Tests non-owner attempting to deactivate a node (should fail with `NotNodeOwner`).
    - Verifies the node remains.
13. **Force Deactivate Node as Non-Owner Should Fail**:
    - Tests non-owner attempting to force deactivate a node (should fail with `NotNodeOwner`).
    - Verifies the node remains.

## License

Netsepio is open-source under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). Feel free to use, modify, and distribute it, following the license terms.
