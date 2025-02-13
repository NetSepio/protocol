# NetSepio Protocol

NetSepio Protocol Implementation through multi-chain smart contracts aimed at offering you private, secure and agentic internet.

## Components

### Nodes Management
The protocol supports node management across multiple chains:

- **Solana Implementation**
  - Node registration and management
  - Status tracking (Online/Offline/Maintenance/Deactivated)
  - Checkpoint system for bandwidth verification
  - Deployed on Solana mainnet at [`E67ritmxgYPVP9SbcXp5KQx2s5zrx3JzKPg6bzqgkcEZ`]

- **Peaq Implementation**
  - Node registration and management
  - Role-based access control (Admin/Operator)
  - Available on peaq mainnet and agung testnet
  - Status tracking (Online/Offline/Maintenance/Deactivated)
  - Checkpoint system for bandwidth verification

### Reviews System
Smart contracts enabling decentralized review management for various internet resources like domains, websites, URLs and web3 platforms.

### Subscriptions
Subscription-based access control system implemented through smart contracts to enable user subscriptions.

## Networks Supported

- Solana Mainnet
- Peaq Network
  - Mainnet (Network ID: 3338)
  - Agung Testnet (Network ID: 9990)

## Getting Started

Each component has its own documentation in their respective directories:
- [Nodes Implementation](nodes/README.md)
- [Reviews System](reviews/README.md)
- [Subscriptions](subscriptions/README.md)

## License

This project is licensed under the GNU GPLv3 License.
