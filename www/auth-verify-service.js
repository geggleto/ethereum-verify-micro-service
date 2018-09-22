const LOCAL = (process.argv[2] === "local");
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const Web3 = require('web3');

let httpServer;

let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/metamask'));


app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello');
});

app.all('/verify', function (req, res) {

  let signatureHex = req.body.signature;
  let address = req.body.address;
  let original_message = req.body.original_message;

  let recoveredAddress = web3.eth.accounts.recover(original_message, signatureHex);

  if (recoveredAddress.toUpperCase() === address.toUpperCase()) { //verified
    res.send(JSON.stringify({
      verified: true
    }));
  } else { //failed
    res.send(JSON.stringify({
      verified: false
    }));
  }

});

if (LOCAL === false) {

  const credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/cryptokittydata.info/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/cryptokittydata.info/fullchain.pem')
  };

  httpServer = https.createServer(credentials, app);


} else {
  httpServer = http.createServer(app);
}

console.log("Listening on port 3100");
httpServer.listen(3100);