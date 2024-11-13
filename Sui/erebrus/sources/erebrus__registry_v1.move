module erebrus::erebrus_registry_v1 {
    use std::string::String;
    use sui::event;
    use sui::table::{Self, Table}; 

    // Error codes
    const ENotAuthorized: u64 = 1;
    const ENodeNotActive: u64 = 2;
    const EInvalidInput: u64 = 3;

    // Admin capability
    public struct AdminCap has key { id: UID }

    // WiFi Node Data
    public struct WifiNode has key, store {
        id: UID,
        user: address,
        device_id: String,
        ssid: String,
        location: String,
        price_per_minute: u64,
        is_active: bool
    }

    // VPN Node Data
    public struct VpnNode has key, store {
        id: UID,
        user: address,
        node_name: String,
        ip_address: String,
        isp_info: String,
        region: String,
        location: String,
        status: u8
    }

    // Registry state
    public struct RegistryState has key {
        id: UID,
        current_wifi_node: u64,
        current_vpn_node: u64,
        wifi_nodes: Table<u64, WifiNodeInfo>,
        vpn_nodes: Table<u64, VpnNodeInfo>
    }

    public struct WifiNodeInfo has store  {
        owner: address,
        is_active: bool,
        total_checkpoints: u64,
        node_checkpoints: Table<u64, String>
    }

    public struct VpnNodeInfo has store {
        owner: address,
        is_active: bool,
        total_checkpoints: u64,
        node_checkpoints: Table<u64, String>
    }

    // Events
    public struct VpnNodeRegisteredEvent has copy, drop {
        node_id: u64,
        node_name: String,
        ip_address: String,
        isp_info: String,
        region: String,
        location: String
    }

    public struct WifiNodeRegisteredEvent has copy, drop {
        node_id: u64,
        owner: address,
        device_id: String,
        ssid: String,
        location: String,
        price_per_minute: u64
    }

    public struct VpnNodeUpdatedEvent has copy, drop {
        node_id: u64,
        status: u8,
        region: String
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));

        let registry = RegistryState {
            id: object::new(ctx),
            current_wifi_node: 0,
            current_vpn_node: 0,
            wifi_nodes: table::new(ctx),
            vpn_nodes: table::new(ctx)
        };
        transfer::share_object(registry);
    }

    public entry fun register_wifi_node(
        registry: &mut RegistryState,
        device_id: String,
        ssid: String,
        location: String,
        price_per_minute: u64,
        ctx: &mut TxContext
    ) {
        let node_id = registry.current_wifi_node;
        registry.current_wifi_node = registry.current_wifi_node + 1;

        let wifi_node = WifiNode {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            device_id,
            ssid,
            location,
            price_per_minute,
            is_active: true
        };

        let wifi_node_info = WifiNodeInfo {
            owner: tx_context::sender(ctx),
            is_active: true,
            total_checkpoints: 0,
            node_checkpoints: table::new(ctx)
        };

        transfer::transfer(wifi_node, tx_context::sender(ctx));
        table::add(&mut registry.wifi_nodes, node_id, wifi_node_info);

        event::emit(WifiNodeRegisteredEvent {
            node_id,
            owner: tx_context::sender(ctx),
            device_id,
            ssid,
            location,
            price_per_minute
        });
    }

    

     // WiFi Device Checkpoint
    public entry fun wifi_device_checkpoint(
        registry: &mut RegistryState,
        node_id: u64,
        data_hash: String,
        ctx: &TxContext
    ) {
        assert!(wifi_node_exists(registry, node_id), EInvalidInput);
        
        let node_info = table::borrow_mut(&mut registry.wifi_nodes, node_id);
        assert!(node_info.owner == tx_context::sender(ctx), ENotAuthorized);
        assert!(node_info.is_active, ENodeNotActive);

        let new_checkpoint = node_info.total_checkpoints + 1;
        table::add(&mut node_info.node_checkpoints, new_checkpoint, data_hash);
        node_info.total_checkpoints = new_checkpoint;
    }

    // Deactivate WiFi Node
    public entry fun deactivate_wifi_node(
        _: &AdminCap,
        registry: &mut RegistryState,
        node_id: u64
    ) {
        assert!(wifi_node_exists(registry, node_id), EInvalidInput);
        let node_info = table::borrow_mut(&mut registry.wifi_nodes, node_id);
        node_info.is_active = false;
    }

    // Destroy WiFi Node
    public entry fun destroy_wifi_node(
        registry: &mut RegistryState,
        wifi_node: WifiNode,
        node_id: u64,
        ctx: &TxContext
    ) {
        let WifiNode { 
            id,
            user,
            device_id: _,
            ssid: _,
            location: _,
            price_per_minute: _,
            is_active: _
        } = wifi_node;

        assert!(wifi_node_exists(registry, node_id), EInvalidInput);
        assert!(user == tx_context::sender(ctx), ENotAuthorized);

        let node_info = table::remove(&mut registry.wifi_nodes, node_id);
        let WifiNodeInfo {
            owner: _,
            is_active: _,
            total_checkpoints: _,
            node_checkpoints
        } = node_info;

        table::drop(node_checkpoints);
        object::delete(id);
    }

    // Register VPN Node
    public entry fun register_vpn_node(
        registry: &mut RegistryState,
        node_name: String,
        ip_address: String,
        isp_info: String,
        region: String,
        location: String,
        ctx: &mut TxContext
    ) {
        let node_id = registry.current_vpn_node;
        registry.current_vpn_node = registry.current_vpn_node + 1;

        let vpn_node = VpnNode {
            id: object::new(ctx),
            user: tx_context::sender(ctx),
            node_name,
            ip_address,
            isp_info,
            region,
            location,
            status: 0
        };

        let vpn_node_info = VpnNodeInfo {
            owner: tx_context::sender(ctx),
            is_active: true,
            total_checkpoints: 0,
            node_checkpoints: table::new(ctx)
        };

        transfer::transfer(vpn_node, tx_context::sender(ctx));
        table::add(&mut registry.vpn_nodes, node_id, vpn_node_info);

        event::emit(VpnNodeRegisteredEvent {
            node_id,
            node_name,
            ip_address,
            isp_info,
            region,
            location
        });
    }

    // VPN Device Checkpoint
    public entry fun vpn_device_checkpoint(
        registry: &mut RegistryState,
        node_id: u64,
        data_hash: String,
        ctx: &TxContext
    ) {
        assert!(vpn_node_exists(registry, node_id), EInvalidInput);
        
        let node_info = table::borrow_mut(&mut registry.vpn_nodes, node_id);
        assert!(node_info.owner == tx_context::sender(ctx), ENotAuthorized);
        assert!(node_info.is_active, ENodeNotActive);

        let new_checkpoint = node_info.total_checkpoints + 1;
        table::add(&mut node_info.node_checkpoints, new_checkpoint, data_hash);
        node_info.total_checkpoints = new_checkpoint;
    }

    // Update VPN Node
    public entry fun update_vpn_node(
        registry: &mut RegistryState,
        node: &mut VpnNode,
        node_id: u64,
        status: u8,
        region: String,
        ctx: &TxContext
    ) {
        assert!(vpn_node_exists(registry, node_id), EInvalidInput);
        assert!(node.user == tx_context::sender(ctx), ENotAuthorized);

        node.status = status;
        node.region = region;

        event::emit(VpnNodeUpdatedEvent {
            node_id,
            status,
            region
        });
    }


    // Deactivate VPN Node
    public entry fun deactivate_vpn_node(
        _: &AdminCap,
        registry: &mut RegistryState,
        node_id: u64
    ) {
        assert!(vpn_node_exists(registry, node_id), EInvalidInput);
        let node_info = table::borrow_mut(&mut registry.vpn_nodes, node_id);
        node_info.is_active = false;
    }

    // Destroy VPN Node
    public entry fun destroy_vpn_node(
        registry: &mut RegistryState,
        vpn_node: VpnNode,
        node_id: u64,
        ctx: &TxContext
    ) {
        let VpnNode { 
            id,
            user,
            node_name: _,
            ip_address: _,
            isp_info: _,
            region: _,
            location: _,
            status: _
        } = vpn_node;

        assert!(vpn_node_exists(registry, node_id), EInvalidInput);
        assert!(user == tx_context::sender(ctx), ENotAuthorized);

        let node_info = table::remove(&mut registry.vpn_nodes, node_id);
        let VpnNodeInfo {
            owner: _,
            is_active: _,
            total_checkpoints: _,
            node_checkpoints
        } = node_info;

        table::drop(node_checkpoints);
        object::delete(id);
    }


    // Helper functions with fixed implementations
    public fun wifi_node_exists(registry: &RegistryState, node_id: u64): bool {
        registry.current_wifi_node > node_id
    }

    public fun vpn_node_exists(registry: &RegistryState, node_id: u64): bool {
        registry.current_vpn_node > node_id
    }

    
    // Get WiFi Details
    public fun get_wifi_details(
        registry: &RegistryState,
        node_id: u64
    ): (u64, address) {
        let node_info = table::borrow(&registry.wifi_nodes, node_id);
        (node_info.total_checkpoints, node_info.owner)
    }
}