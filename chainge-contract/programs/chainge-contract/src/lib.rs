use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("8ZwBUokcMFPVtjSXrCxhXNgqgshn4PNpE9Q3grtH61mq");

#[program]
pub mod chainge_contract {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        round_up_amount: u64,
        strategy: Strategy,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.round_up_amount = round_up_amount;
        vault.strategy = strategy;
        vault.total_deposited = 0;
        vault.total_withdrawn = 0;
        vault.deposit_count = 0;
        vault.created_at = Clock::get()?.unix_timestamp;
        vault.last_deposit_at = 0;
        vault.is_active = true;
        vault.bump = ctx.bumps.vault;
        msg!("Chainge vault initialized for {}", vault.owner);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, ChaingeError::ZeroAmount);
        require!(ctx.accounts.vault.is_active, ChaingeError::VaultInactive);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.owner.to_account_info(),
                    to: ctx.accounts.vault_sol.to_account_info(),
                },
            ),
            amount,
        )?;

        let vault = &mut ctx.accounts.vault;
        vault.total_deposited += amount;
        vault.deposit_count += 1;
        vault.last_deposit_at = Clock::get()?.unix_timestamp;

        emit!(DepositEvent {
            owner: vault.owner,
            amount,
            total_deposited: vault.total_deposited,
            deposit_count: vault.deposit_count,
            timestamp: vault.last_deposit_at,
        });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, ChaingeError::ZeroAmount);
        let vault_sol_balance = ctx.accounts.vault_sol.lamports();
        require!(amount <= vault_sol_balance, ChaingeError::InsufficientFunds);

        **ctx.accounts.vault_sol.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;

        let vault = &mut ctx.accounts.vault;
        vault.total_withdrawn += amount;

        emit!(WithdrawEvent {
            owner: vault.owner,
            amount,
            total_withdrawn: vault.total_withdrawn,
            timestamp: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    pub fn update_settings(
        ctx: Context<UpdateSettings>,
        round_up_amount: Option<u64>,
        strategy: Option<Strategy>,
        is_active: Option<bool>,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        if let Some(amount) = round_up_amount {
            vault.round_up_amount = amount;
        }
        if let Some(s) = strategy {
            vault.strategy = s;
        }
        if let Some(active) = is_active {
            vault.is_active = active;
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + Vault::INIT_SPACE,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK: PDA that holds SOL deposits
    #[account(
        mut,
        seeds = [b"vault_sol", owner.key().as_ref()],
        bump,
    )]
    pub vault_sol: SystemAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK: PDA that holds SOL deposits
    #[account(
        mut,
        seeds = [b"vault_sol", owner.key().as_ref()],
        bump,
    )]
    pub vault_sol: SystemAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,
    /// CHECK: PDA that holds SOL deposits
    #[account(
        mut,
        seeds = [b"vault_sol", owner.key().as_ref()],
        bump,
    )]
    pub vault_sol: SystemAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateSettings<'info> {
    #[account(
        mut,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        has_one = owner,
    )]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub owner: Pubkey,
    pub round_up_amount: u64,
    pub strategy: Strategy,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub deposit_count: u64,
    pub created_at: i64,
    pub last_deposit_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Strategy {
    LiquidStake,
    LpYield,
    Dca,
    Vault,
}

#[event]
pub struct DepositEvent {
    pub owner: Pubkey,
    pub amount: u64,
    pub total_deposited: u64,
    pub deposit_count: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub owner: Pubkey,
    pub amount: u64,
    pub total_withdrawn: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ChaingeError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Vault is not active")]
    VaultInactive,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
}
