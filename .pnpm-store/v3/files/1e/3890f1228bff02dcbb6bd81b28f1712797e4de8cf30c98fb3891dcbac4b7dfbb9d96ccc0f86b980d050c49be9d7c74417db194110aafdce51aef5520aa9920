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
function createConcealArr(word, concealChar = '_') {
  const hiddenArray = [...word].map(letter => {
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
  return array.reduce((indexes, item, index) => {
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
  const newArr = [...arr];
  indexes.forEach(index => (newArr[index] = arrayToSwap[index]));
  return newArr;
}

module.exports = { isAlphabetical, createConcealArr, getAllIndexes, changeArrayItems };
