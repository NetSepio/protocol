use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        metadata::{
            create_metadata_accounts_v3,
            mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3,
            Metadata as MetaplexMetadata,
        },
        token::{Mint, Token, TokenAccount},
    },
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod erebrus_nft {
    use super::*;
    pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.authority = ctx.accounts.authority.key();
        state.next_token_id = 0;
        Ok(())
    }

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let state = &mut ctx.accounts.state;
        let token_id = state.next_token_id;

        // Create metadata
        let token_metadata = DataV2 {
            name,
            symbol,
            uri: uri.clone(),
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        };

        // Create metadata account
        create_metadata_accounts_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    mint_authority: ctx.accounts.payer.to_account_info(),
                    update_authority: ctx.accounts.payer.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            token_metadata,
            true,  // Is mutable
            true,  // Update authority is signer
            None,  // Collection details
        )?;

        state.next_token_id = token_id.checked_add(1).unwrap();

        emit!(NftMinted {
            token_id,
            owner: ctx.accounts.payer.key(),
            uri,
        });

        Ok(())
    }

    pub fn request_wifi_connection(
        ctx: Context<RequestWifiConnection>,
        node_id: u64,
    ) -> Result<()> {
        let token_amount = ctx.accounts.token_account.amount;
        require!(token_amount > 0, ErebrusError::NoNftOwned);

        let wifi_request = &mut ctx.accounts.wifi_request;
        wifi_request.user = ctx.accounts.user.key();
        wifi_request.node_id = node_id;
        wifi_request.accepted = false;
        wifi_request.settled = false;
        wifi_request.can_close = false;

        emit!(WifiRequestCreated {
            requester: ctx.accounts.user.key(),
            node_id,
        });

        Ok(())
    }

    pub fn manage_wifi_request(
        ctx: Context<ManageWifiRequest>,
        _node_id: u64,
        status: bool,
    ) -> Result<()> {
        require!(
            ctx.accounts.operator.key() == ctx.accounts.state.authority,
            ErebrusError::NotOperator
        );

        let wifi_request = &mut ctx.accounts.wifi_request;
        wifi_request.accepted = status;
        
        if !status || wifi_request.settled {
            wifi_request.can_close = true;
        }

        emit!(WifiRequestManaged {
            requester: wifi_request.user,
            accepted: status,
        });

        Ok(())
    }

    pub fn delete_wifi_request(
        ctx: Context<DeleteWifiRequest>,
        _node_id: u64,
    ) -> Result<()> {
        let wifi_request = &ctx.accounts.wifi_request;
        require!(wifi_request.can_close, ErebrusError::RequestNotCloseable);
        
        emit!(WifiRequestDeleted {
            requester: wifi_request.user,
            node_id: wifi_request.node_id,
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
#[instruction(name: String, symbol: String, uri: String)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,

    /// CHECK: This is not dangerous
    #[account(
        mut,
        seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer,
    )]
    pub mint_account: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_metadata_program: Program<'info, MetaplexMetadata>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(node_id: u64)]
pub struct RequestWifiConnection<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + WifiRequest::INIT_SPACE,
        seeds = [b"wifi-request", user.key().as_ref(), node_id.to_le_bytes().as_ref()],
        bump
    )]
    pub wifi_request: Account<'info, WifiRequest>,

    #[account(
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous
    pub mint: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(_node_id: u64)]
pub struct ManageWifiRequest<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"wifi-request", wifi_request.user.key().as_ref(), _node_id.to_le_bytes().as_ref()],
        bump
    )]
    pub wifi_request: Account<'info, WifiRequest>,
    
    pub state: Account<'info, State>,
}

#[derive(Accounts)]
#[instruction(_node_id: u64)]
pub struct DeleteWifiRequest<'info> {
    #[account(
        mut,
        close = user,
        constraint = wifi_request.can_close @ ErebrusError::RequestNotCloseable,
        seeds = [b"wifi-request", user.key().as_ref(), _node_id.to_le_bytes().as_ref()],
        bump,
        has_one = user
    )]
    pub wifi_request: Account<'info, WifiRequest>,
    
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct State {
    pub authority: Pubkey,
    pub next_token_id: u64,
}

#[account]
#[derive(InitSpace)]
pub struct WifiRequest {
    pub user: Pubkey,
    pub node_id: u64,
    pub accepted: bool,
    pub settled: bool,
    pub can_close: bool,
}

#[event]
pub struct NftMinted {
    pub token_id: u64,
    pub owner: Pubkey,
    pub uri: String,
}

#[event]
pub struct WifiRequestCreated {
    pub requester: Pubkey,
    pub node_id: u64,
}

#[event]
pub struct WifiRequestManaged {
    pub requester: Pubkey,
    pub accepted: bool,
}

#[event]
pub struct WifiRequestDeleted {
    pub requester: Pubkey,
    pub node_id: u64,
}

#[error_code]
pub enum ErebrusError {
    #[msg("No NFT owned")]
    NoNftOwned,
    #[msg("Not an operator")]
    NotOperator,
    #[msg("Request cannot be closed yet")]
    RequestNotCloseable,
}