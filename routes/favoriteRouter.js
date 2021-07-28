const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');


const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.status = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
      Favorites.findOne({user: req.user._id})
      .then((fav) => {
          if (fav) {
              for(var i=0; i<req.body.length; i++) {
                  if (fav.dishes.indexOf(req.body[i]._id) === -1) {
                      fav.dishes.push(req.body[i]._id);
                  }
              }
              fav.save()
              .then((fav) => {
                  console.log('favorite ', fav);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(fav);
              }, (err) => next(err));
          }
          else {
              fav.create({"user": req.user._id, "dishes": req.body})
              .then((fav) => {
                  console.log('Favorite Created ', favorite);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(fav);
              }, (err) => next(err));
          }
      }, (err) => next(err))
      .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav) {
            if (fav.dishes.indexOf(req.params.dishId) === -1) {
                fav.dishes.push(req.params.dishId);
            }
            fav.save()
            .then((fav) => {
                console.log('Favorite Created ', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
        }
        else {
            Favorites.create({"user": req.user._id, "dishes": req.params.dishId})
            .then((fav) => {
                console.log('Favorite Created ', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
              }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((fav) => {
        if (fav) {
            index = fav.dishes.indexOf(req.params.dishId)
            if (index !== -1) {
                fav.dishes.splice(index, 1);
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            fav.save()
            .then((fav) => {
                console.log('Favorite Deleted ', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err));
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

module.exports = favoriteRouter;
