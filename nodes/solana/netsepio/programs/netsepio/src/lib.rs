use anchor_lang::prelude::*;
use anchor_lang::Space;
use solana_program::pubkey::Pubkey;

use mpl_core::{
    instructions::{
        BurnV1CpiBuilder, CreateCollectionV2CpiBuilder, CreateV1CpiBuilder, UpdateV2CpiBuilder,
    },
    types::{DataState, FreezeDelegate, Plugin, PluginAuthority, PluginAuthorityPair},
    ID as MPL_CORE_ID,
};

declare_id!("7JD74hNXHTYBMw9FMfduY9ArRf8bTFdsvWJQFmKyAGGj");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

pub const ADMIN_KEY: Pubkey =
    solana_program::pubkey!("FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS");

#[program]
pub mod netsepio {
    use mpl_core::instructions::UpdatePluginV1CpiBuilder;

    use super::*;

    // Instruction to create a collection
    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String,
        uri: String,
    ) -> Result<()> {
        msg!("Creating Collection: {}", name);

        // Use the CreateCollectionV2CpiBuilder to create a collection
        CreateCollectionV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .collection(&ctx.accounts.collection.to_account_info())
            .payer(&ctx.accounts.payer.to_account_info())
            .update_authority(Some(&ctx.accounts.authority.to_account_info()))
            .system_program(&ctx.accounts.system_program.to_account_info())
            .name(name)
            .uri(uri)
            .invoke()?;

        msg!("Collection created successfully!");
        Ok(())
    }

    // Registers a new node in the network with provided details and sets initial status to active (1)
    pub fn register_node(
        ctx: Context<RegisterNode>,
        id: String,
        name: String,
        node_type: String,
        config: String,
        ipaddress: String,
        region: String,
        location: String,
        metadata: String,
        owner: Pubkey,
    ) -> Result<()> {
        let node = &mut ctx.accounts.node;
        node.user = ctx.accounts.payer.key();
        node.id = id;
        node.name = name.clone();
        node.node_type = node_type;
        node.config = config;
        node.ipaddress = ipaddress;
        node.region = region;
        node.location = location;
        node.metadata = metadata;
        node.owner = owner;
        node.asset = None; // intialize to own an nft
        node.status = NodeStatus::OFFLINE;
        node.checkpoint_data = String::new();

        // emit config, metadata
        emit!(NodeRegistered {
            id: node.id.clone(),
            name: node.name.clone(),
            node_type: node.node_type.clone(),
            config: node.config.clone(),
            ipaddress: node.ipaddress.clone(),
            region: node.region.clone(),
            location: node.location.clone(),
            metadata: node.metadata.clone(),
            owner: node.owner.to_string()
        });

        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNft>,
        node_id: String,
        name: String,
        uri: String,
    ) -> Result<()> {
        msg!("Creating Soulbound NFT: {} for node {}", name, node_id);

        // Use the CreateV1CpiBuilder with the exact plugin format requested
        CreateV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.collection.to_account_info()))
            .authority(Some(&ctx.accounts.authority.to_account_info()))
            .payer(&ctx.accounts.payer.to_account_info())
            .owner(Some(&ctx.accounts.owner.to_account_info()))
            .system_program(&ctx.accounts.system_program.to_account_info())
            .data_state(DataState::AccountState)
            .name(name)
            .uri(uri)
            .plugins(vec![PluginAuthorityPair {
                plugin: Plugin::FreezeDelegate(FreezeDelegate { frozen: true }),
                authority: Some(PluginAuthority::Address {
                    address: ctx.accounts.owner.key(),
                }),
            }])
            .invoke()?;
        msg!("Soulbound NFT created successfully!");

        let node = &mut ctx.accounts.node;
        node.asset = Some(ctx.accounts.asset.key()); // Store the NFT's Pubkey in node.asset

        Ok(())
    }

    // Deactivates a node by closing its PDA and returning the lamports to the user //
    pub fn deactivate_node(ctx: Context<DeactivateNode>, node_id: String) -> Result<()> {
        let node = &ctx.accounts.node;

        UpdatePluginV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.collection.to_account_info()))
            .payer(&ctx.accounts.payer.to_account_info())
            .authority(Some(&ctx.accounts.payer.to_account_info())) // Use payer instead of owner
            .system_program(&ctx.accounts.system_program.to_account_info())
            .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: false }))
            .invoke()?;

        //Burn the NFT
        BurnV1CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.collection.to_account_info()))
            .payer(&ctx.accounts.payer.to_account_info())
            .authority(Some(&ctx.accounts.payer.to_account_info())) // Payer is the owner and signer
            .invoke()?;

        emit!(NodeDeactivated {
            id: node_id,
            owner_address: node.owner,
        });

        Ok(())
    }

    // Updates node status to either offline (0), online (1), or maintenance (2)
    pub fn update_node_status(
        ctx: Context<UpdateNode>,
        node_id: String,
        new_status: u8,
    ) -> Result<()> {
        let node = &mut ctx.accounts.node;

        // Convert u8 to NodeStatus
        node.status = match new_status {
            0 => NodeStatus::OFFLINE,
            1 => NodeStatus::ONLINE,
            2 => NodeStatus::MAINTENANCE,
            _ => return Err(ErrorCode::InvalidNodeStatus.into()),
        };

        emit!(NodeStatusUpdated {
            id: node_id,
            new_status,
        });

        Ok(())
    }

    pub fn update_node_metadata(ctx: Context<UpdateNodeMetadata>, uri: String) -> Result<()> {
        UpdateV2CpiBuilder::new(&ctx.accounts.mpl_core_program.to_account_info())
            .asset(&ctx.accounts.asset.to_account_info())
            .collection(Some(&ctx.accounts.collection.to_account_info()))
            .authority(Some(&ctx.accounts.authority.to_account_info()))
            .payer(&ctx.accounts.payer.to_account_info())
            .system_program(&ctx.accounts.system_program.to_account_info())
            .new_uri(uri)
            .invoke()?;
        Ok(())
    }

    // Creates a checkpoint for a node with provided data and emits timestamp in event
    pub fn create_checkpoint(
        ctx: Context<CreateCheckpoint>,
        node_id: String,
        data: String,
    ) -> Result<()> {
        let node = &mut ctx.accounts.node;
        node.checkpoint_data = data;

        emit!(CheckpointCreated {
            node_id,
            data: node.checkpoint_data.clone(),
        });

        Ok(())
    }
}

// Account structure for creating a collection
#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(
        mut,
        constraint = authority.key() == ADMIN_KEY.key()
    )]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub collection: Signer<'info>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct MintNft<'info> {
    /// CHECK: This is a static account that won't sign
    #[account(mut,
        constraint = authority.key() == ADMIN_KEY.key()
    )]
    pub authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub asset: Signer<'info>,

    #[account(
        mut,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump,
    )]
    pub node: Account<'info, Node>,

    /// CHECK: Owner of the asset (recipient of the NFT)
    pub owner: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: We don't validate the collection account here as mpl-core will do it
    pub collection: UncheckedAccount<'info>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct RegisterNode<'info> {
    #[account(
        init,
        payer = payer,
        space = ANCHOR_DISCRIMINATOR_SIZE + Node::INIT_SPACE,
        seeds = [b"erebrus", id.as_bytes()],
        bump
    )]
    pub node: Account<'info, Node>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct DeactivateNode<'info> {
    #[account(
        mut,
        close = payer,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump,
        constraint = node.owner == payer.key() @ ErrorCode::NotNodeOwner
    )]
    pub node: Account<'info, Node>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        constraint = asset.key() == node.asset.ok_or(ErrorCode::InvalidAsset)? @ ErrorCode::InvalidAsset
    )]
    /// CHECK: The NFT asset to burn, validated by mpl-core
    pub asset: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: The collection the NFT belongs to, validated by mpl-core
    pub collection: UncheckedAccount<'info>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateNodeMetadata<'info> {
    #[account(
        mut,
        constraint = authority.key() == ADMIN_KEY.key()
    )]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub asset: Signer<'info>,

    #[account(mut)]
    pub collection: Signer<'info>,

    #[account(address = MPL_CORE_ID)]
    /// CHECK: This is the MPL Core program
    pub mpl_core_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,

    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct UpdateNode<'info> {
    #[account(
        mut,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump,
        constraint = payer.key() == ADMIN_KEY.key() @ ErrorCode::NotAuthorized
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct CreateCheckpoint<'info> {
    #[account(
        mut,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump,
        constraint = node.owner == payer.key() || payer.key() == ADMIN_KEY.key() @ ErrorCode::NotAuthorized
    )]
    pub node: Account<'info, Node>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum NodeStatus {
    OFFLINE,
    ONLINE,
    MAINTENANCE,
}

impl anchor_lang::Space for NodeStatus {
    const INIT_SPACE: usize = 1; // Enums are stored as a u8 discriminator
}

#[account]
#[derive(InitSpace)]
pub struct Node {
    #[max_len(50)]
    pub id: String,
    pub user: Pubkey,
    #[max_len(50)]
    pub name: String,
    #[max_len(50)]
    pub node_type: String,
    #[max_len(200)]
    pub config: String,
    #[max_len(50)]
    pub ipaddress: String,
    #[max_len(50)]
    pub region: String,
    #[max_len(100)]
    pub location: String,
    #[max_len(200)]
    pub metadata: String,
    #[max_len(50)]
    pub owner: Pubkey,
    pub asset: Option<Pubkey>,
    pub status: NodeStatus,
    #[max_len(200)]
    pub checkpoint_data: String,
}

#[event]
pub struct NodeRegistered {
    pub id: String,
    pub name: String,
    pub node_type: String,
    pub config: String,
    pub ipaddress: String,
    pub region: String,
    pub location: String,
    pub metadata: String,
    pub owner: String,
}

// Update the event struct
#[event]
pub struct NodeDeactivated {
    pub id: String,
    pub owner_address: Pubkey, // Changed from operator_address to match usage
}

#[event]
pub struct NodeStatusUpdated {
    pub id: String,
    pub new_status: u8,
}

#[event]
pub struct CheckpointCreated {
    pub node_id: String,
    pub data: String,
}

#[event]
pub struct CheckpointUpdated {
    pub node_id: String,
    pub data: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not node owner")]
    NotNodeOwner,
    #[msg("Invalid node status value")]
    InvalidNodeStatus,
    #[msg("Not authorized")]
    NotAuthorized,
    #[msg("Provided asset does not match node's asset")]
    InvalidAsset, // New error for asset mismatch
}
