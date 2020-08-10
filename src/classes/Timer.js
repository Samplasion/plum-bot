// @ts-nocheck

module.exports = class Timer {
    /**
     * Creates a new Timer with support for more than (2^32)/2-1 milliseconds.
     * @param {Date | string | number} execTime A valid identifier for when to call `callback`
     * @param {() => unknown} callback The function to call when the Timer is over.
     * @param {Object} options The options for this Timer
     * @param {boolean} options.repeat Whether to start the timer again
     */
    constructor(execTime, callback, {
        repeat = false
    } = {
        repeat: false
    }) {
        if(!(execTime instanceof Date)) {
            execTime = new Date(execTime);
        }
    
        this._execTime = execTime;
        this.callback = callback;

        this._timeout = null;

        this._repeat = repeat;
    
        this.init();
    }

    /**
     * Initialize and start timer
     */
    init() {
        this.checkTimer();
    }

    /**
     * Get the time of the callback execution should happen
     */
    get execTime() {
        return this._execTime;
    }

    /**
     * Checks the current time with the execute time and executes callback accordingly
     */
    checkTimer() {
        clearTimeout(this._timeout);

        var now = new Date();
        var ms = this.execTime.getTime() - now.getTime();

        /**
         * Check if timer has expired
         */
        if(ms <= 0) {
            this.callback(this);

            return false;
        }

        /**
         * Check if ms is more than one day, then revered to one day
         */
        var max = (86400 * 1000);
        if(ms > max) {
            ms = max;
        }

        /**
         * Otherwise set timeout
         */
        this._timeout = setTimeout(function(self) {
            self.checkTimer();
        }, ms, this);
    }

    /**
     * Stops the timeout
     */
    stopTimer() {
        clearTimeout(this._timeout);
    }
}