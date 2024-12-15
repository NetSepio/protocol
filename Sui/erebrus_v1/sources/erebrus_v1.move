module erebrus_v1::erebrus_v1 {
    use std::string::{Self, String};
    use sui::event;

    // Error constants
    const EInvalidStatus: u64 = 3;

    // Status constants 
    #[allow(unused_const)]
    const STATUS_OFFLINE: u8 = 0;
    const STATUS_ONLINE: u8 = 1;
    #[allow(unused_const)]
    const STATUS_MAINTENANCE: u8 = 2;
    const STATUS_DEACTIVATED: u8 = 3;

    /// AdminCap - capability object for admin access
    public struct AdminCap has key {
        id: UID
    }

    /// Node - represents a node in the network
    public struct Node has key, store {
        id: UID,
        node_id: String,
        user: address,
        name: String, 
        node_type: String,
        config: String,
        ip_address: String,
        region: String,
        location: String,
        metadata: String,
        owner: String,
        status: u8
    }

    /// Checkpoint - stores checkpoint data for a node
    public struct Checkpoint has key, store {
        id: UID,
        node_id: String,
        data: String
    }

    // Events
    public struct NodeRegistered has copy, drop {
        node_id: String,
        name: String,
        node_type: String,
        ip_address: String,
        region: String,
        location: String,
        owner: String
    }

    public struct NodeDeactivated has copy, drop {
        node_id: String,
        operator: address
    }

    public struct NodeStatusUpdated has copy, drop {
        node_id: String,
        new_status: u8,
        operator: address
    }

    public struct CheckpointCreated has copy, drop {
        node_id: String,
        data: String
    }

    // Initialize the contract and create AdminCap
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            AdminCap { id: object::new(ctx) },
            tx_context::sender(ctx)
        )
    }

    /// Register a new node
    #[allow(lint(self_transfer))]
    public fun register_node(
        _admin_cap: &AdminCap,
        node_id: String,
        name: String,
        node_type: String,
        config: String,
        ip_address: String,
        region: String,
        location: String,
        metadata: String,
        owner: String,
        ctx: &mut TxContext
    ) {
        // Create new Node object
        let node = Node {
            id: object::new(ctx),
            node_id: node_id,
            user: tx_context::sender(ctx),
            name,
            node_type,
            config,
            ip_address,
            region,
            location,
            metadata,
            owner,
            status: STATUS_ONLINE
        };

        // Create initial checkpoint
        let checkpoint = Checkpoint {
            id: object::new(ctx),
            node_id: node_id,
            data: string::utf8(b"Initial checkpoint")
        };

        // Transfer objects to company address
        transfer::transfer(node, tx_context::sender(ctx));
        transfer::transfer(checkpoint, tx_context::sender(ctx));

        // Emit event
        event::emit(NodeRegistered {
            node_id,
            name,
            node_type,
            ip_address,
            region,  
            location,
            owner
        });
    }

    /// Deactivate a node
    public fun deactivate_node(
        _admin_cap: &AdminCap,
        node: &mut Node,
        ctx: &mut TxContext
    ) {
        node.status = STATUS_DEACTIVATED;

        event::emit(NodeDeactivated {
            node_id: node.node_id,
            operator: tx_context::sender(ctx)
        });
    }

    /// Update node status
    public fun update_node_status(
        _admin_cap: &AdminCap,
        node: &mut Node,
        new_status: u8,
        ctx: &mut TxContext
    ) {
        assert!(new_status != STATUS_DEACTIVATED, EInvalidStatus);
        assert!(new_status <= STATUS_DEACTIVATED, EInvalidStatus);

        node.status = new_status;

        event::emit(NodeStatusUpdated {
            node_id: node.node_id,
            new_status,
            operator: tx_context::sender(ctx)
        });
    }

    /// Create checkpoint for a node
    public fun create_checkpoint(
        _admin_cap: &AdminCap,
        node_checkpoint: &mut Checkpoint,     
        _data: String
    ) {
        node_checkpoint.data = _data;
        event::emit(CheckpointCreated {
            node_id: node_checkpoint.node_id,
            data: _data
        });
    }

    // Getter functions
    public fun get_node_status(node: &Node): u8 { node.status }
    public fun get_node_id(node: &Node): String { node.node_id }
    public fun get_node_owner(node: &Node): String { node.owner }
    public fun get_checkpoint_data(checkpoint: &Checkpoint): String { checkpoint.data }
}