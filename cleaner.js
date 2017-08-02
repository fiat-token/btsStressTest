'use strict';

//libs
const debug = require('debug')('cleaner');
const Bitcoin = require('./bitcoin');
const { log, filter, sip, checkArg, loading } = require('./libs');

//default params
require('dotenv').load();

const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFileCleaner, "cleaner.log");
const cleaning = checkArg(process.env.cleaning, true);
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const elaborateThreshold = checkArg(process.env.elaborateThreshold, 50);
const dimBlock = checkArg(process.env.dimBlock, 250);

class Cleaner
{
    constructor(bcreg, fee, logFile, cleanerThreshold, dimBlock)
    {
        this.btc = new Bitcoin(bcreg, fee);
        this.logFile = logFile;
        this.cleanerThreshold = cleanerThreshold;
        this.dimBlock = dimBlock;

        console.log("\nCleaner parameters:");
        console.log("bcreg= " + bcreg);
        console.log("fee= " + fee);
        console.log("logFile= " + logFile);
        console.log("Threshold for cleaner= " + cleanerThreshold);
        console.log("Block dimension= " + dimBlock);
        console.log("");
    }

    async clean()
    {
        try
        {
            console.log("Start cleaning...")
            const allUTXOs = await this.btc.getUTXOs("all");
            console.log("all UTXOs: " + allUTXOs.length);
            if(allUTXOs == null || allUTXOs == 0) { return null; }
            const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < cleanerThreshold } );
            console.log("number of UTXOs under the threshold amount of " + cleanerThreshold + ": " + filteredUTXOs.length);
            const blocks = Math.floor(filteredUTXOs.length / dimBlock);
            let index = 0;
            for (const elem of sip(filteredUTXOs, dimBlock))
            {
                const mempool = await this.btc.getMemPoolInfo();
                loading("mempoolsize: " + mempool.size + " - " + index++ + "/" + blocks + " blocks cleaning...");
                await this.btc.gcssTx(elem, 1);
            }
        }
        catch(err)
        {
            console.log("Error from clean: " + err);
        }
        finally
        {
            console.log("");
        }
    }
}

//main
const main = async () =>
{
    try
    {
        const cleaner = new Cleaner(bcreg, fee, logFile, cleanerThreshold, dimBlock);
        await cleaner.clean();
    }
    catch(err)
    {
        console.log("Error from main: " + err);
    }
}

main();

module.exports = Cleaner;