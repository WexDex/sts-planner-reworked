// Quick Reference: Game Helper Functions
// Import from '@/app/utils/gameHelpers'

// ============ FILE OPERATIONS ============

// Load from external JSON file (public/combatData.json mirrors app/data/EliteSlavers.json)
await loadFromFile('/combatData.json');

// Save to browser localStorage
saveToLocalStorage('game_save', gameState);

// Load from browser localStorage
const saved = loadFromLocalStorage('game_save');

// Export as JSON string
const json = exportGameData(gameState);

// Import from JSON string
const imported = importGameData(jsonString);

// Download as JSON file to computer
downloadGameData(gameState, 'my-combat.json');

// ============ PLAYER HEALTH ============

// Reduce health
const newPlayer = takeDamage(player, 10);

// Increase health (capped at maxHp)
const newPlayer = healPlayer(player, 5);

// Apply damage modifiers (vulnerable/weak)
const newPlayer = applyDamageWithModifiers(
  player,
  20,      // base damage
  true,    // is vulnerable?
  false    // is weak?
);

// Reset player to full health
const newPlayer = resetPlayerHealth(player);

// ============ MODIFIER CALCULATIONS ============

// Apply vulnerable (1.75x damage)
const damage = applyVulnerable(20, player.modifiers);

// Apply weak (0.75x damage)
const damage = applyWeak(20, player.modifiers);

// ============ DECK MANAGEMENT ============

// Calculate total damage from specific card type
const damage = calculateDamageByType(deck, 'Strike');

// Get all cards with a keyword
const strikes = getCardsByType(deck, 'Strike');

// Add card to deck
const newDeck = addCardToDeck(deck, newCard);

// Remove card by index
const newDeck = removeCardFromDeck(deck, 0);

// ============ RELIC MANAGEMENT ============

// Add relic
const newPlayer = addRelic(player, {
  name: 'My Relic',
  description: 'Does something cool'
});

// Remove relic by name
const newPlayer = removeRelic(player, 'Lantern');

// Get relic by name
const relic = getRelic(player, 'Lantern');

// ============ ENERGY ============

// Set energy
const newPlayer = setEnergy(player, 5);

// Get total energy for a turn (including bonuses)
const energy = getTotalInitialEnergy(player, 1);

// ============ UTILITIES ============

// Deep clone game data
const clone = cloneGameData(gameState);

// Get game statistics
const stats = getGameStats(gameState);
// Returns: {
//   totalDamageInDeck: number,
//   totalBlockInDeck: number,
//   totalRelics: number,
//   deckSize: number,
//   hpPercent: number
// }
