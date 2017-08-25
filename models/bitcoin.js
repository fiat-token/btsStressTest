'use strict';

const Logger = require('./logger');
const { get, map, range, log, loading, reduce, checkArg } = require('../libs');
const callRPC = require('./callRPC');
require('dotenv').load();

class Bitcoin
{
    constructor(fee) 
    {
        this.fee = fee;
        this.connectionParams =
        {
            user: checkArg(process.env.user, "regtest"),
            pass: checkArg(process.env.pass, "regtest"),
            socket: checkArg(process.env.socket, "http://localhost:8080")
        } 
        this.client = new callRPC(this.connectionParams);
        this.file = checkArg(process.env.logFile, "test.log");
        this.format = "bitcoin.js";
        this.log = new Logger(this.file, this.format);
    }

    async generateNewAddresses(howMany = 1) // howMany: number
    {
        try
        {
            this.log.debug("generating " + howMany + " new addresses...");
            const promises = range(howMany).map(() => this.client.getnewaddress());
            const listAddress = await Promise.all(promises);
            return listAddress;
        }
        catch(err)
        {
            this.log.error("generateNewAddresses: " + err);
        }
    }

    async getUTXOs(howMany = 1)
    {
        try
        {
            this.log.debug("retrieving " + howMany + " UTXOs...");
            const arrayUTXOs = await this.client.listunspent();
            return howMany ? arrayUTXOs.slice(0, howMany) : arrayUTXOs;
        }
        catch(err)
        {
            this.log.error("getUTXOs: " + err);
        }
    }

    async createRawTransaction(arrayUTXOs = [{}], listAddresses = [''])
    {
        try
        {
            this.log.debug("creating a raw transaction...");
            //calculate fee and final amount for each address
            const totalAmount = arrayUTXOs.reduce( (a, b) => a + b.amount, 0 );
            const amount = ( (totalAmount - this.fee) / listAddresses.length ).toFixed(8);;
            this.log.debug("total number of UTXOs: " + arrayUTXOs.length);
            this.log.debug("total number of addresses: " + listAddresses.length);
            this.log.debug("fee: " + this.fee);
            this.log.debug("totalAmount: " + totalAmount);
            this.log.debug("amount for each address: " + amount);
            if(amount <= 0 || isNaN(amount)) throw new Error("amount is " + amount);
            
            //creating recipients
            const recipients = listAddresses.reduce( (result, address) => { result[address] = amount; return result;}, {} );
            const rawTransaction = await this.client.createrawtransaction(arrayUTXOs, recipients);
            this.log.debug("rawTransaction:" + rawTransaction);
            return rawTransaction;
        }
        catch(err)
        {
            this.log.error("createRawTransaction: " + err);
        }
    }

    async signTransaction(rawTransaction = [''])
    {
        try
        {
            this.log.debug("signing " + rawTransaction.length + " raw transactions...");
            const promises = rawTransaction.map((tx) => this.client.signrawtransaction(tx));
            const listSignedTx = await Promise.all(promises);
            const onlyHex = listSignedTx.map( (elem) => { return elem.hex;} );
            return onlyHex;
        }
        catch(err)
        {
            this.log.error("signTransaction: " + err);
        }
    }

    async sendTransaction(signedTransactions = [''])
    {
        try
        {
            this.log.debug("sending " + signedTransactions.length + " transaction...");
            const promises = signedTransactions.map((tx) => this.client.sendrawtransaction(tx));
            const listHashHexTransaction = await Promise.all(promises);
            return listHashHexTransaction;
        }
        catch(err)
        {
            this.log.error("sendTransaction: " + err);
        }
    }

    async generate(numberOfBlocks = 1) 
    {
        try
        {
            this.log.info("generating " + numberOfBlocks + " of new blocks...");
            const arrayOfHashesOfBlocks = await this.client.generate(numberOfBlocks);
            this.log.info("hashBlock:" + JSON.stringify(arrayOfHashesOfBlocks));
            return arrayOfHashesOfBlocks;
        }
        catch(err)
        {
            this.log.error("generate: " + err);
        }
    }

    async getMemPoolInfo()
    {
        try
        {
            this.log.debug("calling getmempoolinfo...");
            const info = await this.client.getmempoolinfo();
            this.log.debug("getmempoolinfo: " + info);
            return info;
        }
        catch(err)
        {
            this.log.error("getMemPoolInfo: " + err);
        }
    }
}

module.exports = Bitcoin;