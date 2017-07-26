'use strict';

//libs
const debug = require('debug')('stress');
const Bitcoin = require('./bitcoin');
const { log, filter, sip } = require('./libs');

//default params
require('dotenv').load();
const bcreg = process.env.bcreg || "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
const fee = process.env.fee ||  0.00000001; // 1 satoshi
const quantity = process.env.quantity || 1;
const logFile = process.env.logFile || "listOfhashHexTransaction.log";

console.log("parameters:");
console.log("bcreg-> " + bcreg);
console.log("fee-> " + fee);
console.log("quantity-> " + quantity);
console.log("logFile-> " + logFile);
console.log("---");

//creating new object
const btc = new Bitcoin(bcreg, fee);


// parte di pulizia:
// prendi tutti gli UTXOs uguali e più piccoli della fee e li raggruppo in una tx e poi faccio generate 1
//cleaning
const cleaning = async () =>
{
    try
    {   
        console.log("start cleaning ..")
        const allUTXOs = await btc.getUTXOs("all");
        if(allUTXOs == null) { return null; }
        console.log("allUTXOs: " + allUTXOs.length);
        const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < 0.01} );
        console.log("filteredUTXOs: " + filteredUTXOs.length);
        for (const elem of sip(filteredUTXOs, 500))
        {
            console.log("elem: " + elem.length);
            await btc.gcssTx(elem, 1);
        }
    }
    catch(err)
    {
        console.log("Error from cleaning: " + err);
    }
}

//elaborate
const elaborate = async (quantity) =>
{
    try
    {
        console.log("starting elaborate..")
        const utxos = await btc.getUTXOs("all");
        if(utxos == null) { return null; }
        const filteredUTXOs = utxos;
        //const filteredUTXOs = filter(utxos, (utxo) => { return utxo.amount == 50} );
        if(!filteredUTXOs)
        {
            console.log("no UTXO found with 50 BTC");
            return;
        }
        console.log("filteredUTXOs: " + filteredUTXOs.length);
        for(const utxo of filteredUTXOs)
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
        console.log("Error from elaborate: " + err);
    }
}

//execution
const execution = async () =>
{
    try
    {
        await cleaning();
        await elaborate(quantity);
    }
    catch(err)
    {
        console.log("Error from execution: " + err);
    }
}

execution();