'use strict';

//libs
const debug = require('debug')('stress');
const Bitcoin = require('./bitcoin');
const { log, filter, sip, checkArg, loading } = require('./libs');

//default params
require('dotenv').load();

const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFile, "listOfhashHexTransaction.log");
const cleaning = checkArg(process.env.cleaning, true);
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const elaborateThreshold = checkArg(process.env.elaborateThreshold, 50);
const dimBlock = checkArg(process.env.dimBlock, 250);


console.log("\nParameters:");
console.log("bcreg-> " + bcreg);
console.log("fee-> " + fee);
console.log("quantity-> " + quantity);
console.log("logFile-> " + logFile);
console.log("cleaning-> " + cleaning);
console.log("Threshold for cleaner->" + cleanerThreshold);
console.log("Threshold for elaborate-> " + elaborateThreshold);
console.log("Block dimension-> " + dimBlock);
console.log("");

//creating new object
const btc = new Bitcoin(bcreg, fee);


const cleaner = async (cleanerThreshold) =>
{
    try
    {  
        if(!cleaning) return;
        console.log("Start cleaning...")
        const allUTXOs = await btc.getUTXOs("all");
        console.log("all UTXOs: " + allUTXOs.length);
        if(allUTXOs == null || allUTXOs == 0) { return null; }
        const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < cleanerThreshold } );
        console.log("number of UTXOs under the threshold amount of " + cleanerThreshold + ": " + filteredUTXOs.length);

        const blocks = Math.floor(filteredUTXOs.length / dimBlock);
        let index = 0;
        for (const elem of sip(filteredUTXOs, dimBlock))
        {
            const mempool = await btc.getMemPoolInfo();
            loading("mempoolsize: " + mempool.size + " - " + index++ + "/" + blocks + " blocks cleaning...");
            await btc.gcssTx(elem, 1);
        }
    }
    catch(err)
    {
        console.log("Error from cleaner: " + err);
    }
    finally
    {
        console.log("");
    }
}

//elaborate
const elaborate = async (quantity, elaborateThreshold) =>
{
    try
    {
        console.log("\nStart elaborating...")
        const allUTXOs = await btc.getUTXOs("all");
        console.log("all UTXOs: " + allUTXOs.length);
        if(allUTXOs == null || allUTXOs == 0) { return null; }
        //const filteredUTXOs = allUTXOs;
        const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount >= elaborateThreshold} ); // BUG
        if(!filteredUTXOs)
        {
            console.log("no UTXO found with 50 BTC");
            return;
        }
        console.log("number of UTXOs over the threshold amount of " + elaborateThreshold + ": " + filteredUTXOs.length);
        for(let i in filteredUTXOs)
        {
            const hashHexTransaction = await btc.gcssTx(filteredUTXOs[i], quantity);
            const mempool = await btc.getMemPoolInfo();
            loading("mempoolsize: " + mempool.size + " - " +  ++i + "/" +  filteredUTXOs.length + " - hashHexTransaction: " + hashHexTransaction);
        }
        //const hashBlock = await btc.generate(1);
    }
    catch(err)
    {
        console.log("Error from elaborate: " + err);
    }
    finally
    {
        console.log("");
    }
}

const mining = async() =>
{
    getMemPoolInfo();
    generateTime();
}

//execution
const execution = async () =>
{
    try
    {
        await cleaner(cleanerThreshold);
        await elaborate(quantity, elaborateThreshold);
    }
    catch(err)
    {
        console.log("Error from execution: " + err);
    }
}

execution();