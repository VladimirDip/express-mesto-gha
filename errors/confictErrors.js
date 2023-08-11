const { CONFLICT_ERROR } = require('./statusCode');

class Conflicted extends Error {
  constructor(message) {
    super(message);
    this.status = CONFLICT_ERROR;
  }
}

module.exports = Conflicted;
