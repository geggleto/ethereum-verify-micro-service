//Scan the blockchain for new Transactions on the KB Address.
//block height - 6699844
//address - 0x977f457d775b099cffb4803e6e7243019c2f1430

const axios = require('axios');
const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/metamask'));

let blockNumber = 6700178;

//Process Transaction Hashes

async function thing() {
  console.log("Looking at block: " + blockNumber );
  let transactions = [];

  let currentBlock = await web3.eth.getBlockNumber();

  //Wait for 8 confirms
  if (blockNumber <= currentBlock - 8) {

    let results = await web3.eth.getBlock(blockNumber, true);

    if (results) {

      Object.values(results.transactions).forEach((tx) => {
        if (tx && tx.to) {
          if (tx.to.toLowerCase() === '0x977f457d775b099cffb4803e6e7243019c2f1430'.toLowerCase()) {
            transactions.push(tx);
          }
        }
      });

      blockNumber++;

      Object.values(transactions).forEach( async (tx) => {
        tx.value = web3.utils.fromWei(tx.value, 'ether');
        let result = await axios.post('https://api.kittybattles.io/webhook/eth/incoming', tx);
      });

    }
  }
}

setInterval(thing, 1000);
