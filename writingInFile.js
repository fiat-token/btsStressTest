'use strict';

//libs
const debug = require('debug')('btcStressTest:server');
const Bitcoin = require('./bitcoin');
const { log } = require('./libs');

//default params
const bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
const fee = 0.001;
const numberOfTransactions = process.argv[2] || 1;
const file = "listOfhashHexTransaction.txt";

//main
const main = async () =>
{
    try
    {
        //creating new object
        const btc = new Bitcoin(bcreg, fee);

        //creating an address destination
        const destionationAddress = await btc.generateNewAddress();

        const utxos = await btc.getUTXOs("all");
        for(const utxo of utxos)
        {
            const hashHexTransaction = await cssTx(destionationAddress, utxo);
            log(file, hashHexTransaction);
        }
    }
    catch(err)
    {
        console.log("ERROR: " + err);
    }
}

//execution
main();

//FINAL
//const hashBlock = await btc.generate();

//functions

//create-sign-send transaction
const cssTx = async (destionationAddress, utxo) =>
{
    const rawTransaction = await btc.createRawTransaction(utxo, destionationAddress);
    const signedTransaction = await btc.signTransaction(rawTransaction);
    const hashHexTransaction = await btc.sendTransaction(signedTransaction);
    return hashHexTransaction;
}