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
## Function Documentation

### Administrative Functions

### `init`

Initializes the registry and creates the admin capability.

```
fun init(ctx: &mut TxContext)

```

- Creates initial registry state
- Transfers admin capability to the contract deployer
- Sets up empty tables for WiFi and VPN nodes

### WiFi Node Management

### `register_wifi_node`

Registers a new WiFi node in the network.

```
public entry fun register_wifi_node(
    registry: &mut RegistryState,
    device_id: String,
    ssid: String,
    location: String,
    price_per_minute: u64,
    ctx: &mut TxContext
)

```

**Example:**

```
register_wifi_node(
    registry,
    "device123",
    "Erebrus-WiFi",
    "New York, USA",
    5, // 5 tokens per minute
    ctx
);

```

**Analogy:** Think of this like registering a new hotel in a hotel chain's system, where you provide essential details like location, room rates, and property information.

### `wifi_device_checkpoint`

Records a checkpoint for WiFi device activity.

```
public entry fun wifi_device_checkpoint(
    registry: &mut RegistryState,
    node_id: u64,
    data_hash: String,
    ctx: &TxContext
)

```

**Example:**

```
wifi_device_checkpoint(
    registry,
    1, // node_id
    "0x123...abc", // hash of activity data
    ctx
);

```

**Analogy:** Similar to a security guard logging their rounds at different checkpoints throughout their shift.

### `deactivate_wifi_node`

Allows admin to deactivate a WiFi node.

```
public entry fun deactivate_wifi_node(
    _: &AdminCap,
    registry: &mut RegistryState,
    node_id: u64
)

```

**Example:**

```
deactivate_wifi_node(admin_cap, registry, 1);

```

**Analogy:** Like temporarily closing a store location in a retail chain.

### VPN Node Management

### `register_vpn_node`

Registers a new VPN node in the network.

```
public entry fun register_vpn_node(
    registry: &mut RegistryState,
    node_name: String,
    ip_address: String,
    isp_info: String,
    region: String,
    location: String,
    ctx: &mut TxContext
)

```

**Example:**

```
register_vpn_node(
    registry,
    "vpn-node-1",
    "192.168.1.1",
    "Comcast",
    "NA-East",
    "Boston, USA",
    ctx
);

```

**Analogy:** Similar to registering a new server in a data center, providing all necessary connection and location details.

### `vpn_device_checkpoint`

Records a checkpoint for VPN node activity.

```
public entry fun vpn_device_checkpoint(
    registry: &mut RegistryState,
    node_id: u64,
    data_hash: String,
    ctx: &TxContext
)

```

**Example:**

```
vpn_device_checkpoint(
    registry,
    1,
    "0x456...def",
    ctx
);

```

**Analogy:** Like a server health check that logs its status at regular intervals.

### `update_vpn_node`

Updates VPN node status and region information.

```
public entry fun update_vpn_node(
    registry: &mut RegistryState,
    node: &mut VpnNode,
    node_id: u64,
    status: u8,
    region: String,
    ctx: &TxContext
)

```

**Example:**

```
update_vpn_node(
    registry,
    vpn_node,
    1,
    2, // new status
    "EU-West",
    ctx
);

```

**Analogy:** Similar to updating a delivery driver's status and location in a ride-sharing app.

### Utility Functions

### `wifi_node_exists`

Checks if a WiFi node exists in the registry.

```
public fun wifi_node_exists(registry: &RegistryState, node_id: u64): bool

```

### `vpn_node_exists`

Checks if a VPN node exists in the registry.

```
public fun vpn_node_exists(registry: &RegistryState, node_id: u64): bool

```

### `get_wifi_details`

Retrieves pricing and owner information for a WiFi node.

```
public fun get_wifi_details(registry: &RegistryState, node_id: u64): (u64, address)

```

## Error Codes

- `ENotAuthorized (1)`: User doesn't have permission for the operation
- `ENodeNotActive (2)`: Node is not in active state
- `EInvalidInput (3)`: Invalid input parameters provided

## Events

The contract emits the following events:

- `VpnNodeRegisteredEvent`: When a new VPN node is registered
- `WifiNodeRegisteredEvent`: When a new WiFi node is registered
- `VpnNodeUpdatedEvent`: When a VPN node's status or region is updated



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

# Erebrus V1

# Erebrus V1 Smart Contract Documentation

## Overview

Erebrus V1 is a decentralized WiFi and VPN marketplace built on the Sui blockchain. The smart contract manages NFT minting, WiFi connection requests, payments, and user fund management. It leverages Sui's unique object-centric model and Move's strong safety guarantees.

## Core Features

1. NFT Minting System
2. WiFi Connection Management
3. Payment Processing
4. User Fund Management
5. Admin Controls

## Sui Integration Highlights

The contract leverages several key Sui features:

### Object Management

- Uses Sui's `UID` for unique object identification
- Implements `key` and `store` abilities for proper object handling
- Utilizes Sui's object-centric model for NFTs and state management

### Native Token Integration

- Integrates with Sui's native token (SUI) for payments
- Uses `Coin<SUI>` for handling transactions
- Leverages `Balance` type for secure fund management

### Event System

- Utilizes Sui's event system for tracking important state changes
- Emits structured events for external monitoring

## Function Documentation

### NFT Management

### `mint`

Mints a new Erebrus NFT.

```
public entry fun mint(
    state: &mut State,
    payment: Coin<SUI>,
    name: String,
    description: String,
    uri: String,
    ctx: &mut TxContext
)

```

**Example:**

```
mint(
    state,
    payment_coin,
    "Erebrus Premium",
    "Access to premium network",
    "<https://erebrus.io/nft/1>",
    ctx
);

```

**Sui Features Used:**

- Object creation with `object::new`
- Coin handling with `Coin<SUI>`
- Event emission with `event::emit`

### WiFi Connection Management

### `request_wifi_connection`

Creates a new WiFi connection request.

```
public entry fun request_wifi_connection(
    state: &mut State,
    node_id: u64,
    ctx: &mut TxContext
)

```

**Example:**

```
request_wifi_connection(
    state,
    1, // node_id
    ctx
);

```

### `manage_wifi_request`

Admin function to approve or deny WiFi connection requests.

```
public entry fun manage_wifi_request(
    _: &AdminCap,
    state: &mut State,
    intent_requester: address,
    status: bool
)

```

**Example:**

```
manage_wifi_request(
    admin_cap,
    state,
    user_address,
    true // approve request
);

```

### Payment Processing

### `settle_wifi_payment`

Processes payment for WiFi usage.

```
public entry fun settle_wifi_payment(
    state: &mut State,
    registry: &RegistryState,
    payment: Coin<SUI>,
    duration: u64,
    ctx: &mut TxContext
)

```

**Example:**

```
settle_wifi_payment(
    state,
    registry,
    payment_coin,
    60, // 60 minutes
    ctx
);

```

**Sui Features Used:**

- Cross-module calls with registry
- Sui coin transfers
- Event emission for payment tracking

### Fund Management

### `add_funds`

Adds funds to user's balance.

```
public entry fun add_funds(
    state: &mut State,
    payment: Coin<SUI>,
    ctx: &mut TxContext
)

```

**Example:**

```
add_funds(
    state,
    coin_payment,
    ctx
);

```

**Sui Features Used:**

- Balance management with `Balance<SUI>`
- Table storage for user funds
- Event emission for fund tracking

### Administrative Functions

### `pause_mint` and `unpause_mint`

Controls NFT minting availability.

```
public entry fun pause_mint(_: &AdminCap, state: &mut State)
public entry fun unpause_mint(_: &AdminCap, state: &mut State)

```

## State Management

The contract maintains state through two main structures:

### `State`

```
struct State has key {
    id: UID,
    public_sale_price: u64,
    subscription_per_month: u64,
    mint_paused: bool,
    user_funds: Table<address, Balance<SUI>>,
    wifi_requests: Table<address, WifiRequest>
}

```

### `ErebrusNFT`

```
struct ErebrusNFT has key, store {
    id: UID,
    name: String,
    description: String,
    url: Url,
    refund: bool
}

```

## Events

The contract emits the following events:

1. `NFTMintedEvent`: When a new NFT is minted
2. `WifiRequestCreated`: When a user requests WiFi connection
3. `WifiRequestManaged`: When an admin manages a request
4. `WifiPaymentSettled`: When a payment is processed
5. `FundsAdded`: When a user adds funds

## Error Codes

- `ENFTMintingPaused (1)`: NFT minting is currently paused
- `EInsufficientAmount (2)`: Insufficient payment amount
- `EConnectionNotAccepted (5)`: WiFi connection request not accepted
1. **Access Control**
    - Admin capabilities for sensitive operations
    - User ownership verification for payments
    - Request acceptance validation
2. **Fund Safety**
    - Balance type for secure fund management
    - Payment amount verification
    - Safe coin transfers
3. **State Management**
    - State mutations through controlled functions
    - Request state tracking
    - Proper object cleanup

##

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request


## Deployed Contract Address :
https://suiscan.xyz/devnet/object/0xa484db909a841bf58482c04eb61d3a90547ef819ecf2c6f66661529677d48a55/contracts

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
