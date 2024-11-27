use anchor_lang::prelude::*;

declare_id!("3ypCkXQWiAFkNk7bo8bnZFxUVmVEWCqpBoY7v4vgPnHJ");

#[program]
pub mod erebrus_registry {
    use super::*;
    pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state: &mut Account<'_, State> = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn register_wifi_node(
        ctx: Context<RegisterWifiNode>,
        user_node_num: u64,
        device_id: String,
        ssid: String,
        location: String,
        price_per_minute: u64,
    ) -> Result<()> {
        let wifi_node = &mut ctx.accounts.wifi_node;
        wifi_node.user = ctx.accounts.user.key();
        wifi_node.device_id = device_id;
        wifi_node.ssid = ssid;
        wifi_node.location = location;
        wifi_node.price_per_minute = price_per_minute;
        wifi_node.is_active = true;
        wifi_node.node_id = user_node_num;
        wifi_node.can_close = false;

        emit!(WifiNodeRegistered {
            user_node_num,
            owner: ctx.accounts.user.key(),
            device_id: wifi_node.device_id.clone(),
            ssid: wifi_node.ssid.clone(),
            location: wifi_node.location.clone(),
            price_per_minute
        });

        Ok(())
    }

    pub fn register_vpn_node(
        ctx: Context<RegisterVpnNode>,
        user_node_num: u64,
        peaq_did: String,
        nodename: String,
        ipaddress: String,
        ispinfo: String,
        region: String,
        location: String,
    ) -> Result<()> {
        let vpn_node = &mut ctx.accounts.vpn_node;
        vpn_node.user = ctx.accounts.user.key();
        vpn_node.peaq_did = peaq_did;
        vpn_node.nodename = nodename;
        vpn_node.ipaddress = ipaddress;
        vpn_node.ispinfo = ispinfo;
        vpn_node.region = region;
        vpn_node.location = location;
        vpn_node.status = 0;
        vpn_node.node_id = user_node_num;
        vpn_node.can_close = false;

        emit!(VpnNodeRegistered {
            user_node_num,
            nodename: vpn_node.nodename.clone(),
            ipaddress: vpn_node.ipaddress.clone(),
            ispinfo: vpn_node.ispinfo.clone(),
            region: vpn_node.region.clone(),
            location: vpn_node.location.clone()
        });

        Ok(())
    }

    pub fn update_vpn_node(
        ctx: Context<UpdateVpnNode>,
        _user_node_num: u64,
        status: u8,
        region: String,
    ) -> Result<()> {
        let vpn_node = &mut ctx.accounts.vpn_node;
        require!(
            vpn_node.user == ctx.accounts.user.key(),
            CustomError::Unauthorized
        );

        vpn_node.status = status;
        vpn_node.region = region.clone();

        emit!(VPNUpdated {
            node_id: vpn_node.node_id,
            status,
            region
        });

        Ok(())
    }

    pub fn deactivate_wifi_node(
        ctx: Context<DeactivateWifiNode>,
        _user_node_num: u64,
    ) -> Result<()> {
        let wifi_node = &mut ctx.accounts.wifi_node;
        require!(wifi_node.is_active, CustomError::NodeNotActive);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.state.authority,
            CustomError::Unauthorized
        );

        wifi_node.is_active = false;
        wifi_node.can_close = true;

        emit!(NodeDeactivated {
            operator_address: wifi_node.user
        });

        Ok(())
    }

    pub fn deactivate_vpn_node(ctx: Context<DeactivateVpnNode>, _user_node_num: u64) -> Result<()> {
        let vpn_node = &mut ctx.accounts.vpn_node;
        require!(vpn_node.status != 0, CustomError::NodeNotActive);
        require!(
            ctx.accounts.authority.key() == ctx.accounts.state.authority,
            CustomError::Unauthorized
        );

        vpn_node.status = 0;
        vpn_node.can_close = true;

        emit!(NodeDeactivated {
            operator_address: vpn_node.user
        });

        Ok(())
    }

    pub fn close_wifi_node(ctx: Context<CloseWifiNode>, _user_node_num: u64) -> Result<()> {
        let wifi_node = &ctx.accounts.wifi_node;
        require!(!wifi_node.is_active, CustomError::NodeStillActive);
        require!(wifi_node.can_close, CustomError::NodeNotCloseable);

        emit!(NodeClosed {
            node_id: wifi_node.node_id,
            operator_address: ctx.accounts.user.key()
        });

        Ok(())
    }

    pub fn close_vpn_node(ctx: Context<CloseVpnNode>, _user_node_num: u64) -> Result<()> {
        let vpn_node = &ctx.accounts.vpn_node;
        require!(vpn_node.status == 0, CustomError::NodeStillActive);
        require!(vpn_node.can_close, CustomError::NodeNotCloseable);

        emit!(NodeClosed {
            node_id: vpn_node.node_id,
            operator_address: ctx.accounts.user.key()
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ANCHOR_DISCRIMINATOR_SIZE + State::INIT_SPACE
    )]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user_node_num: u64)]
pub struct RegisterWifiNode<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + WifiNode::INIT_SPACE,
        seeds = [b"wifi", user.key().as_ref(), user_node_num.to_le_bytes().as_ref()],
        bump
    )]
    pub wifi_node: Account<'info, WifiNode>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(user_node_num: u64)]
pub struct RegisterVpnNode<'info> {
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + VpnNode::INIT_SPACE,
        seeds = [b"vpn", user.key().as_ref(), user_node_num.to_le_bytes().as_ref()],
        bump
    )]
    pub vpn_node: Account<'info, VpnNode>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVpnNode<'info> {
    #[account(mut, has_one = user)]
    pub vpn_node: Account<'info, VpnNode>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(_user_node_num: u64)]
pub struct DeactivateWifiNode<'info> {
    #[account(
        mut,
        seeds = [b"wifi", user.key().as_ref(), _user_node_num.to_le_bytes().as_ref()],
        bump
    )]
    pub wifi_node: Account<'info, WifiNode>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub user: SystemAccount<'info>,
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(_user_node_num: u64)]
pub struct DeactivateVpnNode<'info> {
    #[account(
        mut,
        seeds = [b"vpn", user.key().as_ref(), _user_node_num.to_le_bytes().as_ref()],
        bump
    )]
    pub vpn_node: Account<'info, VpnNode>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub user: SystemAccount<'info>,
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(_user_node_num: u64)]
pub struct CloseWifiNode<'info> {
    #[account(
        mut,
        close = user,
        constraint = !wifi_node.is_active @ CustomError::NodeStillActive,
        constraint = wifi_node.can_close @ CustomError::NodeNotCloseable,
        seeds = [b"wifi", user.key().as_ref(), _user_node_num.to_le_bytes().as_ref()],
        bump,
        has_one = user
    )]
    pub wifi_node: Account<'info, WifiNode>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(_user_node_num: u64)]
pub struct CloseVpnNode<'info> {
    #[account(
        mut,
        close = user,
        constraint = vpn_node.status == 0 @ CustomError::NodeStillActive,
        constraint = vpn_node.can_close @ CustomError::NodeNotCloseable,
        seeds = [b"vpn", user.key().as_ref(), _user_node_num.to_le_bytes().as_ref()],
        bump,
        has_one = user
    )]
    pub vpn_node: Account<'info, VpnNode>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct State {
    pub authority: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct WifiNode {
    pub node_id: u64,
    pub user: Pubkey,
    #[max_len(50)]
    pub device_id: String,
    #[max_len(50)]
    pub peaq_did: String,
    #[max_len(50)]
    pub ssid: String,
    #[max_len(100)]
    pub location: String,
    pub price_per_minute: u64,
    pub is_active: bool,
    pub can_close: bool,
}

#[account]
#[derive(InitSpace)]
pub struct VpnNode {
    pub node_id: u64,
    pub user: Pubkey,
    #[max_len(50)]
    pub peaq_did: String,
    #[max_len(50)]
    pub nodename: String,
    #[max_len(50)]
    pub ipaddress: String,
    #[max_len(50)]
    pub ispinfo: String,
    #[max_len(50)]
    pub region: String,
    #[max_len(100)]
    pub location: String,
    pub status: u8,
    pub can_close: bool,
}

#[error_code]
pub enum CustomError {
    #[msg("Node is not active")]
    NodeNotActive,
    #[msg("Node is still active and cannot be closed")]
    NodeStillActive,
    #[msg("Node is not marked for closing")]
    NodeNotCloseable,
    #[msg("User is not authorized")]
    Unauthorized,
}

#[event]
pub struct WifiNodeRegistered {
    pub user_node_num: u64,
    pub owner: Pubkey,
    pub device_id: String,
    pub ssid: String,
    pub location: String,
    pub price_per_minute: u64,
}

#[event]
pub struct VpnNodeRegistered {
    pub user_node_num: u64,
    pub nodename: String,
    pub ipaddress: String,
    pub ispinfo: String,
    pub region: String,
    pub location: String,
}

#[event]
pub struct VPNUpdated {
    pub node_id: u64,
    pub status: u8,
    pub region: String,
}

#[event]
pub struct NodeDeactivated {
    pub operator_address: Pubkey,
}

#[event]
pub struct NodeClosed {
    pub node_id: u64,
    pub operator_address: Pubkey,
}
