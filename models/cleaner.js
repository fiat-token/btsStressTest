'use strict';

//libs
const Logger = require('./logger');
const Bitcoin = require('./bitcoin');
const { filter, sip, loading, map } = require('../libs');

class Cleaner
{
    constructor(fee, logFile, cleanerThreshold, dimBlock)
    {
        this.btc = new Bitcoin(fee);
        this.logFile = logFile;
        this.cleanerThreshold = cleanerThreshold;
        this.dimBlock = dimBlock;
        this.format = "cleaner.js";
        this.log = new Logger(this.logFile, this.format);
        this.log.info("Cleaner parameters:");
        this.log.info("fee= " + this.fee);
        this.log.info("logFile= " + this.logFile);
        this.log.info("Threshold for cleaner= " + this.cleanerThreshold);
        this.log.info("Block dimension= " + this.dimBlock);
        this.log.info("");
    }

    async clean()
    {
        try
        {
            this.log.info("Start cleaning...")
            
            //get UTXOs
            const allUTXOs = await this.btc.getUTXOs();
            if(!allUTXOs || allUTXOs == 0) { this.log.info("no UTXO found"); return;}
            this.log.info("all UTXOs: " + allUTXOs.length);

            // filter UTXOs
            const filteredUTXOs = allUTXOs.filter( utxo => utxo.amount < this.cleanerThreshold );
            this.log.info("number of UTXOs under the threshold amount of " + this.cleanerThreshold + ": " + filteredUTXOs.length);
            if(filteredUTXOs.length == 0) { this.log.info("no UTXO found"); return;}
            
            //create raw transaction - sign - send 
            const destinationAddress = await this.btc.generateNewAddresses(1);
            const rawTx = await this.btc.createRawTransaction(filteredUTXOs, destinationAddress)
            const signedTx = await this.btc.signTransaction(rawTx);
            const hashTx = await this.btc.sendTransaction(signedTx);
            this.log.info(hashTx);
        }
        catch(err)
        {
            this.log.error("clean: " + err);
        }
        finally
        {
            this.log.info("");
        }
    }
}

module.exports = Cleaner;