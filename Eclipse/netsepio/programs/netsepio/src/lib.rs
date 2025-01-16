use anchor_lang::prelude::*;

declare_id!("E5RuXgzg74bGfy8BzcvvwSUfZvXRMMU5ds1ci41gzHoz");

pub const ADMIN_KEY: Pubkey =
    solana_program::pubkey!("FG75GTSYMimybJUBEcu6LkcNqm7fkga1iMp3v4nKnDQS");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

pub const OFFLINE_STATUS: u8 = 0;
pub const ONLINE_STATUS: u8 = 1;
pub const MAINTENANCE_STATUS: u8 = 2;

#[program]
pub mod netsepio {
    use super::*;

    pub fn intialize_authority(ctx: Context<IntializeAuthority>) -> Result<()> {
        let authority = &mut ctx.accounts.authority;
        authority.admin = ctx.accounts.user.key();
        authority.operator = ctx.accounts.user.key();
        Ok(())
    }

    pub fn update_authority(ctx: Context<UpdateAuthority>, operator: Pubkey) -> Result<()> {
        let authority = &mut ctx.accounts.authority;
        authority.operator = operator;
        Ok(())
    }

    // Registers a new node in the network with provided details and sets initial status to active (1)
    pub fn register_node(
        ctx: Context<RegisterNode>,
        id: String,
        address: Pubkey,
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
        node.address = address;
        node.id = id;
        node.name = name;
        node.node_type = node_type;
        node.config = config;
        node.ipaddress = ipaddress;
        node.region = region;
        node.location = location;
        node.metadata = metadata;
        node.owner = owner;
        node.status = OFFLINE_STATUS;

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

    // Deactivates a node by closing its PDA and returning the lamports to the user //
    pub fn deactivate_node(_ctx: Context<DeactivateNode>, node_id: String) -> Result<()> {
        emit!(NodeDeactivated { id: node_id });
        Ok(())
    }

    // Updates node status to either offline (0), online (1), or maintenance (2)
    pub fn update_node_status(
        ctx: Context<UpdateNode>,
        node_id: String,
        new_status: u8,
    ) -> Result<()> {
        require!(
            new_status == OFFLINE_STATUS
                || new_status == ONLINE_STATUS
                || new_status == MAINTENANCE_STATUS,
            ErrorCode::InvalidStatus
        );
        let node = &mut ctx.accounts.node;
        node.status = new_status; // 0: Offline, 1: Online, 2: Maintenance //
        emit!(NodeStatusUpdated {
            id: node_id,
            new_status,
        });

        Ok(())
    }

    // Creates a checkpoint for a node with provided data and emits timestamp in event
    pub fn create_checkpoint(
        ctx: Context<CreateCheckpoint>,
        owner: Pubkey,
        node_id: String,
        data: String,
    ) -> Result<()> {
        let checkpoint = &mut ctx.accounts.checkpoint;
        checkpoint.node_id = node_id;
        checkpoint.data = data;

        emit!(CheckpointCreated {
            owner: owner.clone(),
            node_id: checkpoint.node_id.clone(),
            data: checkpoint.data.clone(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct IntializeAuthority<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Authority::INIT_SPACE,
        seeds = [b"erebrus", user.key().as_ref()],  
        bump,
        constraint = user.key() == ADMIN_KEY @ ErrorCode::NotAuthorized
    )]
    pub authority: Account<'info, Authority>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        seeds = [b"erebrus", user.key().as_ref()],
        bump
    )]
    pub authority: Account<'info, Authority>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct RegisterNode<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Node::INIT_SPACE,
        seeds = [b"erebrus", id.as_bytes()],  
        bump,
        constraint = user.key() == authority.operator @ ErrorCode::NotAuthorized
    )]
    pub node: Account<'info, Node>,

    pub authority: Account<'info, Authority>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct DeactivateNode<'info> {
    #[account(
        mut,
        close = user,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump,
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct UpdateNode<'info> {
    #[account(
        mut,
        seeds = [b"erebrus", node_id.as_bytes()],
        bump
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(owner: Pubkey,node_id: String)]
pub struct CreateCheckpoint<'info> {
    #[account(
        init_if_needed,
        payer = user,
        seeds = [b"erebrus",owner.as_ref(), node_id.as_bytes()],
        space = ANCHOR_DISCRIMINATOR_SIZE + Checkpoint::INIT_SPACE,
        bump,
        constraint = authority.operator == user.key() @ ErrorCode::NotAuthorized
    )]
    pub checkpoint: Account<'info, Checkpoint>,
    pub authority: Account<'info, Authority>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Node {
    #[max_len(100)]
    pub id: String,
    pub address: Pubkey,
    #[max_len(100)]
    pub name: String,
    #[max_len(100)]
    pub node_type: String,
    #[max_len(500)]
    pub config: String,
    #[max_len(100)]
    pub ipaddress: String,
    #[max_len(100)]
    pub region: String,
    #[max_len(100)]
    pub location: String,
    #[max_len(200)]
    pub metadata: String,
    pub owner: Pubkey,
    pub status: u8, // 0: Offline, 1: Online, 2: Maintenance
}

#[account]
#[derive(InitSpace)]
pub struct Checkpoint {
    #[max_len(500)]
    pub node_id: String,
    #[max_len(1000)]
    pub data: String,
}

#[account]
#[derive(InitSpace)]
pub struct Authority {
    pub admin: Pubkey,
    pub operator: Pubkey,
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
}

#[event]
pub struct NodeStatusUpdated {
    pub id: String,
    pub new_status: u8,
}

#[event]
pub struct CheckpointCreated {
    pub owner: Pubkey,
    pub node_id: String,
    pub data: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    NotAuthorized,
    #[msg("Invalid status provided")]
    InvalidStatus,
}
