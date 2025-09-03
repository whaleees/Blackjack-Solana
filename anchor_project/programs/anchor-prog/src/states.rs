use anchor_lang::prelude::*;

pub const TABLE_SEED: &[u8] = b"table_state2";
pub const VAULT_SEED: &[u8] = b"vault2";
pub const RNG_BYTES: usize = 32;

pub const MAX_CARDS: usize = 12;

#[account]
#[derive(InitSpace)]
pub struct Table {
    pub authority: Pubkey,
    pub vault: Pubkey,
    pub table_bump: u8,
    pub vault_bump: u8,
}

#[account]
pub struct Game {
    pub table: Pubkey,
    pub player: Pubkey,
    pub bet_amount: u64,
    pub status: Status,
    pub used_mask: u64,
    pub rng: [u8; RNG_BYTES],
    pub rng_cursor: u8,
    pub player_cards: Vec<u8>,
    pub dealer_cards: Vec<u8>,
    pub player_stood: bool,
    pub dealer_stood: bool,
}

impl Game {
    pub const DISCM: usize = 8;
    pub const FIXED: usize = 32 + 32 + 8 + 1 + 8 + RNG_BYTES + 1;
    pub const VEC_PLAYER: usize = 4 + MAX_CARDS;
    pub const VEC_DEALER: usize = 4 + MAX_CARDS;
    pub const SPACE: usize = Self::DISCM + Self::FIXED + Self::VEC_PLAYER + Self::VEC_DEALER + 2;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    AwaitingRandomness,
    PlayerTurn,
    DealerTurn,
    Settled,
    Closed,
    PlayerWin,
    DealerWin,
    Push,
}
