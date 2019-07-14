const express = require('express');
const router = express.Router();

//Login Page
router.get('/login', (req, res) => res.send('Welcome to the login page'));

//Register Page
router.get('/register', (req, res) => res.send('Welcome to the register page'));

module.exports = router;