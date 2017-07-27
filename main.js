'use strict';

//libs
const debug = require('debug')('stress');
const Bitcoin = require('./bitcoin');
const { log, filter, sip, checkArg } = require('./libs');
const readline = require('readline');

//default params
require('dotenv').load();

const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFile, "listOfhashHexTransaction.log");
const cleaning = checkArg(process.env.cleaning, true);
const threshold = checkArg(process.env.threshold, 0.01);


console.log("parameters:");
console.log("bcreg-> " + bcreg);
console.log("fee-> " + fee);
console.log("quantity-> " + quantity);
console.log("logFile-> " + logFile);
console.log("cleaning-> " + cleaning);
console.log("threshold-> " + threshold);
console.log("---");

//creating new object
const btc = new Bitcoin(bcreg, fee);


const cleaner = async (threshold) =>
{
    try
    {  
        if(!cleaning) return;
        console.log("start cleaning ..")
        const allUTXOs = await btc.getUTXOs("all");
        if(allUTXOs == null) return null;
        console.log("allUTXOs: " + allUTXOs.length);
        const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < threshold} );
        console.log("filteredUTXOs: " + filteredUTXOs.length);
        for (const elem of sip(filteredUTXOs, 250))
        {
            console.log(elem.length + "..");
            await btc.gcssTx(elem, 1);
        }
    }
    catch(err)
    {
        console.log("Error from cleaner: " + err);
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
        for(const i in filteredUTXOs)
        {
            const hashHexTransaction = await btc.gcssTx(filteredUTXOs[i], quantity);
            readline.clearLine(process.stdout, 0);  // clear current text
            readline.cursorTo(process.stdout, 0);  // move cursor to beginning of line
            process.stdout.write(i + "/" +  filteredUTXOs.length + " - hashHexTransaction: " + hashHexTransaction);

        }
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
        await cleaner(threshold);
        await elaborate(quantity);
    }
    catch(err)
    {
        console.log("Error from execution: " + err);
    }
}

execution();