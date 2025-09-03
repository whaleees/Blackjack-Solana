use crate::errors::BlackjackError;
use crate::states::*;
use anchor_lang::prelude::*;

const DECK_SIZE: u8 = 52;

fn next_byte(game: &mut Game) -> u8 {
    let i = game.rng_cursor as usize % RNG_BYTES;
    let b = game.rng[i];
    game.rng_cursor = game.rng_cursor.wrapping_add(1);
    b
}

pub fn draw_unique_card(game: &mut Game) -> Result<u8> {
    for _ in 0..200 {
        let card = next_byte(game) % DECK_SIZE;
        let bit = 1u64 << (card as u64);
        if game.used_mask & bit == 0 {
            game.used_mask |= bit;
            return Ok(card);
        }
    }
    Err(BlackjackError::DeckExhausted.into())
}

fn card_value(idx: u8) -> u8 {
    let r = (idx % 13) + 1;
    match r {
        1 => 11,
        11 | 12 | 13 => 10,
        _ => r,
    }
}

pub fn hand_total(hand: &Vec<u8>) -> u8 {
    let mut total: i32 = 0;
    let mut aces = 0;
    for &c in hand {
        if (c % 13) + 1 == 1 {
            aces += 1;
        }
        total += card_value(c) as i32;
    }
    while total > 21 && aces > 0 {
        total -= 10;
        aces -= 1;
    }
    total as u8
}

pub fn dealer_should_hit(dealer: &Vec<u8>) -> bool {
    let total = hand_total(dealer);
    let has_ace = dealer.iter().any(|&c| (c % 13) + 1 == 1);
    let soft17 = has_ace && total == 17;
    total < 17 || soft17
}

pub fn is_blackjack(hand: &Vec<u8>) -> bool {
    hand.len() == 2 && hand_total(hand) == 21
}

pub fn compute_payout(player: &Vec<u8>, dealer: &Vec<u8>, bet: u64) -> u64 {
    let pt = hand_total(player);
    let dt = hand_total(dealer);

    if pt > 21 {
        Status::PlayerWin;
        return 0;
    }
    if dt > 21 {
        Status::DealerWin;
        return bet * 2;
    }

    let p_bj = is_blackjack(player);
    let d_bj = is_blackjack(dealer);
    if p_bj && !d_bj {
        Status::PlayerWin;
        return bet + bet * 3 / 2;
    }
    if d_bj && !p_bj {
        Status::DealerWin;
        return 0;
    }

    if pt > dt {
        Status::PlayerWin;
        bet * 2
    } else if pt < dt {
        Status::DealerWin;
        0
    } else {
        bet
    }
}
