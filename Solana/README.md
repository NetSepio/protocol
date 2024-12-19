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
yarn install

```

## Build and Deploy

1. Start local validator:

```bash
solana-test-validator --reset

```

1. Open a new terminal for logs:

```bash
solana logs

```

1. Build the program:

```bash
anchor build

```

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
