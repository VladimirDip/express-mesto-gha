const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const NotFound = require('../errors/notFoundErrors');
const Conflicted = require('../errors/confictErrors');
const BadRequest = require('../errors/badRequestErrors');

const { JWT_KEY = 'my-secret-key' } = process.env;

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash,
      name: req.body.name,
      about: req.body.about,
      avatar: req.body.avatar,
    }))
    .then((user) => res.status(201).send({
      data: {
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,

      },
    }))
    .catch((e) => {
      if (e.code === 11000) {
        next(new Conflicted('Такой пользователь уже существует'));
      } else if (e.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании пользователя'));
      } else {
        next(e);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        JWT_KEY,
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: (7 * 24 * 60 * 60),
          httpOnly: true,
          sameSite: true,
        })
        .send({ token })
        .end();
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ users });
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(() => {
      throw new NotFound(`Пользователь c id: ${userId} не найден`);
    })
    .then((user) => {
      res.send({
        _id: user.id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequest('Передан некорректный id пользователя'));
      } else if (err.name === 'NotFoundError') {
        next(new NotFound(`Пользователь c id: ${userId} не найден`));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      throw new NotFound('Пользователь по указанному _id не найден');
    })
    .then((user) => {
      res.send({ user });
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequest('Запрашиваемый пользователь не найден'));
      } else {
        next(e);
      }
    });
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFound('Пользователь с указанным _id не найден');
    })
    .then((user) => {
      res.send({ user });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении профиля'));
      } else {
        next(e);
      }
    });
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  )
    .orFail(() => {
      throw new NotFound('Пользователь с указанным _id не найден');
    })
    .then((user) => {
      res.send({ user });
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при обновлении аватара'));
      } else {
        next(e);
      }
    });
};

const signout = (_, res) => {
  res.clearCookie('jwt').send({ message: 'Выход' });
};

module.exports = {
  getUsers,
  getUserById,
  getCurrentUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  signout,
};
