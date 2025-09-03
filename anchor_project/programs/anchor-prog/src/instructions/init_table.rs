use crate::states::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub fn create_table(ctx: Context<CreateTable>) -> Result<()> {
    let table = &mut ctx.accounts.table;
    table.authority = ctx.accounts.authority.key();
    table.vault = ctx.accounts.vault.key();
    table.vault_bump = ctx.bumps.vault;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTable<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Table::INIT_SPACE,
        seeds = [TABLE_SEED],
        bump
    )]
    pub table: Account<'info, Table>,

    /// CHECK: This is a lamports-only PDA we initialize here to be **system-owned**.
    /// Safety: seeds and bump are enforced by Anchor; `owner = system_program::ID` ensures
    /// it is a System Account; `space = 0` means no data to deserialize.
    #[account(
        init,
        payer = authority,
        space = 0,
        seeds = [
            VAULT_SEED,
        ],
        bump,
        owner = system_program::ID
    )]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
