'use strict';

//libs
const debug = require('debug')('cleaner');
const Bitcoin = require('./bitcoin');
const { filter, sip, loading } = require('../libs');

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
            const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < this.cleanerThreshold } );
            console.log("number of UTXOs under the threshold amount of " + this.cleanerThreshold + ": " + filteredUTXOs.length);
            const blocks = Math.floor(filteredUTXOs.length / this.dimBlock);
            let index = 0;
            
            let toSendTXOs = [];
            for (const elem of sip(filteredUTXOs, this.dimBlock))
            {
                toSendTXOs.push(await this.btc.gcsTx(elem, 1));
                loading("Number of tx ready to send: " + toSendTXOs.length);
            }

            for(let i in toSendTXOs)
            {
                const hashHexTransaction = await this.btc.sendTransaction(toSendTXOs[i]);
                const mempool = await this.btc.getMemPoolInfo();
                loading("mempoolsize: " + mempool.size + " - " +  ++i + "/" +  toSendTXOs.length + " - hashHexTransaction: " + hashHexTransaction);            
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

module.exports = Cleaner;