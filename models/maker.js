'use strict';

const Bitcoin = require('./bitcoin');
const Logger = require('./logger');

class Maker
{
    constructor(fee = 0.01, logFile = 'maker.log', quantity = 1, elaborateThreshold = 1, actualLevel = 3, onDisk = false, onTerminal = true, format = "maker.js")
    {
        this.btc = new Bitcoin(fee);
        this.quantity = quantity;
        this.elaborateThreshold = elaborateThreshold;
        this.logFile = logFile;
        this.format = format;
        this.log = new Logger(this.logFile, this.format, actualLevel, onDisk, onTerminal);

        this.log.info("Maker parameters:");
        this.log.info("fee: " + fee);
        this.log.info("quantity: " + this.quantity);
        this.log.info("logFile: " + this.logFile);
        this.log.info("threshold: " + this.elaborateThreshold);
        this.log.info("");
    }

    async make()
    {
        try
        {
            this.log.info("Start making...");
            
            //get UTXOs
            const allUTXOs = await this.btc.getUTXOs();
            if(!allUTXOs) { this.log.info("no UTXO found"); return;}
            this.log.info("all UTXOs: " + allUTXOs.length);

            // filter UTXOs
            const filteredUTXOs = allUTXOs.filter( utxo => utxo.amount >= this.elaborateThreshold );
            this.log.info("number of UTXOs over the threshold amount of " + this.elaborateThreshold + ": " + filteredUTXOs.length);
            if(filteredUTXOs.length < 1) { this.log.info("no UTXO left"); return;}

            //create raw transaction - sign - send 
            const destinationAddresses = await this.btc.generateNewAddresses(this.quantity);
            const onlyDefined = destinationAddresses.filter( elem => { return typeof elem !== 'undefined'; } );
            const promises = filteredUTXOs.map( elem => this.btc.createRawTransaction([elem], onlyDefined) );

            const arrayOfRawTx = await Promise.all(promises);
            const signedTx = await this.btc.signTransaction(arrayOfRawTx);
            const hashTx = await this.btc.sendTransaction(signedTx);
            this.log.info("end - hash result of sendrawtransaction:" + JSON.stringify(hashTx));
        }
        catch(err)
        {
            this.log.info("make: " + err);
        }
        finally
        {
            this.log.info("");
        }
    }
}

module.exports = Maker;