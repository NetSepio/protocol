<<<<<<< HEAD
# ErebrusV1

## Erebrus Registry Program

A Solana program for managing WiFi and VPN nodes built with Anchor framework. This program allows users to register, update, deactivate, and close both WiFi and VPN nodes with proper ownership validation.

## Features

- Multiple node registration per wallet
- Separate WiFi and VPN node management
- Node deactivation by authority
- Lamports recovery through node closing
- PDA-based account management
- Owner-based access control

## Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf <https://sh.rustup.rs> | sh

# Install Solana CLI tools
sh -c "$(curl -sSfL <https://release.solana.com/v1.16.25/install>)"

# Install Anchor CLI
cargo install --git <https://github.com/coral-xyz/anchor> avm --locked --force
avm install latest
avm use latest

# Install dependencies
=======
# Erebrus Node Management Program(Eclipse)

A Eclipse program for managing decentralized network nodes with registration, status management, and checkpoint creation capabilities.

## Deployment Details

- **Program ID**: `E67ritmxgYPVP9SbcXp5KQx2s5zrx3JzKPg6bzqgkcEZ`
- **Deployment Signature**: `48pCpbRL5mGqcubPUs9nZEQn8quwouAb9HY9kwRR4dCgPaYXZKdn8VE4aBVRwQg2S2KfNs4rJeiUvrXXg2QHwKko`
- **Explorer URL**: [View on Eclispe Mainnet Explorer](https://explorer.dev.eclipsenetwork.xyz/address/E67ritmxgYPVP9SbcXp5KQx2s5zrx3JzKPg6bzqgkcEZ)

## Program Overview

The Erebrus Node Management Program is a Solana smart contract that enables decentralized management of network nodes. It provides functionality for node registration, status updates, deactivation, and checkpoint creation.

### Key Features

- Node registration with detailed configuration
- Node status management (Online/Offline/Maintenance)
- Node deactivation with lamport recovery
- Checkpoint creation for node data logging
- Event emission for tracking state changes

## Account Structures

### Node Account

Stores information about registered nodes including:

- ID and Name
- Node Type
- Configuration
- IP Address
- Region and Location
- Metadata
- Owner
- Status (0: Offline, 1: Online, 2: Maintenance)

### Checkpoint Account

Stores checkpoint data for nodes:

- Node ID
- Checkpoint Data

## Instructions

### 1. Register Node

```rust
register_node(
    id: String,
    name: String,
    node_type: String,
    config: String,
    ipaddress: String,
    region: String,
    location: String,
    metadata: String,
    owner: Pubkey,
)

```

### 2. Update Node Status

```rust
update_node_status(
    node_id: String,
    new_status: u8,
)

```

### 3. Deactivate Node

```rust
deactivate_node(
    node_id: String,
)

```

### 4. Create Checkpoint

```rust
create_checkpoint(
    node_id: String,
    data: String,
)

```

## Events

The program emits the following events:

- `NodeRegistered`: When a new node is registered
- `NodeDeactivated`: When a node is deactivated
- `NodeStatusUpdated`: When a node's status changes
- `CheckpointCreated`: When a new checkpoint is created

## Security Considerations

- All state-changing operations require appropriate signer verification
- PDAs are used for secure account management
- Account space is pre-allocated to prevent overflow
- Status updates are restricted to valid states (0, 1, 2)

## Development and Testing

To build and test the program:

1. Install dependencies:

```bash
>>>>>>> main
yarn install

```

<<<<<<< HEAD
## Build and Deploy

1. Start local validator:

```bash
solana-test-validator --reset

```

1. Open a new terminal for logs:

```bash
solana logs

```

=======
>>>>>>> main
1. Build the program:

```bash
anchor build

```

<<<<<<< HEAD
1. Get the program ID:

```bash
solana address -k target/deploy/erebrus_registry-keypair.json

```

1. Update program ID:

- Update `declare_id!()` in `lib.rs`
- Update `Anchor.toml` program ID

1. Deploy to devnet:

```bash
# Configure to devnet
solana config set --url devnet

# Airdrop some SOL if needed
solana airdrop 2 <your-wallet-address> --url devnet

# Deploy
anchor deploy

```
 Deployment : 

Program Id: 6HuaUmMRvSfbgXAqzbCLZCW39rGkzoKUeWhjPc4eyEJ8

Signature: 58WApkmXPrP4CkjcvXHQo6sJ1T9DB19ghWSPitqMkp2z7DZSu8fdPr75g3pV6CdFEs8YgqrzNg7NmE72LrgErxxz
 
[View on Solana Explorer](https://explorer.solana.com/address/6HuaUmMRvSfbgXAqzbCLZCW39rGkzoKUeWhjPc4eyEJ8)
=======
1. Deploy to your desired cluster:

```bash
anchor deploy

```

### Testing

The testing process requires two terminal windows:

## Terminal 1 - Run Local Validator:

```bash

solana-test-validator
```

Keep this running throughout the testing process.

## Terminal 2 - Run Tests:

```bash

anchor test --skip-local-validator
```

The `--skip-local-validator` flag is used because we're already running the validator in Terminal 1.

## License

[Insert License Information]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
>>>>>>> main
