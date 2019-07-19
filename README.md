# Fullstack Assesment - TTP

## Stage 2

---

### Assignment Objectve

Implement a web based stock portfolio app using the IEX API.

#### Complete the Following User Stories

1. As a user I want to create a new account with my name, email, and password.
    - default cash balance: \$5000.00 USD
    - a user can register once with any given email

2. As a user I want to authenticate via email and password so that I can acess my account.

3. As a user I want to buy shares of stock at its current price by specifying its ticker symbol and number of shares so that I can invest.
    - A user can only buy whole number quantity of shares
    - A user can only buy shares if they have enough cash in their account for a given purchase
    - A user can only buy shares if the ticker symbol is valid

4. As a user I want to view a list of all transactoins I've made to date (trades) so that I can perform an audit.

5. As a user I want to view a list of all the stocks I own along with thier current values so that I can review performance.
    - Current value should be based on the latest price and quantity owned for a given stock.

6. As a user I'd like to see the font color of stock symbols and current prices in my portfolio change dynamically to indicate performance.
    - Display red when the current price is less than the day's open price
    - Display grey when the current price is equal to the day's open price
    - Display green when the current price is greater than the day's open price

> For more information, please see INFORMATION.md
