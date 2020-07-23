// @ts-ignore
const { GuildMember } = require("discord.js");

/**
 * Represents the game state.
 * @readonly
 * @enum {number}
 */
const Connect4State = Object.freeze({
    AWAITING_USER: 0,
    READY: 1,
    P1_WIN: 2,
    P2_WIN: 3,
    DRAW: 4,
});

/**
 * Represents the player moving.
 * @readonly
 * @enum {number}
 */
const Connect4Player = Object.freeze({
    RED: 0,
    YELLOW: 1
});

/**
 * Represents a slot's state.
 * @readonly
 * @enum {number}
 */
const Connect4Slot = Object.freeze({
    EMPTY: 0,
    RED: 1,
    YELLOW: 2
});

const numbers = [
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
    "🔟"
]

/**
 * Checks if `array` has `length` equal elements in a row.
 * @template T
 * @param {T[]} array The array we're checking equal elements of.
 * @param {number} length The number of elements that must be equal for the function to return a value.
 * @returns {T?} The element that appears `length` times, if any.
 * @see https://stackoverflow.com/a/43308873/9665725
 */
function check(array, length) {
    var count = 0,
        value = array[0];

    let equal = array.some(function (a) {
        if (value !== a) {
            count = 0;
            value = a;
        }
        return ++count === length;
    });

    if (equal)
        return value;
    
    return null;
}

class Connect4 {

    /**
     * Creates a new game
     * 
     * @param {GuildMember} user1 The user who started the game. Has the red dots.
     * @param {GuildMember} user2 The user who accepted the game. Has the yellow dots.
     * @param {Object} options Sets some options for the game
     * @param {number} [options.width] Sets the width of the grid. Must be ≥ 4
     * @param {number} [options.height] Sets the height of the grid. Must be ≥ 4
     * @param {string} [options.empty] Sets the character that'll be shown in place
     * of an empty slot. 
     * @param {string} [options.red] Sets the character that'll be shown in place
     * of a red slot.
     * @param {string} [options.yellow] Sets the character that'll be shown in place
     * of a yellow slot.
     */
    constructor(
        user1,
        user2,
        {
            width = 7,
            height = 6,
            empty = "⬜️",
            red = "🔴",
            yellow = "🟡",
        } = {}
    ) {
        if (!(user1 instanceof GuildMember)) {
            throw new TypeError("user1 must be an instance of GuildMember");
        }
        if (!(user2 instanceof GuildMember)) {
            throw new TypeError("user2 must be an instance of GuildMember");
        }

        if (width < 4 || width > 10)
            throw new RangeError("width must be a number between 4 and 10.");
        if (height < 4 || height > 10)
            throw new RangeError("height must be a number between 4 and 10.");

        /**
         * The two players of the game.
         */
        this.players = {
            red: user1,
            yellow: user2
        };

        /**
         * The size of the grid.
         */
        this.size = Object.freeze({
            width, height
        });

        /**
         * Any additional options of the game.
         */
        this.options = Object.freeze({
            empty,
            red,
            yellow
        });

        /**
         * The time the game was started.
         */
        this.startingTime = Date.now();

        /**
         * @type {Connect4Player?}
         */
        this.lastPlayer = null;

        // Generate an empty grid
        /** 
         * The grid for the game;
         * @type {number[][]}
         */
        this._grid = new Array(width);
        for (let i = 0; i < width; i++) {
            this._grid[i] = new Array(height);
            for (let j = 0; j < height; j++) {
                this._grid[i][j] = Connect4Slot.EMPTY;
            }
        }
    }

    /**
     * Makes a move on behalf of `player`.
     * @param {Connect4Player} player 
     * @param {number} column 
     */
    move(player, column) {
        if (this.state != Connect4State.READY) {
            throw new Error("Attempting to play on a finished board.");
        }
        if (player === this.lastPlayer) {
            throw new Error(`Player ${player == Connect4Player.RED ? "RED" : "YELLOW"} can't play twice.`);
        }
        if (column >= this.size.width || column < 0) {
            throw new RangeError(`The column must be a number between 0 and ${this.size.width - 1}.`);
        }

        this.lastPlayer = player;

        // After this, i is either -1 or the index of the lowest empty row.
        let i = -1;
        while (this._grid[column][i+1] === Connect4Slot.EMPTY) {
            i++;
        }

        if (i == -1) {
            throw new Error("The column is full.");
        }

        this._grid[column][i] = player == Connect4Player.RED ? Connect4Slot.RED : Connect4Slot.YELLOW;

        return this.state;
    }

    /** A pretty string representation of the game grid. */
    get grid() {
        let grid = "";
        for (let row = 0; row < this.size.height; row++) {
            for (let column = 0; column < this.size.width; column++) {
              let cell = this.options.empty;
              if (this._grid[column][row] == Connect4Slot.RED)
                  cell = this.options.red;
              if (this._grid[column][row] == Connect4Slot.YELLOW)
                  cell = this.options.yellow;
              grid += cell;
            }
            grid += "\n";
        }
        for (let i = 0; i < this.size.width; i++) {
            grid += numbers[i];
        }
        return grid.trim();
    }

    get _flat() {
        return this._grid.flat();
    }

    /** The ID of the game based on user IDs and server ID. */
    get id() {
        return `${this.players.red.id}-${this.players.yellow.id}-${this.players.red.guild.id}`;
    }

    /**
     * Checks that 4 slots in a row are equal
     * @param {number} row The row to check
     * @param {number} stcol The starting column from which to check the slots
     */
    checkLine(row, stcol) {
        let empty = Connect4Slot.EMPTY;
        return this._grid[stcol][row] != empty 
            && this._grid[stcol][row] == this._grid[stcol+1][row]
            && this._grid[stcol+1][row] == this._grid[stcol+2][row]
            && this._grid[stcol+2][row] == this._grid[stcol+3][row]
            && stcol <= this.size.width - 3;
    }

    /**
     * Checks that 4 slots in a diagonal line like `\` are equal
     * @param {number} strow The starting row from which to check the slots
     * @param {number} stcol The starting column from which to check the slots
     */
    checkTopLeftToBottomRight(strow, stcol) {
        let rowValid = strow < this.size.height - 3;
        let colValid = stcol < this.size.width - 3;

        console.log(strow, stcol, this._grid, strow + 3, stcol + 3, this._grid[stcol+3]);

        return colValid && rowValid
            && this._grid[stcol][strow] != Connect4Slot.EMPTY 
            && this._grid[stcol][strow] == this._grid[stcol+1][strow+1]
            && this._grid[stcol+1][strow+1] == this._grid[stcol+2][strow+2]
            && this._grid[stcol+2][strow+2] == this._grid[stcol+3][strow+3];
    }

    /**
     * Checks that 4 slots in a diagonal line like `/` are equal
     * @param {number} strow The starting row from which to check the slots
     * @param {number} stcol The starting column from which to check the slots
     */
    checkTopRightToBottomLeft(strow, stcol) {
        let rowValid = strow < this.size.height - 3;
        let colValid = stcol < this.size.width - 3;

        return colValid && rowValid
            && this._grid[stcol+3][strow] != Connect4Slot.EMPTY 
            && this._grid[stcol+3][strow] == this._grid[stcol+2][strow+1]
            && this._grid[stcol+2][strow+1] == this._grid[stcol+1][strow+2]
            && this._grid[stcol+1][strow+2] == this._grid[stcol][strow+3];
    }

    /**
     * Returns the state of the game.
     * @returns {Connect4State} The state of the game.
     */
    get state() {
        if (this._grid.every(arr => arr.every(slot => slot == Connect4Slot.EMPTY)))
            return Connect4State.READY;
        
        if (this._flat.filter(slot => slot != Connect4Slot.EMPTY).length < 7)
            return Connect4State.READY;
        
        for (let i = 0; i < this.size.width; i++) {
            // Check vertically
            let ch = check(this._grid[i], 4);
            if (ch != null && ch != Connect4Slot.EMPTY) {
                return ch == Connect4Slot.RED ? Connect4State.P1_WIN : Connect4State.P2_WIN;
            }

            // Check horizontally
            for (let j = 0; j < this.size.height; j++) {
                if (i > 4)
                    continue;
                if (this.checkLine(j, i)) {
                    return this._grid[i][j] == Connect4Slot.RED ? Connect4State.P1_WIN : Connect4State.P2_WIN;
                }
                if (this.checkTopLeftToBottomRight(j, i)) {
                    return this._grid[i][j] == Connect4Slot.RED ? Connect4State.P1_WIN : Connect4State.P2_WIN;
                }
                if (i == 4) continue; 
                if (this.checkTopRightToBottomLeft(j, i)) {
                    return this._grid[i][j+3] == Connect4Slot.RED ? Connect4State.P1_WIN : Connect4State.P2_WIN;
                }
            }
        }

        if (!this._flat.some(slot => slot == Connect4Slot.EMPTY))
            return Connect4State.DRAW;

        return Connect4State.READY;
    }
  
    /**
     * Returns a pretty representation of a state.
     * @static
     * @param {Connect4State} state The state to prettify.
     * @returns {string} The pretty state.
     */
    static prettyState(state) {
        switch (state) {
            case 0: return "Awaiting player 2";
            case 1: return "Game in progress";
            case 2: return "Red won";
            case 3: return "Yellow won";
            case 4: return "Draw";
        }
        return "Invalid state.";
    }
}

module.exports = {
    Connect4,
    Connect4Player,
    Connect4Slot,
    Connect4State
}