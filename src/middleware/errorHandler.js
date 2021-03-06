const { StatusCodes } = require('http-status-codes');
const mongoose = require('mongoose');

const logger = require('../logger');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  logger.error(`${err.message} ${err.stack}`);
  if (err.status) {
    res.status(err.status);
  } else if (err instanceof mongoose.Error.ValidationError) {
    res.status(StatusCodes.BAD_REQUEST);
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
  res.json(err);
};
