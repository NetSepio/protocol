# Netsepio

Netsepio is a Solana-based program for managing nodes, NFTs, and collections using the Anchor framework and MPL Core.

## Overview

This program provides functionality to:

- Register, update, and deactivate validator nodes
- Create NFT collections
- Mint soulbound NFTs (non-transferable)
- Update node metadata
- Create and update node checkpoints

## Code Structure

### Rust Program (`programs/netsepio/src/lib.rs`)

The main program contains several instructions:

- `create_collection`: Creates an NFT collection
- `register_node`: Registers a node in the network
- `mint_nft`: Mints a soulbound NFT
- `deactivate_node`: Deactivates a node
- `update_node_status`: Updates node status (offline, online, maintenance)
- `update_node_metadata`: Updates NFT metadata
- `create_checkpoint`: Creates a checkpoint for a node

### Tests (`tests/netsepio.ts`)

Tests written in TypeScript that verify:

- Node registration, updating, and deactivation
- Collection creation (both as admin and non-admin)
- NFT minting
- Node metadata updates
- Security checks for admin-only operations

## Setup and Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Make sure you have Solana and Anchor installed:

```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
npm install -g @coral-xyz/anchor
```

## Compilation

Compile the program using Anchor:

```bash
anchor build
```

This will create the compiled program in `target/deploy/netsepio.so`.

## Testing

Run tests using:

```bash
anchor test --skip-local-validator
```

To run tests with a local validator:

```bash
anchor test
```

## Deployment

### Local Deployment

Deploy to localnet using:

```bash
anchor deploy
```

### Devnet/Mainnet Deployment

1. Update your Anchor.toml to use the desired network:

```toml
[provider]
cluster = "devnet" # or "mainnet-beta"
wallet = "/path/to/your/wallet.json"
```

2. Deploy using:

```bash
anchor deploy --provider.cluster devnet # or mainnet-beta
```

## Loading a Program from Mainnet to Local

To test against programs deployed on mainnet:

1. Download the program binary:

```bash
solana program dump -u mainnet-beta <PROGRAM_ID> tests/programs/<program-name>.so
```

2. Add it to your Anchor.toml:

```toml
[[test.genesis]]
address = "<PROGRAM_ID>"
program = "tests/programs/<program-name>.so"
```

For MPL Core specifically:

```bash
solana program dump -u mainnet-beta CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
```

## Configuring Anchor.toml

Your Anchor.toml should include:

1. Program ID for your project
2. External programs like MPL Core
3. Provider settings (cluster and wallet)
4. Test script configuration
5. Genesis programs for testing

Example:

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

## Admin Access

The program uses an admin key for certain privileged operations:

```
FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS
```

Only this wallet can:

- Create collections
- Update node statuses
- Perform NFT Mint

## License

## Setting Up Solana Localnet

To set Solana to use localnet (local development environment):

1. Configure Solana CLI to use localnet:

```bash
solana config set --url localhost
```

2. Start a local validator:

```bash
solana-test-validator
```

- Run this in a separate terminal and keep it running during development

3. Verify you're connected to localnet:

```bash
solana config get
```

- This should show `RPC URL: http://localhost:8899`

4. If using Anchor, make sure your Anchor.toml has:

```toml
[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"
```

5. For rapid development and testing, you can run a local validator with the Anchor test command:

```bash
anchor test
```

- This automatically starts and stops a local validator for the duration of your tests

## Loading BPF Programs Directly into solana-test-validator

To load your program directly into a local validator without using Anchor:

1. Start solana-test-validator with your program:

```bash
solana-test-validator --bpf-program <PROGRAM_ID> <PATH_TO_PROGRAM_SO_FILE>
```

For example, to load the MPL CORE program:

```bash
solana-test-validator --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
```

2. You can load multiple programs at once:

```bash
solana-test-validator \
  --bpf-program 39vVDTvVqdTkXLZujJuA11SS1ohmNH2JLcuXZVqEyFZx target/deploy/netsepio.so \
  --bpf-program CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
```

3. To reset the validator's ledger but keep your programs loaded:

```bash
solana-test-validator \
  --bpf-program 39vVDTvVqdTkXLZujJuA11SS1ohmNH2JLcuXZVqEyFZx target/deploy/netsepio.so \
  --reset
```

This approach is useful for direct testing with the Solana CLI or custom clients without using Anchor's test framework.

### Loading MPL Core

MPL Core is required for Netsepio's NFT functionality. To use it:

1. Download the MPL Core program from mainnet:

```bash
solana program dump -u mainnet-beta CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d tests/programs/mpl-core.so
```

2. Create the programs directory if needed:

```bash
mkdir -p tests/programs
```

3. Add MPL Core to your Anchor.toml:

```toml
[[test.genesis]]
address = "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
program = "tests/programs/mpl-core.so"
```
