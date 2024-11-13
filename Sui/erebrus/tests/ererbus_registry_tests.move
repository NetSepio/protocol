#[test_only]
module erebrus::erebrus_registry_v1_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::object;
    use sui::transfer;
    use sui::tx_context;
    use std::string;
    use erebrus::erebrus_registry_v1::{Self, AdminCap, RegistryState};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // Test constants
    const PRICE_PER_MINUTE: u64 = 1000;
    
    #[test]
    fun test_init() {
        let mut scenario = test_scenario::begin(ADMIN);
        // Init is automatically called for the package
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_for_sender<AdminCap>(&scenario), 0);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_register_wifi_node() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Register WiFi node
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::register_wifi_node(
                &mut registry,
                string::utf8(b"device1"),
                string::utf8(b"ssid1"),
                string::utf8(b"location1"),
                PRICE_PER_MINUTE,
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };

        // Verify registration
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let registry = test_scenario::take_shared<RegistryState>(&scenario);
            let (price, owner) = erebrus_registry_v1::get_wifi_details(&registry, 0);
            assert!(price == PRICE_PER_MINUTE, 0);
            assert!(owner == USER1, 1);
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_wifi_checkpoint() {
        let mut scenario = test_scenario::begin(ADMIN);        
        // First register a WiFi node
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::register_wifi_node(
                &mut registry,
                string::utf8(b"device1"),
                string::utf8(b"ssid1"),
                string::utf8(b"location1"),
                PRICE_PER_MINUTE,
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };


        // Add checkpoint
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::wifi_device_checkpoint(
                &mut registry,
                0, // node_id
                string::utf8(b"checkpoint1"),
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = erebrus_registry_v1::ENotAuthorized)]
    fun test_unauthorized_checkpoint() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Register with USER1
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::register_wifi_node(
                &mut registry,
                string::utf8(b"device1"),
                string::utf8(b"ssid1"),
                string::utf8(b"location1"),
                PRICE_PER_MINUTE,
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };

        // Try to checkpoint with USER2 (should fail)
        test_scenario::next_tx(&mut scenario, USER2);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::wifi_device_checkpoint(
                &mut registry,
                0,
                string::utf8(b"checkpoint1"),
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }

    #[test]
    fun test_deactivate_wifi_node() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // First register a node
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            erebrus_registry_v1::register_wifi_node(
                &mut registry,
                string::utf8(b"device1"),
                string::utf8(b"ssid1"),
                string::utf8(b"location1"),
                PRICE_PER_MINUTE,
                test_scenario::ctx(&mut scenario)
            );
            test_scenario::return_shared(registry);
        };

        // Deactivate with admin
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            let mut registry = test_scenario::take_shared<RegistryState>(&scenario);
            
            erebrus_registry_v1::deactivate_wifi_node(&admin_cap, &mut registry, 0);
            
            test_scenario::return_to_sender(&scenario, admin_cap);
            test_scenario::return_shared(registry);
        };
        
        test_scenario::end(scenario);
    }
}