const Utils = require('./Utils');

const DEFAULT_CONFIG = {
  concealCharacter: '_',
  maxAttempt: 4
};

/**
 * Starts a new game.
 * @param {string} word - The word to play the game with.
 * @param {Object} [config] - The game config.
 * @returns {Object} The game object.
 */
function Game(word, config) {
  this.word = word;
  this.config = Object.assign({}, DEFAULT_CONFIG, config);
  // The hidden characters array, e.g. ['_', '_', '_', '_'] for 'Baby'.
  this.hiddenWord = Utils.createConcealArr(word, this.config.concealCharacter);
  // The characters array, e.g. ['B', 'a', 'b', 'y'] for 'Baby'.
  this.charactersMap = [...word];
  // Same as charactersMap, but characters are uppercased (for easing guess checking).
  this.uppercaseMap = [...word].map(c => c.toUpperCase());
  this.guessedLetters = [];
  this.failedLetters = [];
  this.failedGuesses = 0;
  this.status = 'IN_PROGRESS';

  // Use the guessedLetters array length to count the total guesses.
  Object.defineProperty(this, 'totalGuesses', {
    get: function() {
      return this.guessedLetters.length;
    }
  });

  return this;
}

/**
 * Performs a game guess.
 * @param {string} char - The guessed character.
 * @returns {Object} The game object.
 */
Game.prototype.guess = function guess(char) {
  if (this.status !== 'IN_PROGRESS') {
    return this;
  }

  const guessedLetters = [...this.guessedLetters];
  // Check if the guessed letter had been guessed already.
  if (!guessedLetters.includes(char)) {
    // Add the gueesed letter to the guessed letters array.
    this.guessedLetters = [...this.guessedLetters, char];

    // Check indexes of the guessed letter in the letters array.
    const indexes = Utils.getAllIndexes(this.uppercaseMap, char.toUpperCase());
    if (indexes.length > 0) {
      // Reveal the letters in the hidden characters array.
      this.hiddenWord = Utils.changeArrayItems(this.hiddenWord, this.charactersMap, indexes);
    } else {
      this.failedLetters.push(char);
      this.failedGuesses += 1;
    }
  }

  if (this.config.maxAttempt === this.failedGuesses) {
    this.status = 'LOST';
  }

  if (this.hiddenWord.indexOf('_') === -1) {
    this.status = 'WON';
  }

  return this;
};

/**
 * Reveals the game's hidden word.
 */
Game.prototype.revealHiddenWord = function revealHiddenWord() {
  this.hiddenWord = this.charactersMap;
  return this;
};

module.exports = Game;
