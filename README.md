# protocol
Protocol Implementation in Soon Network  aimed at democratizing cybersecurity and bridging the digital divide

# Erebrus Node Registry - Smart Contract Setup Guide

## **Prerequisites**

- Rust (latest stable)
- Solana CLI
- Node.js and npm/yarn
- Anchor CLI (`npm i -g @coral-xyz/anchor-cli`)



## **Installation**

```bash
bash
Copy
git clone <repo>
cd erebrus-node-registry
yarn install
anchor build

```

## **Deploy on Devnet**

```bash
bash
Copy
solana config set --url https://rpc.devnet.soo.network/rpc
solana airdrop 2
anchor deploy

```

## **Key Features**

- WiFi node registration and management
- VPN node registration and management
- Node deactivation and removal
- Owner and operator authorization checks

## **Testing**

```bash
bash
Copy
# Run all tests
anchor test

# Run specific test
anchor test test-name

```

Test cases should validate:

- Node registration
- Authorization checks
- Node updates and status changes
- Deactivation and closing logic

## **Program IDs**

- Program ID: `7XDE596AKuHKBkp333WqhSYu9u4rLrAkYThWtQJCw5La`
- Devnet deployment: [Explorer Link]

## **Common Commands**

```bash
bash
Copy
# Build program
anchor build

# Start local validator
solana-test-validator

# Deploy program
anchor deploy

# Run client
yarn start

```

## **Account Structure**

- State - Global program state
- WifiNode - WiFi node registration
- VpnNode - VPN node registration

## **Security**

- Owner verification on updates
- Authority checks for admin operations
- Node status validation before closing

## **Error Handling**

Program defines custom errors:

- NodeNotActive
- NodeStillActive
- NodeNotCloseable
- Unauthorized

## **Events**

- WifiNodeRegistered
- VpnNodeRegistered
- VPNUpdated
- NodeDeactivated
- NodeClosed

For detailed API documentation and integration guide, see [docs/](https://claude.ai/chat/docs/).

## Core Components

### Program State

```rust
#[account]
pub struct State {
    pub authority: Pubkey,
}

```

Maintains global authority for admin operations.

### Node Accounts

```rust
#[account]
pub struct WifiNode {
    pub node_id: u64,
    pub user: Pubkey,
    pub device_id: String,
    pub peaq_did: String,
    pub ssid: String,
    pub location: String,
    pub price_per_minute: u64,
    pub is_active: bool,
    pub can_close: bool,
}

#[account]
pub struct VpnNode {
    pub node_id: u64,
    pub user: Pubkey,
    pub peaq_did: String,
    pub nodename: String,
    pub ipaddress: String,
    pub ispinfo: String,
    pub region: String,
    pub location: String,
    pub status: u8,
    pub can_close: bool,
}

```

## Key Functions

### Initialization

```rust
pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.authority = ctx.accounts.authority.key();
    Ok(())
}

```

Initializes program state with authority.

### Node Registration

```rust
pub fn register_wifi_node(
    ctx: Context<RegisterWifiNode>,
    user_node_num: u64,
    device_id: String,
    ssid: String,
    location: String,
    price_per_minute: u64,
) -> Result<()>

pub fn register_vpn_node(
    ctx: Context<RegisterVpnNode>,
    user_node_num: u64,
    peaq_did: String,
    nodename: String,
    ipaddress: String,
    ispinfo: String,
    region: String,
    location: String,
) -> Result<()>

```

Creates new WiFi/VPN node accounts with provided details.

### Node Management

```rust
pub fn update_vpn_node(
    ctx: Context<UpdateVpnNode>,
    status: u8,
    region: String,
) -> Result<()>

pub fn deactivate_wifi_node(
    ctx: Context<DeactivateWifiNode>,
) -> Result<()>

pub fn close_wifi_node(
    ctx: Context<CloseWifiNode>,
) -> Result<()>

```

## PDAs and Seeds

- WiFi nodes: `[b"wifi", user.key(), user_node_num]`
- VPN nodes: `[b"vpn", user.key(), user_node_num]`

## Security Features

### Authorization Checks

```rust
require!(
    ctx.accounts.authority.key() == ctx.accounts.state.authority,
    CustomError::Unauthorized
);

```

### Status Validation

```rust
require!(!wifi_node.is_active, CustomError::NodeStillActive);
require!(wifi_node.can_close, CustomError::NodeNotCloseable);

```

## Event Structure

```rust
#[event]
pub struct WifiNodeRegistered {
    pub user_node_num: u64,
    pub owner: Pubkey,
    pub device_id: String,
    pub ssid: String,
    pub location: String,
    pub price_per_minute: u64,
}

```

## Error Handling

```rust
#[error_code]
pub enum CustomError {
    NodeNotActive,
    NodeStillActive,
    NodeNotCloseable,
    Unauthorized,
}

```

## Account Constraints

```rust
#[account(
    init,
    payer = user,
    space = ANCHOR_DISCRIMINATOR_SIZE + WifiNode::INIT_SPACE,
    seeds = [b"wifi", user.key().as_ref(), user_node_num.to_le_bytes().as_ref()],
    bump
)]

```

The code follows Anchor's best practices for account validation, PDA derivation, and error handling while maintaining clear separation between WiFi and VPN node management.

# Deployment Link

[https://explorer.devnet.soo.network/address/3ypCkXQWiAFkNk7bo8bnZFxUVmVEWCqpBoY7v4vgPnHJ](https://explorer.devnet.soo.network/address/3ypCkXQWiAFkNk7bo8bnZFxUVmVEWCqpBoY7v4vgPnHJ)
