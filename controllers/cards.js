const Card = require('../models/card');
const NotFound = require('../errors/notFoundErrors');
const BadRequest = require('../errors/badRequestErrors');
const Forbidden = require('../errors/forbiddenErrors');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((e) => {
      if (e.name === 'ValidationError') {
        next(new BadRequest('Переданы некорректные данные при создании карточки'));
      } else {
        next(e);
      }
    });
};

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send({ cards });
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFound('Карточка с указанным _id не найдена');
    })
    .then((card) => {
      const owner = card.owner.toString();
      if (req.user._id === owner) {
        Card.deleteOne(card)
          .then(() => {
            res.send({ card });
          });
      } else {
        throw new Forbidden('Невозможно удалить карточку');
      }
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные удаления'));
      } else {
        next(e);
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Передан несуществующий _id карточки');
    })
    .then((card) => {
      res.send({ card });
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для постановки лайка'));
      } else {
        next(e);
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Передан несуществующий _id карточки');
    })
    .then((card) => {
      res.send({ card });
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        next(new BadRequest('Переданы некорректные данные для снятия лайка'));
      } else {
        next(e);
      }
    });
};

module.exports = {
  createCard,
  getCards,
  deleteCard,
  likeCard,
  dislikeCard,
};
