use crate::errors::BlackjackError;
use crate::logic::*;
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::system_instruction::transfer;
use anchor_lang::system_program;

pub fn settle(ctx: Context<Settle>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(
        matches!(game.status, Status::Settled | Status::DealerTurn),
        BlackjackError::BadState
    );

    if game.status == Status::DealerTurn {
        while dealer_should_hit(&game.dealer_cards) {
            let c = draw_unique_card(game)?;
            game.dealer_cards.push(c);
        }
    }

    let payout = compute_payout(&game.player_cards, &game.dealer_cards, game.bet_amount);
    if payout > 0 {
        let bump_arr = [ctx.accounts.table.vault_bump];

        let signer_seeds: &[&[u8]] = &[VAULT_SEED, &bump_arr];

        let ix = transfer(
            &ctx.accounts.vault.key(),
            &ctx.accounts.player.key(),
            payout,
        );

        invoke_signed(
            &ix,
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.player.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[signer_seeds], // &[&[&[u8]]] as required
        )?;
    }

    game.status = Status::Closed;
    Ok(())
}

#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut)]
    pub player: SystemAccount<'info>,

    #[account(
        seeds = [TABLE_SEED],
        bump,
    )]
    pub table: Account<'info, Table>,

    #[account(mut)]
    pub game: Account<'info, Game>,

    /// CHECK: must be the table’s vault PDA
    #[account(
        mut,
        address = table.vault,
        seeds = [VAULT_SEED],
        bump = table.vault_bump,
        owner = system_program::ID
    )]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}
