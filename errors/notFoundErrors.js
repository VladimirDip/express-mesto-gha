const { NOT_FOUND_CODE } = require('./statusCode');

class NotFound extends Error {
  constructor() {
    super();
    this.name = this.constructor.name;
    this.status = NOT_FOUND_CODE;
  }
}

module.exports = NotFound;
