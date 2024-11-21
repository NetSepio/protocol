module erebrus::erebrus_v1 {
    use erebrus::erebrus_registry_v1::{Self,RegistryState};
    use std::string::{Self, String};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self,Balance};
    use sui::table::{Self, Table};
    use sui::url::{Self, Url};

    // Error Constants
    const ENFTMintingPaused: u64 = 1;
    const EInsufficientAmount: u64 = 2;
    // const EUnauthorized: u64 = 3;
    // const ENotOwner: u64 = 4;
    const EConnectionNotAccepted: u64 = 5;
    // const EInvalidDuration: u64 = 6;

    // Capability for admin functions
    public struct AdminCap has key { id: UID }

    // NFT Structure
    public struct ErebrusNFT has key, store {
        id: UID,
        name: String,
        description: String,
        url: Url,
        refund: bool
    }

   // WifiRequest struct
    public struct WifiRequest has store {
        accepted: bool,
        settled: bool,
        node_id: u64
    }

    public struct State has key {
        id: UID,
        public_sale_price: u64,
        subscription_per_month: u64,
        mint_paused: bool,
        user_funds: Table<address, Balance<SUI>>, // Changed to Balance
        wifi_requests: Table<address, WifiRequest>,
    }

    // Events
    public struct NFTMintedEvent has copy, drop {
        object_id: ID,
        creator: address,
        name: String,
        url: Url
    }

    public struct WifiRequestCreated has copy, drop {
        requester: address,
        device_id: u64
    }

    public struct WifiRequestManaged has copy, drop {
        requester: address,
        status: bool
    }

    public struct WifiPaymentSettled has copy, drop {
        user: address,
        amount: u64,
        device_id: u64
    }

    public struct FundsAdded has copy, drop {
        user: address,
        amount: u64
    }

    // Initialize module
    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));

        let state = State {
            id: object::new(ctx),
            public_sale_price: 0,
            subscription_per_month: 0,
            mint_paused: true,
            user_funds: table::new(ctx),
            wifi_requests: table::new(ctx),
        };
        transfer::share_object(state);
    }

    // Mint NFT
    public entry fun mint(
        state: &mut State,
        payment: Coin<SUI>,
        name: String,
        description: String,
        uri: String,
        ctx: &mut TxContext
    ) {
        assert!(!state.mint_paused, ENFTMintingPaused);
        assert!(coin::value(&payment) >= state.public_sale_price, EInsufficientAmount);

        transfer::public_transfer(payment, tx_context::sender(ctx));

        let nft = ErebrusNFT {
            id: object::new(ctx),
            name,
            description,
            url: url::new_unsafe_from_bytes(*string::as_bytes(&uri)),
            refund: false
        };

        event::emit(NFTMintedEvent {
            object_id: object::id(&nft),
            creator: tx_context::sender(ctx),
            name,
            url: nft.url,
        });

        transfer::transfer(nft, tx_context::sender(ctx))
    }

        // ✅
        public entry fun request_wifi_connection(
        state: &mut State,
        node_id: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let request = WifiRequest {
            accepted: false,
            settled: false,
            node_id
        };
        
        table::add(&mut state.wifi_requests, sender, request);
        
        event::emit(WifiRequestCreated {
            requester: sender,
            device_id: node_id
        });
    }

    public entry fun manage_wifi_request(
        _: &AdminCap,
        state: &mut State,
        intent_requester: address,
        status: bool,
    ) {

        let request = table::borrow_mut(&mut state.wifi_requests, intent_requester);
        request.accepted = status;
        
        event::emit(WifiRequestManaged {
            requester: intent_requester,
            status
        });
    }

    public entry fun settle_wifi_payment(
        state: &mut State,
        registry: &RegistryState,
        payment: Coin<SUI>,
        duration: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let request = table::borrow_mut(&mut state.wifi_requests, sender);
        assert!(request.accepted, EConnectionNotAccepted);

        let (price_per_min, device_owner) = erebrus_registry_v1::get_wifi_details(registry,request.node_id);
        let required_amount = price_per_min * duration;
        
        assert!(coin::value(&payment) >= required_amount, EInsufficientAmount);

        request.accepted = false;

        event::emit(WifiPaymentSettled {
            user: sender,
            amount: coin::value(&payment),
            device_id: request.node_id
        });

        transfer::public_transfer(payment, device_owner);

    }

    // Add funds to user balance
    public entry fun add_funds(
        state: &mut State,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(coin::value(&payment) > 0, EInsufficientAmount);
        
        let balance = coin::into_balance(payment);
        
        if (!table::contains(&state.user_funds, sender)) {
            table::add(&mut state.user_funds, sender, balance::zero());
        };
        
        let user_balance = table::borrow_mut(&mut state.user_funds, sender);
        
        event::emit(FundsAdded {
            user: sender,
            amount: balance::value(&balance)
        });

        balance::join(user_balance, balance);
    }


    // Burn NFT
    public entry fun burn(
        nft: ErebrusNFT,
    ) {
        let ErebrusNFT { id, name: _, description: _, url: _, refund: _ } = nft;
        object::delete(id);
    }

    // Add these new functions to control minting status
    public entry fun pause_mint(
        _: &AdminCap,
        state: &mut State,
    ) {
        state.mint_paused = true;
    }

    public entry fun unpause_mint(
        _: &AdminCap,
        state: &mut State,
    ) {
        state.mint_paused = false;
    }



}