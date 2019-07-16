const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// User model
const User = require('../models/User');

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
  res.render('dashboard', {
    user: req.user
  }));

// Portfolio
router.get('/dashboard/portfolio', ensureAuthenticated, (req, res) =>
  res.render('portfolio', {
    user: req.user
  }));

// Search
router.get('/dashboard/search', ensureAuthenticated, (req, res) =>
  res.render('search', {
    user: req.user
  }));

  // Search - post
router.post('/dashboard/search', ensureAuthenticated, (req, res) => {
  const email = req.user.email;
  const tickerSymbol = req.body.tickerSymbol;
  const numberOfShares = Number(req.body.numberOfShares);
  User.findOne({ email: email })
    .then(user => {
      // if users exists (it should)
      if(user) {
        // create a stock object
        let newStock = {
          tickerSymbol: tickerSymbol,
          numberOfShares: numberOfShares,
        }
        //check to see if stock already exists
        let exists = false;
        user.stocks.forEach(function(item, index) {
          // if match
          if( item.tickerSymbol === tickerSymbol) {
            console.log(user.stocks[index]);
            console.log(newStock);
            // update stock, raise flag
            user.stocks[index].numberOfShares += numberOfShares;
            exists = true;
          }
        });
        // if new stock entry, update users stock profile (push)
        if(exists === false) {
          user.stocks.push(newStock);
        }
        // save updated users profile
        user.save()
          .then(user => {
            res.redirect('/dashboard');
          })
          .catch(err => console.log(err));
      }
      else {
        console.log('user doesnt exist')
      }
    })
    .catch(err => console.log(err));
});

module.exports = router;