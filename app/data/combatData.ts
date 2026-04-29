import { CombatData } from '@/app/types/gameTypes';

export const combatData: CombatData = {
  player: {
    hp: 30,
    maxHp: 68,
    characters: 'ironclad',
    energy: {
      base: 3,
      turn1Bonus: 1,
    },
    combatType: 'Elite',
    combatName: 'Slavers',
    floor: 23,
    drawPerTurn: 5,
    modifiers: {
      vulnerableMultiplier: 1.75,
      weakMultiplier: 0.75,
    },
    relics: [
      {
        name: 'Lantern',
        description: 'Gain 1 energy on Turn 1',
      },
      {
        name: 'Strike Dummy',
        description: "All Cards containing 'Strike' on the name gain +3 damage",
      },
      {
        name: 'Paper Phrog',
        description: 'Vulnerable enemies take 75% damage from attacks instead of 50%',
      },
      {
        name: 'Captains Wheel',
        description: 'Turn 3 gain 18 block',
      },
      {
        name: 'Incense Burner',
        description: 'Turn 5 gain 1 intangible',
      },
    ],
    relicEffects: [
      {
        turn: 1,
        effect: 'Gain 1 Energy',
      },
      {
        turn: 3,
        effect: 'Gain 18 Block',
      },
      {
        turn: 5,
        effect: 'Gain 1 Intangible',
      },
    ],
  },
  deck: [
  {
    "card_ID": "Carnage",
    "isUpgraded": true
  },
  {
    "card_ID": "Wild Strike"
  },
  {
    "card_ID": "Corruption"
  },
  {
    "card_ID": "Evolve"
  },
  {
    "card_ID": "Ascender's Bane"
  },
  {
    "card_ID": "Strike",
    "isUpgraded": true
  },
  {
    "card_ID": "Ghostly Armor"
  },
  {
    "card_ID": "Defend",
    "isUpgraded": true
  },
  {
    "card_ID": "Shrug It Off"
  },
  {
    "card_ID": "Defend",
    "isUpgraded": true
  },
  {
    "card_ID": "Bash",
    "isUpgraded": true
  },
  {
    "card_ID": "Havoc"
  },
  {
    "card_ID": "Strike",
    "isUpgraded": true
  },
  {
    "card_ID": "Defend",
    "isUpgraded": true
  },
  {
    "card_ID": "Strike",
    "isUpgraded": true
  },
  {
    "card_ID": "Wound"
  },
  {
    "card_ID": "Pommel Strike"
  },
  {
    "card_ID": "Defend",
    "isUpgraded": true
  },
  {
    "card_ID": "Strike",
    "isUpgraded": true
  },
  {
    "card_ID": "Armaments",
    "isUpgraded": true
  },
  {
    "card_ID": "Dark Embrace"
  },
  {
    "card_ID": "Pommel Strike"
  },
  {
    "card_ID": "Bloodletting"
  },
  {
    "card_ID": "Strike",
    "isUpgraded": true
  },
  {
    "card_ID": "Feel No Pain"
  }
],
  potions: [
    {
      name: 'Brutality',
      type: 'Potion',
      cost: {
        base: 0,
      },
      takeDamage: {
        base: 1,
      },
      draw: {
        base: 1,
      },
      description: 'Gain +1 draw each turn. Lose 1 HP. Upgraded: gain Innate.',
      apply: {
        Innate: {
          base: 1,
        },
      },
    },
    {
      name: 'Feel No Pain',
      type: 'Potion',
      cost: {
        base: 0,
      },
      blockOnExhaust: {
        base: 3,
        upgraded: 4,
      },
      description: 'Whenever a card is Exhausted, gain 3 Block. (Cost 0)',
      isUpgraded: false,
    },
    {
      name: 'Juggernaut',
      type: 'Potion',
      cost: {
        base: 2,
      },
      damage: {
        base: 5,
        upgraded: 7,
      },
      description: 'Deal damage equal to 5(7) each time you block.',
      apply: {
        Juggernaut: {
          base: 1,
        },
      },
    },
  ],
  enemies: [
    {
      name: 'Blue Slaver',
      hp: 50,
      maxHp: 50,
      intents: [
        {
          turn: 1,
          actions: [
            {
              type: 'attack',
              value: 8,
            },
            {
              type: 'debuff',
              effect: 'Weak',
              value: 2,
            },
          ],
        },
        {
          turn: 2,
          actions: [
            {
              type: 'attack',
              value: 13,
            },
          ],
        },
        {
          turn: 3,
          actions: [
            {
              type: 'attack',
              value: 8,
            },
            {
              type: 'debuff',
              effect: 'Weak',
              value: 2,
            },
          ],
        },
        {
          turn: 4,
          actions: [
            {
              type: 'attack',
              value: 19,
            },
          ],
        },
      ],
    },
    {
      name: 'Taskmaster',
      hp: 58,
      maxHp: 58,
      intents: [
        {
          turn: 1,
          actions: [
            {
              type: 'attack',
              value: 7,
            },
            {
              type: 'status',
              effect: 'Wound',
              value: 3,
              location: 'hand',
            },
            {
              type: 'buff',
              effect: 'Strength',
              value: 1,
            },
          ],
        },
        {
          turn: 2,
          actions: [
            {
              type: 'attack',
              value: 8,
            },
            {
              type: 'status',
              effect: 'Wound',
              value: 3,
              location: 'hand',
            },
            {
              type: 'buff',
              effect: 'Strength',
              value: 1,
            },
          ],
        },
        {
          turn: 3,
          actions: [
            {
              type: 'attack',
              value: 9,
            },
            {
              type: 'status',
              effect: 'Wound',
              value: 3,
              location: 'hand',
            },
            {
              type: 'buff',
              effect: 'Strength',
              value: 1,
            },
          ],
        },
        {
          turn: 4,
          actions: [
            {
              type: 'attack',
              value: 15,
            },
            {
              type: 'status',
              effect: 'Wound',
              value: 3,
              location: 'hand',
            },
            {
              type: 'buff',
              effect: 'Strength',
              value: 1,
            },
          ],
        },
      ],
    },
    {
      name: 'Red Slaver',
      hp: 51,
      maxHp: 51,
      intents: [
        {
          turn: 1,
          actions: [
            {
              type: 'attack',
              value: 14,
            },
          ],
        },
        {
          turn: 2,
          actions: [
            {
              type: 'debuff',
              effect: 'Entangle',
              description: 'Cannot play attacks next turn',
            },
          ],
        },
        {
          turn: 3,
          actions: [
            {
              type: 'attack',
              value: 9,
            },
            {
              type: 'debuff',
              effect: 'Vulnerable',
              value: 2,
            },
          ],
        },
        {
          turn: 4,
          actions: [
            {
              type: 'attack',
              value: 21,
            },
          ],
        },
      ],
    },
  ],
  draw: [],
  discard: [],
  exhaust: [],
  hand: [],
  playedCards: [],
  activityLog: [],
};
