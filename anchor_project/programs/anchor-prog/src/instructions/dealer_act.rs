use crate::errors::BlackjackError;
use crate::logic::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn dealer_hit(ctx: Context<DealerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::DealerTurn, BlackjackError::BadState);

    let c = draw_unique_card(game)?;
    game.dealer_cards.push(c);

    let dt = hand_total(&game.dealer_cards);
    if dt > 21 {
        game.status = Status::Settled;
    } else {
        game.status = Status::PlayerTurn;
    }

    Ok(())
}

pub fn dealer_stand(ctx: Context<DealerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::DealerTurn, BlackjackError::BadState);

    game.dealer_stood = true;

    if game.player_stood {
        game.status = Status::Settled;
    } else {
        game.status = Status::PlayerTurn;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct DealerAct<'info> {
    #[account(
        seeds = [TABLE_SEED],
        bump,
    )]
    pub table: Account<'info, Table>,

    #[account(mut)]
    pub game: Account<'info, Game>,
}
