use anchor_lang::prelude::*;

declare_id!("BbrLieEbnzqfa6JU4hWFZEx5v5uN9ku84QFVkUHJo9P2"); 

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod erebrus_v1 {
    use super::*;

    /// Registers a new node in the network with provided details and sets initial status to active (1) ///
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
        node.user = ctx.accounts.user.key();
        node.id = id;
        node.name = name;
        node.node_type = node_type;
        node.config = config;
        node.ipaddress = ipaddress;
        node.region = region;
        node.location = location;
        node.metadata = metadata;
        node.owner = owner;
        node.status = 1; // Always 1 for active status///

        // emit config , metadata
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

    /// Deactivates a node by closing its PDA and returning the lamports to the user///
    pub fn deactivate_node(ctx: Context<DeactivateNode>, node_id: String) -> Result<()> {
        let node = &ctx.accounts.node;

        emit!(NodeDeactivated {
            id: node_id,
            owner_address: node.owner,
        });

        Ok(())
    }

    // / Updates node status to either offline (0), online (1), or maintenance (2)///
    pub fn update_node_status(
        ctx: Context<UpdateNode>,
        node_id: String,
        new_status: u8,
    ) -> Result<()> {
        let node = &mut ctx.accounts.node;
        node.status = new_status; // 0: Offline, 1: Online, 2: Maintenance///
        emit!(NodeStatusUpdated {
            id: node_id,
            new_status,
        });

        Ok(())
    }

    /// Creates a checkpoint for a node with provided data and emits timestamp in event
    pub fn create_checkpoint(
        ctx: Context<CreateCheckpoint>,
        node_id: String,
        data: String,
    ) -> Result<()> {
        let checkpoint = &mut ctx.accounts.checkpoint;
        checkpoint.node_id = node_id;
        checkpoint.data = data;

        emit!(CheckpointCreated {
            node_id: checkpoint.node_id.clone(),
            data: checkpoint.data.clone(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: String)]
pub struct RegisterNode<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Node::INIT_SPACE,
        seeds = [b"erebrus", user.key().as_ref(), id.as_bytes()],  
        bump
    )]
    pub node: Account<'info, Node>,
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
        seeds = [b"erebrus", user.key().as_ref(), node_id.as_bytes()],
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
        seeds = [b"erebrus", user.key().as_ref(), node_id.as_bytes()],
        bump
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCheckpoint<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Checkpoint::INIT_SPACE
    )]
    pub checkpoint: Account<'info, Checkpoint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    pub status: u8, // 0: Offline, 1: Online, 2: Maintenance, 4: Deactivated ///
}

#[account]
#[derive(InitSpace)]
pub struct Checkpoint {
    #[max_len(500)]
    pub node_id: String,
    #[max_len(1000)]
    pub data: String,
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
    pub owner_address: Pubkey, // Changed from operator_address to match usage ///
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
