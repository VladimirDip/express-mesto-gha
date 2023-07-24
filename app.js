const mongoose = require('mongoose');
const express = require('express');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const STATUS_CODE = require('./errors/errorCodes');

const app = express();

const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64bd85fa70a050ab4c5ff7e6',
  };

  next();
});
app.use(express.json());

app.use('/', userRouter);
app.use('/', cardRouter);
app.use('*', (req, res) => {
  res.status(STATUS_CODE.notFound).send({
    message: 'Страница не найдена',
  });
});

app.listen(PORT);
