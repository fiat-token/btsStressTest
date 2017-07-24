'use strict';

//libs
const debug = require('debug')('stress1');
const Bitcoin = require('./bitcoin');
const { log } = require('./libs');

//default params
require('dotenv').load();
const bcreg = process.env.bcreg || "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
const fee = process.env.fee ||  0.1; // it's a percentage!!
const quantity = process.env.quantity || 1;
const logFile = process.env.logFile || "listOfhashHexTransaction.log";

//creating new object
const btc = new Bitcoin(bcreg, fee);

//main
const main = async (quantity) =>
{
    try
    {
        //creating an address destination
        const destinationAddresses = await btc.generateNewAddress(quantity);

        const utxos = await btc.getUTXOs("all");
        for(const utxo of utxos)
        {
            const hashHexTransaction = await cssTx(destinationAddresses, utxo);
            //log(logFile, hashHexTransaction);
        }
    }
    catch(err)
    {
        console.log("Error from main: " + err);
    }
}

//execution
main(quantity);

//FINAL
//const hashBlock = await btc.generate();

//functions

//create-sign-send transaction
const cssTx = async (destinationAddresses, utxo) =>
{
    const rawTransaction = await btc.createRawTransaction(utxo, destinationAddresses);
    const signedTransaction = await btc.signTransaction(rawTransaction);
    const hashHexTransaction = await btc.sendTransaction(signedTransaction);
    return hashHexTransaction;
}