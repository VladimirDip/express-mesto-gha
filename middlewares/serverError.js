const error = (err, _, res, next) => {
  const { status = 500, message } = err;
  console.log(message, status);
  res.status(status).send({
    message: status === 500 ? 'Ошибка сервера' : message,
  });

  next();
};

module.exports = error;
