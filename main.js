'use strict';

//libs
const debug = require('debug')('stress');
const Bitcoin = require('./bitcoin');
const { log } = require('./libs');

//default params
require('dotenv').load();
const bcreg = process.env.bcreg || "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
const fee = process.env.fee ||  0.00000001; // 1 satoshi
const quantity = process.env.quantity || 1;
const logFile = process.env.logFile || "listOfhashHexTransaction.log";

debug("parameters:");
debug("bcreg-> " + bcreg);
debug("fee-> " + fee);
debug("quantity-> " + quantity);
debug("logFile-> " + logFile);
debug("---");

//creating new object
const btc = new Bitcoin(bcreg, fee);

//main
const main = async (quantity) =>
{
    try
    {
        const utxos = await btc.getUTXOs("all");
        for(const utxo of utxos)
        {
            await btc.gcssTx(utxo, quantity);
        }
        //faccio lo slice dentro getUTXOs
        //const hashBlock = await btc.generate();
        //creo getmempoolinfo
        //creo generate parametrico
        //metto time dentro generate

    }
    catch(err)
    {
        console.log("Error from main: " + err);
    }
}

//execution
main(quantity);

//functions