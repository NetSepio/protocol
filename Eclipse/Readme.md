# Eclipse - Netsepio

A Solana program for managing network nodes with administrative controls and checkpointing capabilities.

## Prerequisites

- Node.js
- Rust
- Yarn
- Solana CLI
- Anchor CLI

## Setup

To change the cluster, you can change the cluster in the Anchor.toml file.

1. Build the program:

```bash
yarn build
```

2. Run the tests:

```bash
yarn test
```

## Overview

Eclipse is a Solana program built with Anchor that provides functionality for:

- Node registration and management
- Authority controls (admin/operator roles)
- Node status tracking
- Checkpointing system
- Node deactivation

## Features

### Authority Management

- Admin initialization and operator assignment
- Role-based access control
- Authority updates by admin

### Node Operations

- Register new nodes with detailed metadata
- Update node status (Online/Offline/Maintenance)
- Deactivate nodes
- Create checkpoints for nodes

### Status Types

- `OFFLINE_STATUS (0)`: Node is offline
- `ONLINE_STATUS (1)`: Node is online and operational
- `MAINTENANCE_STATUS (2)`: Node is under maintenance

## License

This project is licensed under the MIT License - see the LICENSE file for details.
