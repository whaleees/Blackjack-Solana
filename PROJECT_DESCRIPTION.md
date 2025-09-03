# Blackjack-SOL 🎴

**Deployed Frontend URL:** [https://blackjack-sol-lilac.vercel.app/](https://blackjack-sol-lilac.vercel.app/)  
**Solana Program ID:** `9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7`

---

## Project Overview

### Description
Blackjack-SOL is a decentralized **Blackjack game** built on **Solana** using **Anchor** for the on-chain smart contract and **Next.js** for the frontend.  

Players can connect their Solana wallet, place bets in SOL, and play a fair on-chain game of Blackjack against the dealer. All bets, payouts, and game states are fully managed by the smart contract, ensuring transparency and fairness.

---

### Key Features

- **Wallet Integration**  
  Connect via Phantom or any Solana Wallet Adapter.

- **On-chain Game State**  
  All game data (bets, cards, outcomes) is stored in Solana accounts.

- **Betting & Vault System**  
  Player bets are escrowed in a **Vault PDA**, guaranteeing automatic payouts.

- **Dealer AI**  
  Dealer follows standard Blackjack rules: hits until 17, stands otherwise.

- **Randomness**  
  Cards are drawn using seeded pseudo-randomness.

- **Frontend UI**  
  Built with Next.js + TailwindCSS.  
  - Player cards shown in full.  
  - Dealer shows only one card until their turn (authentic Blackjack behavior).  
  - Payout banner shows net gain/loss after settlement.  

---

### How to Use the dApp

1. **Connect Wallet**  
   Open the site and connect your wallet.  

2. **Start a Game**  
   Enter your bet amount in SOL, then click **Start Game**.  

3. **Player Actions**  
   - **Hit**: Draw another card.  
   - **Stand**: Stop drawing and pass the turn to the dealer.  

4. **Dealer Actions**  
   Dealer reveals their hidden card, hits until 17 or more, then stands.  

5. **Settlement**  
   - Winner is determined by Blackjack rules.  
   - Program transfers payout to the player automatically.  

---

## Program Architecture

### PDA Usage

The program uses **Program Derived Addresses (PDAs)** for deterministic accounts:

- **Table PDA (`table_state2`)**  
  Stores metadata about the table, including authority and vault reference.  

- **Vault PDA (`vault2`)**  
  Escrow account where all bets are held and payouts are made.  

These PDAs ensure deterministic, secure account handling.

---

### Program Instructions

- **`table_create`** → Initializes the table PDA and vault PDA.  
- **`new_bet`** → Starts a new game, transfers bet to the vault.  
- **`random_card` (dev)** → Seeds randomness and deals initial cards.  
- **`hit_player`** → Player draws a new card.  
- **`stand_player`** → Player stands, ending their turn.  
- **`hit_dealer`** → Dealer draws (only valid during `DealerTurn`).  
- **`stand_dealer`** → Dealer stands, moves toward settlement.  
- **`end`** → Settles the game and distributes payouts.  

---

### Account Structure

```rust
#[account]
pub struct Table {
    pub authority: Pubkey,  // casino authority
    pub vault: Pubkey,      // vault PDA holding bets
    pub vault_bump: u8,     // PDA bump
}

#[account]
pub struct Game {
    pub table: Pubkey,          // Table PDA reference
    pub player: Pubkey,         // Player’s wallet
    pub bet_amount: u64,        // Bet in lamports
    pub status: Status,         // Game lifecycle
    pub player_cards: Vec<u8>,  // Player hand
    pub dealer_cards: Vec<u8>,  // Dealer hand
    pub rng: Vec<u8>,           // Random seed
    pub rng_cursor: u8,         // RNG index
    pub used_mask: u64,         // Card usage bitmask
    pub player_stood: bool,     // Did player stand?
    pub dealer_stood: bool,     // Did dealer stand?
}
```

# Testing

## Test Coverage

We designed our tests to cover both **happy paths** (intended user flows) and **unhappy paths** (error conditions) to ensure program correctness and safety.

### Happy Path Tests

- **Create Table**: Initializes the table PDA and vault PDA successfully.  
- **Fund Vault**: Transfers SOL from authority into the vault PDA.  
- **New Bet**: Starts a new game, deducts bet from player, and escrows into vault.  
- **Randomness Fulfillment**: Seeds RNG and deals two cards to both player and dealer.  
- **Player Hit**: Player draws an additional card and game state updates.  
- **Player Stand**: Player stands, passing control to the dealer.  
- **Dealer Hit**: Dealer draws until rules are satisfied (hits until 17).  
- **Dealer Stand**: Dealer stands, moving game state to settlement.  
- **Settlement**: Game closes and payout is transferred from vault to player.  

### Unhappy Path Tests

- **Zero Bet**: Player tries to bet 0 lamports → rejected with `InvalidBet`.  
- **Vault Insufficient**: Game rejected if vault can’t cover potential max payout.  
- **Premature Player Action**: Player hits/stands before randomness fulfillment → rejected.  
- **Late Player Action**: Player attempts to act after game is already settled → rejected.  
- **Dealer Wrong Turn**: Dealer hits/stands outside of `DealerTurn` → rejected.  
- **Premature Settlement**: Settlement called during `PlayerTurn` → rejected.  

---

## Running Tests

Run the full test suite with:

```bash
anchor test
```

### Additional Notes for Evaluators

- This project demonstrates how traditional casino games can be implemented fairly and transparently on-chain.  
- All critical state transitions (bets, card draws, dealer actions, and settlements) are enforced by the Solana smart contract using Anchor.  
- Program Derived Addresses (PDAs) are used for secure state management:
  - **Table PDA**: Holds authority reference and vault link.
  - **Vault PDA**: Escrows SOL used for betting and payouts.  
- The frontend is built with **Next.js 15** and integrates Solana Wallet Adapter for smooth wallet connection.  
- Randomness is mocked for testing using developer-supplied bytes, but could be upgraded to use Switchboard or another verifiable randomness oracle in production.  
- The dealer logic is deterministic and fully transparent (hits until 17, stands otherwise).  
- The UI hides dealer hole cards until the end of the round, mimicking real-world Blackjack gameplay.  
- The full test suite (`anchor test`) covers both happy and unhappy paths to ensure program safety.  
- Deployed frontend: **[https://blackjack-sol-lilac.vercel.app/](https://blackjack-sol-lilac.vercel.app/)**  
- Program ID (Devnet): **9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7**  
