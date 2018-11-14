const LOCAL = (process.argv[2] === "local");
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const Web3 = require('web3');
const axios = require('axios');

let httpServer;

let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/metamask'));
let webhookUrl = 'https://api.kittybattles.io/webhook/eth';

let transactions = [];

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

app.all('/transaction', async function (req, res) {

  let transactionHash = req.body.transactionHash;

  if (transactionHash) {

    transactions.push(transactionHash);

    res.send(JSON.stringify({
      success: true
    }));
  } else {
    res.send(JSON.stringify({
      success: false
    }));
  }
});

if (LOCAL === false) {

  const credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/dna.cryptokittydata.info/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/dna.cryptokittydata.info/fullchain.pem')
  };

  httpServer = https.createServer(credentials, app);


} else {
  httpServer = http.createServer(app);
}

//Process Transaction Hashes
setInterval( () => {
  transactions = transactions.filter(async(txHash) => {
    let tx = await web3.eth.getTransaction(txHash);

    /**
     * tx
     * {
    "hash": "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
    "nonce": 2,
    "blockHash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
    "blockNumber": 3,
    "transactionIndex": 0,
    "from": "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b",
    "to": "0x6295ee1b4f6dd65047762f924ecd367c17eabf8f",
    "value": '123450000000000000',
    "gas": 314159,
    "gasPrice": '2000000000000',
    "input": "0x57cb2fc4"
}
     */
    //Value is in wei; we need it in eth
    tx.value = web3.utils.fromWei(tx.value);


    if (tx.blockNumber && tx.blockNumber > 0) {
            let response = await axios.post(webhookUrl, tx);

      if (response) {
        return false;
      }
    }

    return true;
  });
}, 1000 * 60); // 1000 ms * 60 seconds => 1 minute

console.log("Listening on port 3100");
httpServer.listen(3100);