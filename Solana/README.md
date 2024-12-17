# solana

Deployment on solana network

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

Example deployment transaction: [View on Solana Explorer](https://explorer.solana.com/tx/2qnjk3VaBofFsX2NRaSm1nuRGbYHhV8wxMYiHodkFQPrxThkR3r3w41DDv66TCH8KfnexEeu6sZvN7Tq7dJhf6w8?cluster=devnet)

## Program Instructions

1. Initialize Program:

```tsx
await program.methods.initialize()
  .accounts({
    state: statePDA,
    authority: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

1. Register WiFi Node:

```tsx
await program.methods.registerWifiNode(
    userNodeNum,
    deviceId,
    peaqDid,
    ssid,
    location,
    pricePerMinute
  )
  .accounts({
    state: statePDA,
    wifiNode: wifiNodePDA,
    user: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

1. Register VPN Node:

```tsx
await program.methods.registerVpnNode(
    userNodeNum,
    peaqDid,
    nodename,
    ipaddress,
    ispinfo,
    region,
    location
  )
  .accounts({
    state: statePDA,
    vpnNode: vpnNodePDA,
    user: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

1. Deactivate Nodes:

```tsx
// WiFi Node
await program.methods.deactivateWifiNode(userNodeNum)
  .accounts({
    wifiNode: wifiNodePDA,
    authority: wallet.publicKey,
    user: nodeOwner,
    state: statePDA,
  })
  .rpc();

// VPN Node
await program.methods.deactivateVpnNode(userNodeNum)
  .accounts({
    vpnNode: vpnNodePDA,
    authority: wallet.publicKey,
    user: nodeOwner,
    state: statePDA,
  })
  .rpc();

```

1. Close Nodes:

```tsx
// WiFi Node
await program.methods.closeWifiNode(userNodeNum)
  .accounts({
    wifiNode: wifiNodePDA,
    user: wallet.publicKey,
  })
  .rpc();

// VPN Node
await program.methods.closeVpnNode(userNodeNum)
  .accounts({
    vpnNode: vpnNodePDA,
    user: wallet.publicKey,
  })
  .rpc();

```

## Program Functions

### 1. Initialize (`initialize`)

```tsx
await program.methods.initialize()
  .accounts({
    state: statePDA,
    authority: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

**Purpose**: Creates the program's global state account

**When to use**: Once, during program deployment

**Key features**:

- Sets up initial node counters (WiFi and VPN)
- Establishes program authority
- Required for all subsequent operations

### 2. Register WiFi Node (`register_wifi_node`)

```tsx
await program.methods.registerWifiNode(
    userNodeNum,    // Unique number for this user's nodes
    deviceId,       // Physical device identifier
    peaqDid,        // Peaq network DID
    ssid,           // Network name
    location,       // Physical location
    pricePerMinute  // Usage cost in lamports
  )
  .accounts({
    state: statePDA,
    wifiNode: wifiNodePDA,
    user: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

**Purpose**: Registers a new WiFi access point

**When to use**: When adding a new WiFi node to the network

**Key considerations**:

- `userNodeNum` must be unique per user
- PDA is derived using [b"wifi", user.key(), userNodeNum]
- Price is set in lamports
- Automatically marks node as active

### 3. Register VPN Node (`register_vpn_node`)

```tsx
await program.methods.registerVpnNode(
    userNodeNum,  // Unique number for this user's nodes
    peaqDid,      // Peaq network DID
    nodename,     // VPN node identifier
    ipaddress,    // Node's IP address
    ispinfo,      // Internet Service Provider details
    region,       // Geographical region
    location      // Physical location
  )
  .accounts({
    state: statePDA,
    vpnNode: vpnNodePDA,
    user: wallet.publicKey,
    systemProgram: web3.SystemProgram.programId,
  })
  .rpc();

```

**Purpose**: Registers a new VPN node

**When to use**: When adding a new VPN endpoint

**Key considerations**:

- Similar PDA derivation as WiFi nodes but with "vpn" prefix
- Status starts at 0 (inactive)
- Each user can register multiple VPN nodes

### 4. Update VPN Node (`update_vpn_node`)

```tsx
await program.methods.updateVpnNode(
    userNodeNum,  // Node identifier
    status,       // New status code
    region        // Updated region
  )
  .accounts({
    vpnNode: vpnNodePDA,
    user: wallet.publicKey,
  })
  .rpc();

```

**Purpose**: Updates VPN node status and region

**When to use**: For node maintenance or region changes

**Access control**:

- Only node owner can update
- Requires original userNodeNum for PDA verification

### 5. Deactivate Nodes (`deactivate_wifi_node`, `deactivate_vpn_node`)

```tsx
// WiFi Node deactivation
await program.methods.deactivateWifiNode(userNodeNum)
  .accounts({
    wifiNode: wifiNodePDA,
    authority: wallet.publicKey,
    user: nodeOwner,
    state: statePDA,
  })
  .rpc();

```

**Purpose**: Safely deactivates nodes

**When to use**:

- Before removing nodes from network
- When preparing for account closure
- During maintenance

**Key points**:

- Only program authority can deactivate
- Sets can_close flag for future closure
- Different status indicators for WiFi/VPN

### 6. Close Nodes (`close_wifi_node`, `close_vpn_node`)

```tsx
await program.methods.closeWifiNode(userNodeNum)
  .accounts({
    wifiNode: wifiNodePDA,
    user: wallet.publicKey,
  })
  .rpc();

```

**Purpose**: Permanently removes nodes and recovers lamports

**When to use**: After deactivation, when node is no longer needed

**Requirements**:

- Node must be deactivated
- can_close flag must be true
- Only owner can close
- Returns account rent lamports to owner

## PDA Derivation

### WiFi Node PDA

```rust
[b"wifi", user_pubkey.as_ref(), user_node_num.to_le_bytes().as_ref()]

```

### VPN Node PDA

```rust
[b"vpn", user_pubkey.as_ref(), user_node_num.to_le_bytes().as_ref()]

```

## State Management

### Program State

```rust
pub struct State {
    pub authority: Pubkey,      // Program admin
    pub current_wifi_node: u64, // Global WiFi counter
    pub current_vpn_node: u64,  // Global VPN counter
}

```

### Node States

### WiFi Node

- **Active**: is_active = true
- **Deactivated**: is_active = false
- **Closeable**: can_close = true

### VPN Node

- **Active**: status != 0
- **Deactivated**: status = 0
- **Closeable**: can_close = true

## Common Operations

### Creating Multiple Nodes

```tsx
// First node
const userNodeNum1 = new BN(1);
await program.methods.registerWifiNode(userNodeNum1, ...);

// Second node
const userNodeNum2 = new BN(2);
await program.methods.registerWifiNode(userNodeNum2, ...);

```

### Safe Node Removal

```tsx
// 1. Deactivate (authority only)
await program.methods.deactivateWifiNode(userNodeNum);

// 2. Verify deactivation
const nodeAccount = await program.account.wifiNode.fetch(nodePDA);
assert(!nodeAccount.isActive && nodeAccount.canClose);

// 3. Close and recover lamports
await program.methods.closeWifiNode(userNodeNum);

```

## Security Considerations

1. **Node Registration**:
    - Track userNodeNum carefully
    - Verify PDA derivation
    - Store device credentials securely
2. **Deactivation Process**:
    - Only authority can deactivate
    - Verify node status before operations
    - Check can_close flag
3. **Account Closure**:
    - Always deactivate first
    - Verify owner before closing
    - Ensure lamports recovery

## Program Errors

|       Error         |            Description          |     Resolution          |
|       -----         |            -----------          |     ----------          |
|   NodeNotActive     | Operation on inactive node      | Verify node status      |
|   NodeStillActive   | Attempting to close active node | Deactivate first        |
|   NodeNotCloseable  | Closing without permission      | Check can_close flag    |
|   Unauthorized      | Invalid authority or owner      | Verify caller identity  |

## Example Deployment

View example transaction on [Solana Explorer](https://explorer.solana.com/tx/2qnjk3VaBofFsX2NRaSm1nuRGbYHhV8wxMYiHodkFQPrxThkR3r3w41DDv66TCH8KfnexEeu6sZvN7Tq7dJhf6w8?cluster=devnet)