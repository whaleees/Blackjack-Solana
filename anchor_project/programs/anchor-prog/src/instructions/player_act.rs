use crate::errors::BlackjackError;
use crate::logic::*;
use crate::states::*;
use anchor_lang::prelude::*;

pub fn player_hit(ctx: Context<PlayerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::PlayerTurn, BlackjackError::BadState);

    let c = draw_unique_card(game)?;
    game.player_cards.push(c);

    let pt = hand_total(&game.player_cards);
    if pt > 21 {
        game.status = Status::Settled;
    } else {
        game.status = Status::DealerTurn;
    }

    Ok(())
}

pub fn player_stand(ctx: Context<PlayerAct>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    require!(game.status == Status::PlayerTurn, BlackjackError::BadState);
    game.player_stood = true;

    if game.dealer_stood {
        game.status = Status::Settled;
    } else {
        game.status = Status::DealerTurn;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct PlayerAct<'info> {
    /// CHECK: only compared to game.player
    pub player: UncheckedAccount<'info>,

    #[account(
        seeds = [TABLE_SEED],
        bump, 
    )]
    pub table: Account<'info, Table>,

    #[account(mut)]
    pub game: Account<'info, Game>,
}
