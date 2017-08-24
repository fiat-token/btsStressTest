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
        this.format = "Cleaner";
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
            const allUTXOs = await this.btc.getUTXOs();
            this.log.info("all UTXOs: " + allUTXOs.length);
            if(allUTXOs == null || allUTXOs == 0) { return null; }
            const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount < this.cleanerThreshold } );
            this.log.info("number of UTXOs under the threshold amount of " + this.cleanerThreshold + ": " + filteredUTXOs.length);
            if(filteredUTXOs.length == 0) return;
            await this.btc.gcssTx(sip(filteredUTXOs, this.dimBlock), 1);
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