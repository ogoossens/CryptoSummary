# CryptoSummary!
A node.js project for checking the value of your investments in cryptocurrencies

Hosted on Heroku under : http://cryptosummary.herokuapp.com

![Alt text](http://cryptosummary.herokuapp.com/screenshot.png)

The idea was - as a cryptocurrency investor I always had to log in to my traders account to see my winnings / losses / development on my investments and I tought - that's unnecessary.

So I build a node.js app that takes in URL parameters about your open positions - checks and compares the values when you bought it and the current ones and outputs a total summary so you know where unstand 

# URL BUILDing - build once, save as bookmark forever and check instantly anytime
Use the builder on the homepage :) but the system is easy to understand

# Sample URL
http://cryptosummary.herokuapp.com/?1=XRPEUR*10000*0.19&2=LTCEUR*15*38&3=XBTEUR*1.5*2000

# Important
Check landing page for all relevant info

# Few side notes
* Actually your coins can be stored anywhere, your wallet or traders wallet - does not matter :-)

* You can use any exchange - Im just pulling the current values from Kraken API so there might be some differences to your trader


This is more or less just an calculator to see the pro- or regress of the value of coins you bought

# Security
Thats the neat point, Im woking with public Coinmarketcap API and the only thing you specify is : HOW MUCH of WHAT did you buy AT WHICH PRICE and non of that info is considered "dangerous" in my opinion
