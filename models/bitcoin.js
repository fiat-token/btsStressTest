'use strict';

const Logger = require('./logger');
const { get, map, range, log, loading, reduce } = require('../libs');
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
            socket: checkArg(process.env.socket, "localhost:8080")
        } 
        this.client = new callRPC(connectionParams);
        this.file = checkArg(process.env.logFile, "test.log");
        this.format = "Bitcoin";
        this.log = new Logger(file, format);
    }

    async generateNewAddresses(howMany = 1) // howMany: Number
    {
        try
        {
            this.log.debug("generating " + howMany + " new addresses...");
            const promises = range(howMany).map(() => this.client.getnewaddress());
            let listAddress = await Promise.all(promises);
            if(!listAddress instanceof Array) listAddress = new Array(listAddress);
            return listAddress;
        }
        catch(err)
        {
            this.log.error("generateNewAddresses: " + err);
        }
    }

    async getUTXOs(howMany) // howMany: Number
    {
        try
        {
            let showNumber = howMany;
            if(!howMany) showNumber = "all";
            this.log.debug("retrieving " + showNumber + " UTXOs...");
            const arrayUTXOs = await this.client.listunspent();
            if(howMany) arrayUTXOs = arrayUTXOs.slice(0, howMany);
            return arrayUTXOs;
        }
        catch(err)
        {
            this.log.error("getUTXOs: " + err);
        }
    }

    async createRawTransaction(arrayUTXOs, listAddresses) // arrayUTXOs: Array of Objects; listAddresses: Array of strings
    {
        try
        {
            this.log.debug("creating a raw transaction...");
            //calculate fee and final amount for each address
            const totalAmount = reduce(arrayUTXOs, (a, b) => { return a + b;});
            const amount = ( (totalAmount - this.fee) / listAddresses.length ).toFixed(8);;
            this.log.debug("total number of UTXOs: " + arrayUTXOs.length);
            this.log.debug("total number of addresses: " + listAddresses.length);
            this.log.debug("fee: " + this.fee);
            this.log.debug("totalAmount: " + amount);
            this.log.debug("amount for each address: " + amount);
            if(amount <= 0) throw new Error("amount is " + amount);
            //creating recipients
            let recipients = {};
            recipients = map(listAddresses, (address) => { recipients[address] = amount; } );
            const rawTransaction = await this.client.createrawtransaction(arrayUTXOs, recipients);
            this.log.debug("rawTransaction:" + rawTransaction);
            return rawTransaction;
        }
        catch(err)
        {
            this.log.error("createRawTransaction: " + err);
        }
    }

    async signTransaction(rawTransaction) // rawTransaction: Array of strings
    {
        try
        {
            this.log.debug("signing " + rawTransaction.length + " raw transactions...");
            const signedTransaction = await this.client.signrawtransaction(rawTransaction);
            this.log.debug("signedTransaction:" + signedTransaction);
            return signedTransaction;
        }
        catch(err)
        {
            this.log.error("signTransaction: " + err);
        }
    }

    async sendTransaction(signedTransactions) // signedTransactions: Array of strings
    {
        try
        {
            this.log.debug("sending " + signedTransactions.length + " transaction...");
            const hashHexTransaction = await this.client.sendrawtransaction(signedTransaction);
            this.log.debug("hashHexTransaction: " + hashHexTransaction);
            return hashHexTransaction;
        }
        catch(err)
        {
            this.log.error("sendTransaction: " + err);
        }
    }

    async generate(numberOfBlocks) // numberOfBlocks: Number
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

    //generate-create-sign transaction
    async gcsTx (utxo, quantity) // utxo: Array of Objects; quantity: Number
    {
        try
        {
            const destinationAddresses = await this.generateNewAddresses(quantity);
            const rawTransaction = await this.createRawTransaction(utxo, destinationAddresses);
            if(rawTransaction == null) throw new Error("Raw Transaction is null");
            const signedTransaction = await this.signTransaction([rawTransaction]);
            return signedTransaction;
        }
        catch(err)
        {
            this.log.error("gcsTx: " + err);
        }
    }

    //generate-create-sign-send transaction
    async gcssTx(filteredUTXOs, quantity) 
    {
        try 
        {
            let toSendTXOs = [];
            for (const elem of filteredUTXOs) 
            {
                toSendTXOs.push(await this.gcsTx(elem, quantity));
                loading("Number of tx ready to send: " + toSendTXOs.length);
            }

            for (let i in toSendTXOs) 
            {
                const hashHexTransaction = await this.sendTransaction([toSendTXOs[i]]);
                const mempool = await this.getMemPoolInfo();
                loading("mempoolsize: " + mempool.size + " - " + ++i + "/" + toSendTXOs.length + " - hashHexTransaction: " + hashHexTransaction);
            }
        }
        catch (err) 
        {
            this.log.error("gcssTx: " + err);
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