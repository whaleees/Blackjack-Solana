use crate::errors::BlackjackError;
use crate::logic::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn dealer_hit(ctx: Context<DealerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::DealerTurn, BlackjackError::BadState);

    let c = draw_unique_card(game)?;
    game.dealer_cards.push(c);

    if dealer_should_hit(&game.dealer_cards) {
        game.status = Status::DealerTurn;
    } else {
        game.status = Status::Settled;
    }

    Ok(())
}

pub fn dealer_stand(ctx: Context<DealerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::DealerTurn, BlackjackError::BadState);

    game.dealer_stood = true;

    game.status = Status::Settled;

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
