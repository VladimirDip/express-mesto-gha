const mongoose = require('mongoose');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');

const routes = require('./routes');
const serverError = require('./middlewares/serverError');

const app = express();
const { PORT = 3000 } = process.env;

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useUnifiedTopology: true,
});

app.use(routes);
app.use(errors());
app.use(serverError);

app.listen(PORT);
