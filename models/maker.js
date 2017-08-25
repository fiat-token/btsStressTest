'use strict';

//libs
const debug = require('debug')('maker');
const Bitcoin = require('./bitcoin');
const { log, filter, sip, checkArg, loading } = require('../libs');
const Logger = require('./logger');
const { sleep } = require('sleep');

//default params
require('dotenv').load();

const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFileMaker, "maker.log");
const cleaning = checkArg(process.env.cleaning, true);
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const elaborateThreshold = checkArg(process.env.elaborateThreshold, 50);
const dimBlock = checkArg(process.env.dimBlock, 250);
const maxTXs = checkArg(process.env.maxTXs, 100);

//elaborate
class Maker
{
    constructor(fee, logFile, quantity, elaborateThreshold, maxTXs)
    {
        this.btc = new Bitcoin(fee);
        this.logFile = logFile;
        this.quantity = quantity;
        this.elaborateThreshold = elaborateThreshold;
        this.maxTXs = maxTXs;
        this.format = "Cleaner";
        this.log = new Logger(this.logFile, this.format);

        this.log.info("\nMaker parameters:");
        this.log.info("fee= " + fee);
        this.log.info("quantity= " + quantity);
        this.log.info("logFile= " + logFile);
        this.log.info("Threshold for elaborate= " + elaborateThreshold);
        this.log.info("Max Transactions= " + maxTXs);
        this.log.info("");
    }

    async make()
    {
        try
        {
            this.log.info("Start making...");
            
            //get UTXOs
            const allUTXOs = await this.btc.getUTXOs();
            if(!allUTXOs || allUTXOs == 0) { this.log.info("no UTXO found"); return;}
            this.log.info("all UTXOs: " + allUTXOs.length);

            // filter UTXOs
            const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount >= this.elaborateThreshold} );
            this.log.info("number of UTXOs over the threshold amount of " + this.cleanerThreshold + ": " + filteredUTXOs.length);
            if(filteredUTXOs.length == 0) { this.log.info("no UTXO found"); return;}
            
            //create raw transaction - sign - send 
            const destinationAddresses = await this.btc.generateNewAddresses(this.quantity);
            let arrayOfRawTx = [];
            for(elem of filteredUTXOs)
            {
                const rawTx = await this.btc.createRawTransaction([elem], destinationAddresses);
                arrayOfRawTx.push(rawTx);
            }

            const signedTx = await this.btc.signTransaction(arrayOfRawTx);
            const hashTx = await this.btc.sendTransaction([signedTx]);
            this.log.info(hashTx);

        }
        catch(err)
        {
            this.log.info("Error from make: " + err);
        }
        finally
        {
            this.log.info("");
        }
    }
}

module.exports = Maker;