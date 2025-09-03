use anchor_lang::prelude::*;

#[error_code]
pub enum BlackjackError {
    #[msg("Invalid bet amount")]
    InvalidBet,
    #[msg("Bad game state for this action")]
    BadState,
    #[msg("Vault has insufficient lamports")]
    VaultInsufficient,
    #[msg("Unauthorized VRF callback")]
    UnauthorizedVrf,
    #[msg("Deck exhausted")]
    DeckExhausted,
    #[msg("Randomness exhausted")]
    RngExhausted,
    #[msg("Deck ran out of cards")]
    DeckEmpty,
    #[msg("Not player")]
    NotPlayer,
}
