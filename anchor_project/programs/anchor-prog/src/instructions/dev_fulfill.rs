use crate::errors::BlackjackError;
use crate::logic::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn dev_fulfill(ctx: Context<DevFulfill>, randomness: [u8; RNG_BYTES]) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(
        game.status == Status::AwaitingRandomness,
        BlackjackError::BadState
    );

    game.rng = randomness;
    game.rng_cursor = 0;
    game.used_mask = 0;

    let c1 = draw_unique_card(game)?;
    game.player_cards.push(c1);
    let c2 = draw_unique_card(game)?;
    game.player_cards.push(c2);
    let d1 = draw_unique_card(game)?;
    game.dealer_cards.push(d1);
    let d2 = draw_unique_card(game)?;
    game.dealer_cards.push(d2);

    game.status = Status::PlayerTurn;

    msg!("rng[0..8] = {:?}", &game.rng[0..8.min(game.rng.len())]);
    msg!(
        "dealt (player={:?}) (dealer={:?}) cursor={} used_mask={:#018x}",
        game.player_cards,
        game.dealer_cards,
        game.rng_cursor,
        game.used_mask
    );

    Ok(())
}

#[derive(Accounts)]
pub struct DevFulfill<'info> {
    #[account(
        seeds = [TABLE_SEED],
        bump,
    )]
    pub table: Account<'info, Table>,

    #[account(mut)]
    pub game: Account<'info, Game>,
}
