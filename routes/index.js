const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const fetch = require('node-fetch');

// url for IEX API ->  provides last sale price, size, and time
const url = 'https://api.iextrading.com/1.0/tops/last?symbols=';

/* 
  Unfortunately, IEX api for official price isnt working
    >> 'https://api.iextrading.com/1.0/deep/official-price?symbols='
  as such, I am using the standard /tops api call to get 
  the ask price and use that as a reference for determining performance
*/
// url for IEX API -> check last sale price
const askPrice = 'https://api.iextrading.com/1.0/tops?symbols=';

// User model
const User = require('../models/User');

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  // store ask price for all owned stock
  let askPriceArr = [];
  // construct string of all owned stocks
  let stockNames = '';
  req.user.stocks.forEach(function(stock) {
    stockNames += stock.tickerSymbol + ','
  });
  console.log(stockNames);
  // fetch stock data
  fetch(askPrice+stockNames)
    .then(res => res.json())
    .then(data => {
      // if data exists (required for new accounts)
      if (data && data.length > 0) {
        // store last sale price data for each owned stock
        data.forEach((stock) => {
          askPriceArr.push({
            tickerSymbol: stock.symbol,
            lastSalePrice: stock.lastSalePrice,
            askPrice: stock.askPrice,
          });
        });
      }
    })
    .then(() => {
      console.log('then render dash');
      console.log(askPriceArr);
      res.render('dashboard', {
        user: req.user,
        askPriceArr: askPriceArr,
      })
    })
    .catch(err => console.log(err));
    //res.render('dashboard', {user: req.user})
});

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
  console.log(req.body)
  // capture values
  const email = req.user.email;
  const tickerSymbol = (req.body.tickerSymbol).toUpperCase();
  const numberOfShares = Number(req.body.numberOfShares);
  // input validation
  // tickerSymbol: empty string
  if(tickerSymbol === '') {
    req.flash('error_msg', 'Invalid Ticker Symbol: EMPTY STRING');
    res.redirect('/dashboard/search');
  }
  // numberOfShares: zero or negative
  else if (numberOfShares < 1) {
    req.flash('error_msg', 'Number of Shares should be 1 or more');
    res.redirect('/dashboard/search');
  }
  // numberOfShares: not an integer
  else if(!Number.isInteger(numberOfShares)) {
    req.flash('error_msg', 'Number of Shares should be an integer');
    res.redirect('/dashboard/search');
  }
  // else inputs pass validation
  else {
    User.findOne({ email: email })
      .then(user => {
        // if users exists (it should)
        if(user) {
          // fetch data
          fetch(url+tickerSymbol)
            .then(res => res.json())
            .then(body => {
              console.log('ticker', tickerSymbol)
              console.log('fetch', body)
              // if body is an empty array []
              if(body.length === 0){
                // ticker symbol error, redirect
                req.flash('error_msg', `Invalid Ticker Symbol: ${tickerSymbol} NOT RECOGNIZED`);
                res.redirect('/dashboard/search');
              }
              // else is valid tickerSymbol
              else {
                // check funds
                let cost = Number(body[0].price);
                cost *= numberOfShares;
                // user info
                console.log('user info')
                console.log('available cash', user.cash )
                console.log('cost of shares', cost)
                // if insufficient, dont complete transaction
                if ( cost > user.cash){
                  req.flash('error_msg', 'Insufficient Funds');
                  res.redirect('/dashboard/search');
                }
                // else sufficient, begin transaction
                else {
                  // update available cash
                  user.cash -= cost;
                  //check to see if stock already exists
                  let exists = false;
                  user.stocks.forEach(function(item, index) {
                    // if match
                    if( item.tickerSymbol === tickerSymbol) {
                      // update user.stocks, raise flag
                      user.stocks[index].numberOfShares += numberOfShares;
                      exists = true;
                    }
                  });//end forEach()
                  // if new stock entry (flag not raised)
                  if(exists === false) {
                    // create a stock object, push 
                    let newStock = {
                      tickerSymbol: tickerSymbol,
                      numberOfShares: numberOfShares,
                    }
                    user.stocks.push(newStock);
                  }
                  // add transactions
                  user.listOfTransactions.push({
                    transaction:'buy',
                    tickerSymbol: tickerSymbol,
                    numberOfShares: numberOfShares,
                    price: body[0].price,
                  })
                  // save updated users profile
                  user.save()
                    .then(user => {
                      // successful purchase of shares
                      req.flash('success_msg', 'Shares successfully bought');
                      res.redirect('/dashboard');
                    })
                    .catch(err => console.log(err));
                }// end sufficient funds
              }// end else if valid tickerSymbol
            })// end fetch.then().then()
            .catch(err => console.log(err));
        }// end if user exists
        else console.log('user doesnt exist')
      })//end user.findOne().then()
      .catch(err => console.log(err));
  }
});

module.exports = router;