'use strict';

//libs
const debug = require('debug')('stress');
const Bitcoin = require('./bitcoin');
const { log, filter } = require('./libs');

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


// parte di pulizia:
// prendi tutti gli UTXOs uguali e più piccoli della fee e li raggruppo in una tx e poi faccio generate 1
//cleaning
const cleaning = async () =>
{
    try
    {
        const allUTXOs = await btc.getUTXOs("all");
        if(allUTXOs == null) { return null; }
        const filteredUTXOs = filter(UTXOs, (utxo) => { return utxo.amount < 0.01} );
        await btc.gcssTx(filteredUTXOs, 1);
    }
    catch(err)
    {
        console.log("Error from cleaning: " + err);
    }
}

//main
const main = async (quantity) =>
{
    try
    {
        const utxos = await btc.getUTXOs("all");
        if(utxos == null) { return null; }

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
cleaning();
//main(quantity);
//functions