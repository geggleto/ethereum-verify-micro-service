# Ethereum Micro-Service


### `/verify`
This end-point deconstructs the data from `web3.personal.sign` and verifies the signature hash matches the signing address

Request
```json
{
  "address": "0x....",
  "signature": "...",
  "message":  web3.toHex("HelloWorld"),
  "original_message": "HelloWord"
}
```

Response:
```json
{
  "verified" : true
}
```

### `/transaction`
This end-point accepts a ETH transaction hash for mainnet and once a minute checks to see if the transaction has been confirmed.
Once it is confirmed it will send the Transaction Payload to a web-hook for processing.

Request
```json
{
  "transactionHash" : "...."
}
```