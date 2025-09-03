/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_prog.json`.
 */
export type AnchorProg = {
  "address": "9wSigVj1e2gXUL2SCYv59PLDibscoCaJaWjKwTfczpa7",
  "metadata": {
    "name": "anchorProg",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "end",
      "discriminator": [
        180,
        160,
        249,
        217,
        194,
        121,
        70,
        16
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true
        },
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "hitDealer",
      "discriminator": [
        31,
        91,
        237,
        68,
        207,
        15,
        79,
        67
      ],
      "accounts": [
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "hitPlayer",
      "discriminator": [
        44,
        35,
        248,
        121,
        39,
        232,
        170,
        8
      ],
      "accounts": [
        {
          "name": "player"
        },
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "newBet",
      "discriminator": [
        136,
        206,
        155,
        213,
        156,
        37,
        176,
        88
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "table",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "and seeds/bump are asserted. It’s only used to hold/send lamports."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "randomCard",
      "discriminator": [
        92,
        237,
        0,
        42,
        36,
        43,
        207,
        85
      ],
      "accounts": [
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "standDealer",
      "discriminator": [
        10,
        11,
        69,
        105,
        61,
        126,
        113,
        58
      ],
      "accounts": [
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "standPlayer",
      "discriminator": [
        141,
        17,
        11,
        174,
        183,
        224,
        237,
        110
      ],
      "accounts": [
        {
          "name": "player"
        },
        {
          "name": "table",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "game",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "tableCreate",
      "discriminator": [
        13,
        164,
        90,
        150,
        6,
        91,
        173,
        129
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "table",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  98,
                  108,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "Safety: seeds and bump are enforced by Anchor; `owner = system_program::ID` ensures",
            "it is a System Account; `space = 0` means no data to deserialize."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  50
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "discriminator": [
        27,
        90,
        166,
        125,
        74,
        100,
        121,
        18
      ]
    },
    {
      "name": "table",
      "discriminator": [
        34,
        100,
        138,
        97,
        236,
        129,
        230,
        112
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidBet",
      "msg": "Invalid bet amount"
    },
    {
      "code": 6001,
      "name": "badState",
      "msg": "Bad game state for this action"
    },
    {
      "code": 6002,
      "name": "vaultInsufficient",
      "msg": "Vault has insufficient lamports"
    },
    {
      "code": 6003,
      "name": "unauthorizedVrf",
      "msg": "Unauthorized VRF callback"
    },
    {
      "code": 6004,
      "name": "deckExhausted",
      "msg": "Deck exhausted"
    },
    {
      "code": 6005,
      "name": "rngExhausted",
      "msg": "Randomness exhausted"
    },
    {
      "code": 6006,
      "name": "deckEmpty",
      "msg": "Deck ran out of cards"
    },
    {
      "code": 6007,
      "name": "notPlayer",
      "msg": "Not player"
    }
  ],
  "types": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "table",
            "type": "pubkey"
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "status"
              }
            }
          },
          {
            "name": "usedMask",
            "type": "u64"
          },
          {
            "name": "rng",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "rngCursor",
            "type": "u8"
          },
          {
            "name": "playerCards",
            "type": "bytes"
          },
          {
            "name": "dealerCards",
            "type": "bytes"
          },
          {
            "name": "playerStood",
            "type": "bool"
          },
          {
            "name": "dealerStood",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "status",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "awaitingRandomness"
          },
          {
            "name": "playerTurn"
          },
          {
            "name": "dealerTurn"
          },
          {
            "name": "settled"
          },
          {
            "name": "closed"
          },
          {
            "name": "playerWin"
          },
          {
            "name": "dealerWin"
          },
          {
            "name": "push"
          }
        ]
      }
    },
    {
      "name": "table",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "tableBump",
            "type": "u8"
          },
          {
            "name": "vaultBump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
