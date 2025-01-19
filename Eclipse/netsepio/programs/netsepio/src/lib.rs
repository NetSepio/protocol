use anchor_lang::prelude::*;

declare_id!("E5RuXgzg74bGfy8BzcvvwSUfZvXRMMU5ds1ci41gzHoz");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod netsepio {
    use super::*;

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
        checkpoint: String,
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
        node.checkpoint = checkpoint;
        node.owner = owner;

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

    // Creates a checkpoint for a node with provided data and emits timestamp in event
    pub fn create_checkpoint(
        ctx: Context<CreateCheckpoint>,
        node_id: String,
        data: String,
    ) -> Result<()> {
        let node = &mut ctx.accounts.node;
        node.checkpoint = data;

        emit!(CheckpointCreated {
            node_id: node_id.clone(),
            data: node.checkpoint.clone(),
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
        seeds = [b"netsepio", id.as_bytes()],  
        bump,
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
        seeds = [b"netsepio", node_id.as_bytes()],
        bump,
    )]
    pub node: Account<'info, Node>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(node_id: String)]
pub struct CreateCheckpoint<'info> {
    #[account(
        mut,
        seeds = [b"netsepio",node_id.as_bytes()],
        bump,
    )]
    pub node: Account<'info, Node>,

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
    #[max_len(500)]
    pub checkpoint: String,
    pub owner: Pubkey,
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
    pub node_id: String,
    pub data: String,
}
