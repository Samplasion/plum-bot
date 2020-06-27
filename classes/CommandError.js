module.exports = class CommandError extends Error {
  constructor(er, message) {
    super(er);
    this.msg = message;
    this.name = 'CommandError';
  }
}