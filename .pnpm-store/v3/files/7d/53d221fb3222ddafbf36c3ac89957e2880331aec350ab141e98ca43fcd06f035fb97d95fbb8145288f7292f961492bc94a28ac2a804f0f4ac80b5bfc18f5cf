'use strict';

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/**
 * Checks if a string is an alphabetical character.
 * @param {string} str - The string to check if it's alphabetical.
 * @returns {bool} Whether the string is alphabetical or not.
 */
function isAlphabetical(str) {
  if (str.match(/[a-z]/i)) {
    return true;
  }
  return false;
}

/**
 * Creates an array of conceal characters instead of the word letters.
 * @param {string} word - The word to create the conceal array from.
 * @param {string} cocnealChar - The conceal character to swap the word's letter with.
 * @returns {array} The conceal word array.
 */
function createConcealArr(word) {
  var concealChar = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '_';

  var hiddenArray = [].concat(toConsumableArray(word)).map(function (letter) {
    if (isAlphabetical(letter)) {
      return concealChar;
    }
    // In case the character is non-alphabetical (such as '!'),
    // use it instead of hiding it.
    return letter;
  });

  return hiddenArray;
}

/**
 * Returns the occurrences of an element in an array.
 * @param {array} array - The array to find the item's occurrences for.
 * @param {} item - The item to find it's occurrences in the array.
 * @returns {array} - Array of the item's occurences in the provided array.
 */
function getAllIndexes(array, itemToFind) {
  return array.reduce(function (indexes, item, index) {
    if (item === itemToFind) {
      indexes.push(index);
    }
    return indexes;
  }, []);
}

/**
 * Swap the provided array indexes to the respective indexes in another array.
 * TODO: Find a better method name?
 * @param {array} array - The array to modify it's items.
 * @param {array} arrayToSwap - The array to swap items with.
 * @param {array} indexes - The indexes to swap.
 * @returns {array} A new array with the modified items.
 */
function changeArrayItems(arr, arrayToSwap, indexes) {
  var newArr = [].concat(toConsumableArray(arr));
  indexes.forEach(function (index) {
    return newArr[index] = arrayToSwap[index];
  });
  return newArr;
}

var Utils = { isAlphabetical: isAlphabetical, createConcealArr: createConcealArr, getAllIndexes: getAllIndexes, changeArrayItems: changeArrayItems };

var DEFAULT_CONFIG = {
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
  this.charactersMap = [].concat(toConsumableArray(word));
  // Same as charactersMap, but characters are uppercased (for easing guess checking).
  this.uppercaseMap = [].concat(toConsumableArray(word)).map(function (c) {
    return c.toUpperCase();
  });
  this.guessedLetters = [];
  this.failedLetters = [];
  this.failedGuesses = 0;
  this.status = 'IN_PROGRESS';

  // Use the guessedLetters array length to count the total guesses.
  Object.defineProperty(this, 'totalGuesses', {
    get: function get$$1() {
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

  var guessedLetters = [].concat(toConsumableArray(this.guessedLetters));
  // Check if the guessed letter had been guessed already.
  if (!guessedLetters.includes(char)) {
    // Add the gueesed letter to the guessed letters array.
    this.guessedLetters = [].concat(toConsumableArray(this.guessedLetters), [char]);

    // Check indexes of the guessed letter in the letters array.
    var indexes = Utils.getAllIndexes(this.uppercaseMap, char.toUpperCase());
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

var Game_1 = Game;

module.exports = Game_1;
