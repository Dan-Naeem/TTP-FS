const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fetch = require('node-fetch');

// url for IEX API
const url = 'https://api.iextrading.com/1.0/tops?symbols=';

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
        // fetch data
        fetch(url+tickerSymbol)
          .then(res => res.json())
          .then(body => {
            console.log(body)
            // if body is an empty array []
            if(body.length === 0){
              // ticker symbol error, redirect
              res.redirect('/dashboard');
            }
            // else is valid tickerSymbol
            else {
              // ticker symbol does exist
              //check to see if stock already exists
              let exists = false;
              user.stocks.forEach(function(item, index) {
                // if match
                if( item.tickerSymbol === tickerSymbol) {
                  // update stock, raise flag
                  user.stocks[index].numberOfShares += numberOfShares;
                  exists = true;
                }
              });//end forEach()
              // if new stock entry, update users stock profile (push)
              if(exists === false) {
                // create a stock object, push
                let newStock = {
                  tickerSymbol: tickerSymbol,
                  numberOfShares: numberOfShares,
                }
                user.stocks.push(newStock);
              }
              // save updated users profile
              user.save()
                .then(user => {
                  res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
            }// end else if valid tickerSymbol
          })// end fetch.then().then()
          .catch(err => console.log(err));
      }// end if user exists
      else {
        console.log('user doesnt exist')
      }
    })//end user.findOne().then()
    .catch(err => console.log(err));
});

module.exports = router;