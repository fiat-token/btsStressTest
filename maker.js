'use strict';

//libs
const debug = require('debug')('maker');
const Bitcoin = require('./bitcoin');
const { log, filter, sip, checkArg, loading } = require('./libs');
const { sleep } = require('sleep');

//default params
require('dotenv').load();

const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
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
    constructor(bcreg, fee, logFile, quantity, elaborateThreshold, maxTXs)
    {
        this.btc = new Bitcoin(bcreg, fee);
        this.logFile = logFile;
        this.quantity = quantity;
        this.elaborateThreshold = elaborateThreshold;
        this.maxTXs = maxTXs;

        console.log("\nMaker parameters:");
        console.log("bcreg= " + bcreg);
        console.log("fee= " + fee);
        console.log("quantity= " + quantity);
        console.log("logFile= " + logFile);
        console.log("Threshold for elaborate= " + elaborateThreshold);
        console.log("Max Transactions= " + maxTXs);
        console.log("");
    }

    async make()
    {
        try
        {
            console.log("\nStart making...");
            const allUTXOs = await this.btc.getUTXOs("all");
            console.log("all UTXOs: " + allUTXOs.length);
            if(allUTXOs == null || allUTXOs == 0) { return null; }
            //const filteredUTXOs = allUTXOs;
            const filteredUTXOs = filter(allUTXOs, (utxo) => { return utxo.amount >= elaborateThreshold} );
            if(!filteredUTXOs)
            {
                console.log("no UTXO found with amount greater than " + elaborateThreshold);
                return;
            }
            console.log("number of UTXOs over the threshold amount of " + elaborateThreshold + ": " + filteredUTXOs.length);

            filteredUTXOs = maxTXs != 0 ? filteredUTXOs.slice(0, maxTXs) : filteredUTXOs;

            for(let i in filteredUTXOs)
            {
                const hashHexTransaction = await this.btc.gcssTx(filteredUTXOs[i], quantity);
                const mempool = await this.btc.getMemPoolInfo();
                loading("mempoolsize: " + mempool.size + " - " +  ++i + "/" +  filteredUTXOs.length + " - hashHexTransaction: " + hashHexTransaction);
            }
        }
        catch(err)
        {
            console.log("Error from make: " + err);
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
        const maker = new Maker(bcreg, fee, logFile, quantity, elaborateThreshold, maxTXs);
        await maker.make();
    }
    catch(err)
    {
        console.log("Error from main: " + err);
    }
}

main();

module.exports = Maker;