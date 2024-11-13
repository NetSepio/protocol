# Erebrus Registry - Decentralized WiFi & VPN Node Management

A Sui Move smart contract system for managing decentralized WiFi and VPN nodes with secure ownership, checkpointing, and access control.

## Overview

Erebrus Registry enables:
- WiFi node registration and management
- VPN node registration and management
- Secure checkpointing of node activity
- Access control via admin capabilities
- Node activation/deactivation
- Pricing management for nodes

## Quick Start

### Prerequisites
- Install Sui CLI
- Setup Sui wallet

### Project Setup
```bash
# Create new project
sui move new erebrus

# Build project
sui move build

# Run tests
sui move test

# Deploy to network
sui client publish

```

## Core Components

### AdminCap

Admin capability token that grants special permissions:

```
move
Copy
public struct AdminCap has key { id: UID }

```

- Only admin can deactivate nodes
- Controls core registry functions
- Transferred to deployer on initialization

### WiFi Node

Represents a physical WiFi node:

```
move
Copy
public struct WifiNode has key, store {
    id: UID,           // Unique identifier
    device_id: String, // Physical device ID
    ssid: String,      // Network name
    location: String,  // Physical location
    is_active: bool    // Active status
}

```

### VPN Node

Represents a VPN server node:

```
move
Copy
public struct VpnNode has key, store {
    id: UID,           // Unique identifier
    user: address,     // Node operator
    node_name: String, // Server name
    ip_address: String,// IP address
    isp_info: String,  // ISP details
    region: String,    // Geographic region
    location: String,  // Physical location
    status: u8         // Node status
}

```

### Registry State

Central registry tracking all nodes:

```
move
Copy
public struct RegistryState has key {
    id: UID,
    current_wifi_node: u64,      // WiFi node counter
    current_vpn_node: u64,       // VPN node counter
    wifi_nodes: Table<u64, WifiNodeInfo>,  // WiFi node registry
    vpn_nodes: Table<u64, VpnNodeInfo>     // VPN node registry
}

```

### Node Info

Additional metadata for nodes:

```
move
Copy
public struct WifiNodeInfo has store {
    owner: address,              // Node owner
    is_active: bool,            // Active status
    total_checkpoints: u64,     // Checkpoint counter
    node_checkpoints: Table<u64, String>,  // Checkpoint history
    price_per_minute: u64,      // Usage pricing
}

```

## Key Features

### Node Registration

- Register new WiFi/VPN nodes
- Assign ownership and metadata
- Generate unique IDs
- Set initial pricing

### Checkpointing

- Record node activity
- Track uptime
- Store usage metrics
- Maintain audit trail

### Access Control

- Admin-only deactivation
- Owner-only updates
- Authorization checks
- Capability-based security

### Node Management

- Update node details
- Change pricing
- Deactivate/destroy nodes
- Track status changes

## Events

The system emits events for:

- Node registration
- Status updates
- Deactivation
- Checkpoints

This enables frontend integration and activity monitoring.

## For Developers

### Testing

Run the test suite:

```bash
bash
Copy
sui move test

```

### Deployment

Deploy to testnet:

```bash
bash
Copy
sui client publish

```

### Integration

Frontend applications can:

1. Monitor events
2. Track node status
3. Manage registrations
4. View checkpoints

## For Node Operators

1. Register your node with device details
2. Set pricing and location info
3. Submit regular checkpoints
4. Monitor status and activity
5. Update node details as needed

## Security

- Admin capability pattern for privileged actions
- Owner-only updates
- Input validation
- Access control checks
- Secure object management

## Non-Technical Summary

Erebrus Registry allows WiFi and VPN node operators to:

- Register their nodes on the blockchain
- Track node activity securely
- Manage pricing and availability
- Maintain an audit trail
- Control access and updates

The system provides transparency and security through blockchain technology while keeping node management simple and efficient.

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License

```
Copy

This README:
- Explains core concepts
- Details key structures and fields
- Provides usage instructions
- Includes both technical and non-technical sections
- Lists security features
- Gives deployment steps

Let me know if you would like me to expand any section!

```