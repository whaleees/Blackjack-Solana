use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod logic;
pub mod states;

use instructions::*;
use states::*;

declare_id!("GeQy8RRD1WqPPAT2nrK7zgxfuq3BkDteL86kMWqHU4T5");

#[program]
pub mod anchor_prog {
    use super::*;

    pub fn table_create(ctx: Context<CreateTable>) -> Result<()> {
        create_table(ctx)
    }

    pub fn new_bet(ctx: Context<NewGame>, bet_amount: u64) -> Result<()> {
        new_game(ctx, bet_amount)
    }

    pub fn hit_player(ctx: Context<PlayerAct>) -> Result<()> {
        player_hit(ctx)
    }

    pub fn stand_player(ctx: Context<PlayerAct>) -> Result<()> {
        player_stand(ctx)
    }

    pub fn random_card(ctx: Context<DevFulfill>, randomness: [u8; RNG_BYTES]) -> Result<()> {
        dev_fulfill(ctx, randomness)
    }

    pub fn end(ctx: Context<Settle>) -> Result<()> {
        settle(ctx)
    }

    pub fn hit_dealer(ctx: Context<DealerAct>) -> Result<()> {
        dealer_hit(ctx)
    }

    pub fn stand_dealer(ctx: Context<DealerAct>) -> Result<()> {
        dealer_stand(ctx)
    }
}
