# Hangman Game Engine

[![Build Status](https://travis-ci.org/guytepper/hangman-game-engine.svg?branch=master)](https://travis-ci.org/guytepper/hangman-game-engine)
[![Coverage Status](https://coveralls.io/repos/github/guytepper/hangman-game-engine/badge.svg?branch=master)](https://coveralls.io/github/guytepper/hangman-game-engine?branch=master)

> A JavaScript hangman game engine.

## Installation

```
npm install hangman-game-engine
```

Alternatively, you can use yarn.

```
yarn add hangman-game-engine
```

## Usage

You can start a new game by initalizing a new `Game` instance and pass a word to it.

```
import Game from 'hangman-game-engine';

const game = new Game('Wow');
game.guess('w');
game.guess('o');
game.status; // 'WON'
```

## Game object properties

| Property         | Type     | Description                                                                                          | Example                          |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| `word`           | `string` | The word that's being played.                                                                        | `Baby`                           |
| `hiddenWord`     | `array`  | The word represented by an array. The characters are displayed by a conceal character until guessed. | `['_', 'a', '_', '_'`            |
| `guessedLetters` | `array`  | Array of all the guessed letters.                                                                    | `['a', 'c']`                     |
| `failedLetters`  | `array`  | Array of all the failed guessed letters.                                                             | `['c']`                          |
| `totalGuesses`   | `number` | Total guesses count.                                                                                 | `2`                              |
| `failedGuesses`  | `number` | Failed guesses count.                                                                                | `1`                              |
| `status`         | `string` | The current game status.                                                                             | `'IN_PROGRESS' / 'WON' / 'LOST'` |

## API

### `new Game(word, [config])`

Starts a new game.

#### Parameters

| Parameter | Type     | Description                  | Required / Optional |
| --------- | -------- | ---------------------------- | ------------------- |
| `word`    | `string` | The word to use in the game. | Required            |
| `config`  | `object` | Game config object           | Optional            |

#### Config properites

| Parameter          | Type     | Description                                      | Default |
| ------------------ | -------- | ------------------------------------------------ | ------- |
| `concealCharacter` | `string` | The character to show in the `hiddenWord` array. | `'_'`   |
| `maxAttempt`       | `number` | The max number of failed guesses allowed.        | `4`     |

#### Returns

`Object` - A new [game instance](#game-object-properties).

#### Example

```
import Game from 'hangman-game-engine';

const awesomeGame = new Game('awesome');
const speicalGame= new Game('speical', {
  concealCharacter: '*',
  maxAttempt: 6
});
```

### `Game.guess(char)`

Performs a game guess.

#### Parameters

| Parameter | Type     | Description            | Required / Optional |
| --------- | -------- | ---------------------- | ------------------- |
| `char`    | `string` | The guessed character. | Required            |

#### Returns

`Object` - The current [game object](#game-object-properties).

#### Example

```
const game = new Game('Roll');
game.guess('r');
game.guess('o');
game.guess('b');
game.guessedLetters; // ['r', 'o', 'b']
game.failedGuesses // 1
game.hiddenWord // ['R', 'o', '_', '_']
```

### `Game.revealHiddenWord()`

Reveals the game's hidden word.

#### Returns

`Object` - The current [game object](#game-object-properties).

#### Example

```
const game = new Game('Baby');
game.hiddenWord; // ['_', '_', '_', '_']
game.revealHiddenWord();
game.hiddenWord; //['B', 'a', 'b', 'y']
```
