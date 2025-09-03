use crate::errors::BlackjackError;
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

pub fn new_game(ctx: Context<NewGame>, bet_amount: u64) -> Result<()> {
    require!(bet_amount > 0, BlackjackError::InvalidBet);

    let player = &ctx.accounts.player;
    let vault = &ctx.accounts.vault;
    let game = &mut ctx.accounts.game;

    let max_payout = bet_amount * 5 / 2;
    require!(
        vault
            .to_account_info()
            .lamports()
            .saturating_add(bet_amount)
            >= max_payout,
        BlackjackError::VaultInsufficient
    );

    let ix = transfer(&player.key(), &vault.key(), bet_amount);

    invoke(
        &ix,
        &[
            player.to_account_info(),
            vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    game.table = ctx.accounts.table.key();
    game.player = player.key();
    game.bet_amount = bet_amount;
    game.status = Status::AwaitingRandomness;
    game.used_mask = 0;
    game.rng = [0u8; RNG_BYTES];
    game.rng_cursor = 0;
    game.player_cards = vec![];
    game.dealer_cards = vec![];

    Ok(())
}

#[derive(Accounts)]
pub struct NewGame<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [TABLE_SEED],
        bump
    )]
    pub table: Account<'info, Table>,

    /// CHECK: Must match the table’s recorded vault PDA (address constraint),
    /// and seeds/bump are asserted. It’s only used to hold/send lamports.
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump = table.vault_bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(
        init,
        payer = player,
        space = 8 + Game::SPACE,
    )]
    pub game: Account<'info, Game>,

    pub system_program: Program<'info, System>,
}
