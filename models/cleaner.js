'use strict';

const Logger = require('./logger');
const Bitcoin = require('./bitcoin');

class Cleaner
{
    constructor(fee = 0.01, logFile = 'cleaner.log', cleanerThreshold = 1, actualLevel = 3, onDisk = false, onTerminal = true, format = "cleaner.js")
    {
        this.btc = new Bitcoin(fee);
        this.cleanerThreshold = cleanerThreshold;
        this.logFile = logFile;
        this.format = format;
        this.log = new Logger(this.logFile, this.format, actualLevel, onDisk, onTerminal);

        this.log.info("Cleaner parameters:");
        this.log.info("fee: " + fee);
        this.log.info("logFile: " + this.logFile);
        this.log.info("threshold: " + this.cleanerThreshold);
        this.log.info("");
    }

    async clean()
    {
        try
        {
            this.log.info("Start cleaning...")
            
            //get UTXOs
            const allUTXOs = await this.btc.getUTXOs();
            if(!allUTXOs) { this.log.info("no UTXO found"); return;}
            this.log.info("all UTXOs: " + allUTXOs.length);

            // filter UTXOs
            const filteredUTXOs = allUTXOs.filter( utxo => utxo.amount < this.cleanerThreshold );
            this.log.info("number of UTXOs under the threshold amount of " + this.cleanerThreshold + ": " + filteredUTXOs.length);
            if(filteredUTXOs.length < 1) { this.log.info("no UTXO left"); return;}
            
            //create raw transaction - sign - send 
            const destinationAddress = await this.btc.generateNewAddresses(1);
            const rawTx = await this.btc.createRawTransaction(filteredUTXOs, destinationAddress)
            const signedTx = await this.btc.signTransaction([rawTx]);
            const hashTx = await this.btc.sendTransaction(signedTx);
            this.log.info("end - hash result of sendrawtransaction:" + JSON.stringify(hashTx));
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