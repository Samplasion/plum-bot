const Game = require('../src/Game');

it('Creates a new game', () => {
  const game = new Game('Baby');

  expect(game).toEqual(
    expect.objectContaining({
      word: 'Baby',
      hiddenWord: ['_', '_', '_', '_'],
      charactersMap: ['B', 'a', 'b', 'y'],
      uppercaseMap: ['B', 'A', 'B', 'Y'],
      guessedLetters: [],
      totalGuesses: 0,
      failedGuesses: 0,
      status: 'IN_PROGRESS',
      config: { concealCharacter: '_', maxAttempt: 4 }
    })
  );
});

it('Guesses a character', () => {
  const game = new Game('Baby').guess('a').guess('c');

  expect(game).toEqual(
    expect.objectContaining({
      hiddenWord: ['_', 'a', '_', '_'],
      guessedLetters: ['a', 'c'],
      totalGuesses: 2,
      failedGuesses: 1
    })
  );
});

it('Wins the game', () => {
  const game = new Game('Baby');
  game
    .guess('b')
    .guess('a')
    .guess('y');

  expect(game.status).toEqual('WON');
});

it('Loses the game', () => {
  const game = new Game('Baby');
  game
    .guess('l')
    .guess('o')
    .guess('s')
    .guess('e');

  expect(game.status).toEqual('LOST');
});

it('Stops the game after lose', () => {
  const game = new Game('Baby');
  game
    .guess('l')
    .guess('o')
    .guess('s')
    .guess('e');

  expect(game.status).toEqual('LOST');
});

it('Gets the failing letters', () => {
  const game = new Game('Baby');
  game.guess('l');

  expect(game.failedLetters).toEqual(['l']);
});

it('Reveals the hidden word', () => {
  const game = new Game('Baby');
  expect(game.hiddenWord).toEqual(['_', '_', '_', '_']);
  game.revealHiddenWord();
  expect(game.hiddenWord).toEqual(['B', 'a', 'b', 'y']);
});
