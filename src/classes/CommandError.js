module.exports = class CommandError extends Error {
  constructor(er, message) {
    super(er.message);
    this.ogError = er;
    this.msg = message;
    this.name = 'CommandError';
  }
}