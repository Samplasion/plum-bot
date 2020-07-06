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
    P2_WIN: 3
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
     * @param {number} [options.width ] Sets the width of the grid. Must be ≥ 4
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
            height = 5,
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
         * @type {Connect4Player?}
         */
        this.lastPlayer = null;

        // Generate an empty grid
        /** 
         * The grid for the game;
         * @type {number?[][]}
         */
        this._grid = new Array(width);
        for (let i = 0; i < width; i++) {
            this._grid[i] = new Array(height).map(() => Connect4Slot.EMPTY);
        }
    }

    /**
     * Makes a move on behalf of `player`.
     * @param {Connect4Player} player 
     * @param {number} column 
     */
    move(player, column) {
        if (player === this.lastPlayer) {
            throw new Error(`Player ${player + 1} can't play twice.`);
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
    }

    /** A pretty string representation of the game grid. */
    get grid() {
        return this._grid.map(col => {
            return col.map(slot => {
                return slot === Connect4Slot.RED ? this.options.red : this.options.yellow;
            }).join("");
        }).join("");
    }

    /** The ID of the game based on user IDs and server ID. */
    get id() {
        return `${this.players.red.id}-${this.players.yellow.id}-${this.players.red.guild.id}`;
    }

    /**
     * Returns the state of the game.
     * @returns {Connect4State} The state of the game.
     */
    get state() {
        if (this._grid.every(arr => arr.every(slot => slot == Connect4Slot.EMPTY)))
            return Connect4State.READY;
        
        // Check vertically
        for (let i = 1; i < this.size.width; i++) {
            let ch = check(this._grid[i], 4);
            if (ch != null) {
                return ch == Connect4Slot.RED ? Connect4State.P1_WIN : Connect4State.P2_WIN;
            }
        }

        // It's over... for now

        return Connect4State.READY;
    }
}