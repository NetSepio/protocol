# Netsepio: A Solana-Based Node and NFT Management System

Welcome to **Netsepio**, a Solana-based program designed to make managing validator nodes and soulbound NFTs (non-transferable digital assets) simple and secure! . We'll cover what the program does, how to set it up, how to run tests, and provide detailed explanations of each function in the smart contract, including who can call them, what they do, and why they need to be called in a specific order.

## Table of Contents

1. [What is Netsepio?](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
2. [Prerequisites](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
3. [Setting Up the Project](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 1: Clone the Repository](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 2: Install Dependencies](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 3: Configure Anchor.toml](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 4: Download MPL Core Program](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 5: Build the Program](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 6: Run the Local Validator with MPL Core](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Step 7: Run Tests](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
4. [Smart Contract Overview](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Program Structure](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Key Concepts](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
5. [Smart Contract Functions](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [intialize_global_config](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [create_collection](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [register_node](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [mint_nft](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [deactivate_node](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [update_node_status](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [update_node_metadata](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [create_checkpoint](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [force_deactivate_node](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
6. [Test Cases Overview](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Test Setup](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Individual Test Cases](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
7. [Key Notes for Developers](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Storing Keypairs](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Admin Access](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
    - [Order of Operations](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
8. [Troubleshooting](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)
9. [License](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21)

---

## What is Netsepio?

Netsepio is a **Solana program** (like a smart contract in Ethereum) that allows you to:

- **Manage validator nodes**: Register, update, and deactivate nodes in a network, similar to servers in a decentralized system.
- **Create NFT collections**: Set up a collection to group NFTs (digital assets).
- **Mint soulbound NFTs**: Create non-transferable NFTs tied to specific nodes, proving ownership or participation.
- **Update node metadata**: Change the information (like a URL) associated with an NFT.
- **Track node checkpoints**: Record snapshots of a node’s state, like health checks.

Think of Netsepio as a system for managing a network of computers (nodes) where each node gets a unique, non-transferable digital badge (NFT) to prove it’s part of the network. Only certain trusted users (admins) can create these badges or update their details, while node owners can manage their nodes.

Netsepio uses:

- **Solana**: A fast and low-cost blockchain (like Ethereum but optimized for speed).
- **Anchor**: A framework that makes writing Solana programs easier, like a helpful toolkit for Rust developers.
- **MPL Core**: A Solana program for creating and managing NFTs, which Netsepio relies on for NFT functionality.
- **Rust**: The programming language for the smart contract, known for safety and performance.

---

## Prerequisites

To follow along, you’ll need a computer (Windows, macOS, or Linux) with an internet connection. You don’t need prior Solana or Rust knowledge, as we’ll guide you through everything! Here’s what you need to have installed:

1. **Node.js and npm** (v16 or higher):
    - Node.js is a tool for running JavaScript outside a browser, and npm is its package manager.
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
    - Rust is the language used to write the Netsepio program.
    - Install it using rustup:
        
        ```bash
        curl --proto '=https' --tlsv1.2 -sSf <https://sh.rustup.rs> | sh
        
        ```
        
    - Follow the prompts to install, then verify:
        
        ```bash
        rustc --version
        cargo --version
        
        ```
        
5. **Git**:
    - Git is a version control tool to clone the project repository.
    - Download from [git-scm.com](https://git-scm.com/) or install via your package manager (e.g., `apt install git` on Ubuntu).
    - Verify:
        
        ```bash
        git --version
        
        ```
        
6. **A Code Editor** (optional but recommended):
    - Use Visual Studio Code ([code.visualstudio.com](https://code.visualstudio.com/)) for editing code.
    - Install the Rust Analyzer extension for better Rust support.

**No Installation Setup Needed**: We’ll assume you’re starting fresh and guide you through installing everything in the setup section below. If you already have some of these tools, you can skip those steps.

---

## Setting Up the Project

Let’s set up Netsepio on your computer so you can build, test, and explore the program. Follow these steps carefully, and we’ll explain each one in simple terms.

### Step 1: Clone the Repository

The Netsepio code is stored in a Git repository. Cloning it downloads the code to your computer.

1. Open a terminal (Command Prompt on Windows, Terminal on macOS/Linux).
2. Create a directory for your projects (optional):
    
    ```bash
    mkdir ~/solana-projects
    cd ~/solana-projects
    
    ```
    
3. Clone the repository (replace `<repository-url>` with the actual Git URL if available, or use your local copy):
If you’re working with a local copy, copy the project folder to your computer and navigate to it:
    
    ```bash
    git clone <repository-url>
    cd netsepio
    
    ```
    
    ```bash
    cd path/to/netsepio
    
    ```
    

### Step 2: Install Dependencies

The project uses JavaScript/TypeScript for tests, which requires dependencies listed in `package.json`.

1. In the `netsepio` directory, install dependencies:
Or, if you prefer Yarn:
    
    ```bash
    npm install
    
    ```
    
    ```bash
    yarn install
    
    ```
    
2. This downloads libraries like `@coral-xyz/anchor`, `@solana/web3.js`, and `@metaplex-foundation/mpl-core`.

### Step 3: Configure Anchor.toml

The `Anchor.toml` file tells Anchor how to build and test the program. You need to ensure it’s set up for local testing.

1. Open `Anchor.toml` in the `netsepio` directory with a text editor (e.g., VS Code).
2. Verify or update it to match this configuration:
    
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
3. Save the file.

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
    
    - **Explanation**: This command fetches the MPL Core program (ID: `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`) from Solana’s mainnet and saves it as `mpl-core.so` in `tests/programs`.
3. Verify the file exists:
    
    ```bash
    ls tests/programs/mpl-core.so
    
    ```
    

### Step 5: Build the Program

Building compiles the Rust code into a Solana program (a `.so` file).

1. In the `netsepio` directory, run:
    
    ```bash
    anchor build
    
    ```
    
2. This creates the compiled program in `target/deploy/netsepio.so`.
3. Verify the build:
    
    ```bash
    ls target/deploy/netsepio.so
    
    ```
    

### Step 6: Run the Local Validator with MPL Core

You need a local Solana validator (like a mini blockchain on your computer) to test the program. We’ll load the MPL Core program into it.

1. Open a new terminal (keep it running for the validator).
2. Start the validator with the MPL Core program:
    
    ```bash
    solana-test-validator --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
    
    ```
    
    - **Explanation**: This starts a local Solana blockchain and loads the MPL Core program so Netsepio can interact with it.
    - The validator will keep running, showing logs. Don’t close this terminal.
3. In your original terminal, set the Solana CLI to use the localnet:
    
    ```bash
    solana config set --url <http://localhost:8899>
    
    ```
    
4. Verify the configuration:
    
    ```bash
    solana config get
    
    ```
    
    You should see `RPC URL: http://localhost:8899`.
    

### Step 7: Run Tests

Now you’re ready to test the program to ensure everything works!

1. In the `netsepio` directory, run:
    
    ```bash
    anchor test --skip-local-validator
    
    ```
    
    - **Explanation**: The `-skip-local-validator` flag tells Anchor to use the running `solana-test-validator` instead of starting a new one. This ensures the MPL Core program is loaded.
2. The tests will run, showing output for each test case (e.g., “Register Node”, “Mint NFT as Admin”). If all tests pass, you’ll see a summary like:
    
    ```
    10 passing (Xms)
    
    ```
    
3. If any tests fail, check the [Troubleshooting](https://www.notion.so/Netsepio-A-Solana-Based-Node-and-NFT-Management-System-1e99c5187f7680beb92cde3ff89f2083?pvs=21) section.

---

## Smart Contract Overview

The Netsepio smart contract (`programs/netsepio/src/lib.rs`) is written in Rust using the Anchor framework. It’s like a set of rules running on the Solana blockchain, managing nodes and NFTs. Let’s break it down for beginners.

### Program Structure

The contract defines:

- **Instructions**: Functions users can call (e.g., `register_node`, `mint_nft`).
- **Accounts**: Data structures stored on the blockchain, like `Node` (for node details) and `GlobalConfig` (for collection settings).
- **Events**: Messages emitted when actions occur (e.g., `NodeRegistered`).
- **Errors**: Custom error codes for invalid actions (e.g., `NotAuthorized`).

### Key Concepts

- **Nodes**: Represent servers or validators in the network. Each node has details like ID, name, IP address, and an optional NFT.
- **NFTs**: Soulbound (non-transferable) digital assets tied to nodes, created using MPL Core. They have a name, URI (link to metadata), and an owner.
- **Collection**: A group of NFTs, like a folder for organizing them.
- **Admin**: A special user (with public key `FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS`) who can perform privileged actions like minting NFTs or updating metadata.
- **PDA (Program-Derived Address)**: Special accounts owned by the program, used for storing data (e.g., `Node` and `GlobalConfig` accounts).

---

## Smart Contract Functions

Below, we’ll explain each function in the Netsepio program, including:

- **What it does**: In simple terms.
- **Parameters**: What inputs it needs.
- **Accounts**: Which blockchain accounts are required.
- **Who can call it**: Admin, node owner, or anyone.
- **Why it’s needed**: Its role in the system.
- **Order**: When it should be called relative to other functions.

### intialize_global_config

**What it does**: Sets up the `GlobalConfig` account, which tracks whether a collection has been created and stores its details. Think of it as initializing the program’s settings.

**Parameters**:

- None (just sets default values).

**Accounts**:

- `global_config`: A new PDA (`[b"netsepio", ADMIN_KEY]`) to store collection status. Initialized with:
    - `is_collection_intialization`: Set to `NOTINITIALIZED`.
    - `collection_mint`: Set to `None`.
    - `collection_metadata`: Set to `None`.
- `payer`: The admin’s wallet, signs and pays for creating the account.
- `system_program`: Solana’s System Program, handles account creation.

**Who can call it**:

- Only the admin (`ADMIN_KEY`: `FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS`).
- Enforced by `constraint = payer.key() == ADMIN_KEY.key()`.

**Why it’s needed**:

- Creates the `GlobalConfig` account, which is required before creating a collection.
- Ensures the program knows no collection exists yet.

**Order**:

- **Must be called first** before any other function, as it sets up the `GlobalConfig` account needed for `create_collection`.

**Example**:

- The admin calls `intialize_global_config` to create the `GlobalConfig` account, setting the stage for creating a collection.

### create_collection

**What it does**: Creates an NFT collection using MPL Core, like a folder to organize NFTs. Updates `GlobalConfig` to mark the collection as initialized and store its public key and URI.

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

**Who can call it**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()` and `constraint = global_config.is_collection_intialization == CollectionStatus::NOTINITIALIZED`.

**Why it’s needed**:

- Creates a collection to group NFTs, required before minting NFTs.
- Ensures only one collection is created (checked via `GlobalConfig`).

**Order**:

- **Must be called after** `intialize_global_config` to ensure `GlobalConfig` exists.
- **Must be called before** `mint_nft`, as NFTs need a collection.

**Example**:

- After initializing `GlobalConfig`, the admin calls `create_collection` with name “Netsepio Collection” and URI “[https://example.com/collection.json”](https://example.com/collection.json%E2%80%9D) to create a collection.

### register_node

**What it does**: Registers a new node (like a server) in the network, storing its details in a `Node` account. Think of it as signing up a computer to join the network.

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

**Who can call it**:

- Anyone with a Solana wallet (no admin restriction).
- The `payer` becomes the `user` in the `Node` account, and `owner` is set to the provided `owner` parameter.

**Why it’s needed**:

- Registers a node so it can be part of the network and later receive an NFT.
- Stores node details for tracking and management.

**Order**:

- **Must be called before** `mint_nft`, as minting an NFT requires a registered node (the NFT is tied to the node’s `id`).
- Can be called independently of `intialize_global_config` or `create_collection`.

**Example**:

- A user calls `register_node` with ID “node123” and details like name “Test Node” to create a `Node` account.

### mint_nft

**What it does**: Mints a soulbound NFT (non-transferable digital badge) for a node, tying it to the node’s owner. The NFT is added to the collection and marked as frozen (non-transferable).

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

**Who can call it**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()`.

**Why it’s needed**:

- Creates an NFT to prove a node is part of the network.
- Ties the NFT to the node and its owner, ensuring it’s soulbound (non-transferable).

**Order**:

- **Must be called after**:
    - `intialize_global_config` and `create_collection` (to have a collection).
    - `register_node` (to have a node to tie the NFT to).
- **Must be called before** `deactivate_node` (if deactivating with NFT burning).

**Example**:

- After registering a node “node123” and creating a collection, the admin calls `mint_nft` to create an NFT for the node’s owner.

### deactivate_node

**What it does**: Deactivates a node by burning its NFT (removing it) and closing the `Node` account, returning lamports (Solana’s currency) to the owner.

**Parameters**:

- `node_id`: The ID of the node to deactivate (e.g., “node123”).

**Accounts**:

- `node`: The `Node` PDA, closed after deactivation.
- `payer`: The node’s owner, signs and receives lamports.
- `asset`: The NFT to burn, validated against `node.asset`.
- `collection`: The collection the NFT belongs to.
- `mpl_core_program`: MPL Core program, burns the NFT.
- `system_program`: Solana’s System Program, closes the account.

**Who can call it**:

- Only the node’s owner (stored in `node.owner`).
- Enforced by `constraint = node.owner == payer.key()`.

**Why it’s needed**:

- Allows node owners to remove their node from the network, cleaning up data and reclaiming lamports.
- Burns the NFT to ensure it’s no longer valid.

**Order**:

- **Must be called after** `register_node` and `mint_nft`, as it requires a node with an NFT.
- Can be called independently of other functions like `update_node_status`.

**Example**:

- The node owner calls `deactivate_node` for “node123” to burn its NFT and close the `Node` account.

### update_node_status

**What it does**: Updates a node’s status to `OFFLINE` (0), `ONLINE` (1), or `MAINTENANCE` (2), like changing a server’s operational state.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).
- `new_status`: A number (0, 1, or 2) for the new status.

**Accounts**:

- `node`: The `Node` PDA, updated with the new status.
- `payer`: The admin’s wallet, signs and pays.
- `system_program`: Solana’s System Program, handles account updates.

**Who can call it**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = payer.key() == ADMIN_KEY.key()`.

**Why it’s needed**:

- Allows the admin to manage node states (e.g., mark a node as online when it’s ready).
- Tracks node availability in the network.

**Order**:

- **Must be called after** `register_node` to have a node.
- Can be called independently of NFT-related functions.

**Example**:

- The admin calls `update_node_status` to set “node123” to `ONLINE` (1).

### update_node_metadata

**What it does**: Updates the URI (metadata URL) of a node’s NFT, like changing the link to its description.

**Parameters**:

- `uri`: The new URI (e.g., “[https://example.com/updated-nft.json”](https://example.com/updated-nft.json%E2%80%9D)).

**Accounts**:

- `authority`: The admin’s wallet, authorizes the update.
- `asset`: The NFT to update, validated by MPL Core.
- `collection`: The collection the NFT belongs to.
- `mpl_core_program`: MPL Core program, updates the NFT.
- `system_program`: Solana’s System Program, handles updates.
- `payer`: The admin’s wallet, pays for the transaction.

**Who can call it**:

- Only the admin (`ADMIN_KEY`).
- Enforced by `constraint = authority.key() == ADMIN_KEY.key()`.

**Why it’s needed**:

- Allows the admin to update NFT metadata (e.g., fix a broken link).
- Keeps NFT information current.

**Order**:

- **Must be called after** `register_node` and `mint_nft` to have an NFT.
- Can be called independently of other functions like `deactivate_node`.

**Example**:

- The admin calls `update_node_metadata` to change an NFT’s URI to “[https://example.com/updated-nft.json”](https://example.com/updated-nft.json%E2%80%9D).

### create_checkpoint

**What it does**: Records a snapshot (checkpoint) of a node’s state, like a health check or status update.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).
- `data`: A string (e.g., JSON) with checkpoint details (e.g., `{"status": "healthy"}`).

**Accounts**:

- `node`: The `Node` PDA, updated with the checkpoint data.
- `payer`: The node’s owner or admin, signs and pays.
- `system_program`: Solana’s System Program, handles updates.

**Who can call it**:

- The node’s owner (stored in `node.owner`) or the admin (`ADMIN_KEY`).
- Enforced by `constraint = node.owner == payer.key() || payer.key() == ADMIN_KEY.key()`.

**Why it’s needed**:

- Tracks node state over time for monitoring or auditing.
- Allows owners and admins to update node records.

**Order**:

- **Must be called after** `register_node` to have a node.
- Can be called independently of NFT-related functions.

**Example**:

- The node owner calls `create_checkpoint` to record a health check for “node123”.

### force_deactivate_node

**What it does**: Deactivates a node without requiring an NFT, closing the `Node` account and returning lamports. Used in rare cases when the NFT is missing.

**Parameters**:

- `node_id`: The node’s ID (e.g., “node123”).

**Accounts**:

- `node`: The `Node` PDA, closed after deactivation.
- `payer`: The node’s owner, signs and receives lamports.
- `system_program`: Solana’s System Program, closes the account.

**Who can call it**:

- Only the node’s owner (stored in `node.owner`).
- Enforced by `constraint = node.owner == payer.key()`.

**Why it’s needed**:

- Provides a fallback to deactivate a node if the NFT is lost or not minted.
- Ensures owners can clean up their nodes.

**Order**:

- **Must be called after** `register_node` to have a node.
- Can be called independently of `mint_nft` (unlike `deactivate_node`).

**Example**:

- The node owner calls `force_deactivate_node` to close “node123” without an NFT.

---

## Test Cases Overview

The test file (`tests/netsepio.ts`) verifies that the Netsepio program works as expected. It uses TypeScript, Anchor, and Mocha to run automated tests. Let’s explore the setup and each test case.

### Test Setup

The tests:

- Use a local Solana wallet (`provider.wallet`) as the admin (`ADMIN_KEY`).
- Generate random keypairs for users (e.g., `nftOwner`, `nonAdminUser`) to simulate different roles.
- Load the collection keypair from `CollectionKeypair.json` (created automatically if missing).
- Include helper functions like `createFundedKeypair`, `registerNode`, and `mintNft` to simplify test setup.

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

---

## Key Notes for Developers

### Storing Keypairs

- **Collection Keypair** (`CollectionKeypair.json`):
    - **Private Key**: Needed only for `create_collection` to sign the collection account creation. Stored in `CollectionKeypair.json` for testing.
    - **Public Key**: Needed for `mint_nft`, `update_node_metadata`, and `deactivate_node` to reference the collection. You only need to store the public key after creation (e.g., in `GlobalConfig.collection_mint`).
- **Mint Asset Keypair** (`assetKeypair`):
    - **Private Key**: Needed only for `mint_nft` to sign the NFT creation. Not needed afterward.
    - **Public Key**: Needed for `update_node_metadata` and `deactivate_node` to reference the NFT. Stored in `Node.asset`.
- **Why Only Public Keys After Creation?**: After creating the collection or NFT, their accounts are managed by MPL Core. You only need their public keys to reference them in transactions, reducing security risks (no need to store private keys).

### Admin Access

- The admin wallet (`FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS`) is hardcoded as `ADMIN_KEY`.
- Only the admin can call:
    - `intialize_global_config`
    - `create_collection`
    - `mint_nft`
    - `update_node_status`
    - `update_node_metadata`
- Other functions (`register_node`, `deactivate_node`, `create_checkpoint`, `force_deactivate_node`) have specific ownership or admin checks.

### Order of Operations

To use Netsepio correctly, follow this order:

1. **Admin**: Call `intialize_global_config` to set up `GlobalConfig`.
2. **Admin**: Call `create_collection` to create the NFT collection.
3. **User**: Call `register_node` to register a node.
4. **Admin**: Call `mint_nft` to create an NFT for the node.
5. **Admin/User**: Call other functions as needed:
    - `update_node_status` (admin only).
    - `update_node_metadata` (admin only).
    - `create_checkpoint` (owner or admin).
    - `deactivate_node` or `force_deactivate_node` (owner only).

---

## Troubleshooting

- **Test Fails with “Program Not Found”**:
    - Ensure `solana-test-validator` is running with MPL Core loaded.
    - Verify `tests/programs/mpl-core.so` exists.
- **“NotAuthorized” Error**:
    - Check if you’re using the admin wallet (`ADMIN_KEY`) for admin-only functions.
- **“Account Not Found”**:
    - Ensure `intialize_global_config` and `create_collection` are called before `mint_nft`.
- **Validator Not Starting**:
    - Check for port conflicts (port 8899). Kill other validators:
        
        ```bash
        pkill solana-test-validator
        
        ```
        
- **Rust Compilation Errors**:
    - Update Rust:
        
        ```bash
        rustup update
        
        ```
        

---

## License

Netsepio is open-source under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). Feel free to use, modify, and distribute it, following the license terms.

---
