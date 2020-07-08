const Utils = require('../src/Utils');

it('Checks if a string is alphabetical', () => {
  expect(Utils.isAlphabetical('a')).toBe(true);
  expect(Utils.isAlphabetical('-')).toBe(false);
  expect(Utils.isAlphabetical('&')).toBe(false);
});

it('Creates an array of conceal characters', () => {
  const word = 'baby!';
  const concealArr = Utils.createConcealArr('baby!');
  const expectedArr = ['_', '_', '_', '_', '!'];

  expect(concealArr).toEqual(expectedArr);
});

it('Finds all indexes of an element in array', () => {
  const array = ['B', 'A', 'B', 'Y'];
  const item = 'B';
  indexes = Utils.getAllIndexes(array, item);
  expect(indexes).toEqual([0, 2]);
});

it('Changes array items', () => {
  const array = ['_', '_', '_', '_'];
  const arrayToSwap = ['B', 'a', 'b', 'y'];
  const expectedArray = ['B', '_', 'b', '_'];
  const indexes = [0, 2];
  const newArray = Utils.changeArrayItems(array, arrayToSwap, indexes);
  expect(newArray).toEqual(expectedArray);
});
