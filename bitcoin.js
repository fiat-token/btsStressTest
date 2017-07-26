'use strict';

const debug = require('debug')('stress');
const { get, map, range, log } = require('./libs');
const file = "Bitcoin.log";

class Bitcoin
{
    constructor(bcreg, fee) 
    {
        this.bcreg = bcreg;
        this.fee = fee;
    }

    async generateNewAddress(quantity)
    {
        try
        {
            debug("generating " + quantity + " new addresses...");
            const listAddress = [];
            for(const i of range(quantity))
            {
                const newAddress = await get(this.bcreg +  " getnewaddress");
                listAddress.push(newAddress);
            }
            return listAddress;
        }
        catch(err)
        {
            console.log("Error from generateNewAddress: " + err);
        }
    }

    async getUTXOs(nUTXOs)
    {
        try
        {
            debug("get all UTXOs...");
            const strUTXOs = await get(this.bcreg + " listunspent");
            let objUTXOs = JSON.parse(strUTXOs);
            if(nUTXOs != "all")
            {
                objUTXOs = objUTXOs.slice(0, nUTXOs); //bug: slice() is not a function
            }
            const filteredUTXOs = map(objUTXOs, (utxo) => { return {"txid": utxo.txid, "vout": utxo.vout, "amount": utxo.amount} });
            return filteredUTXOs;
        }
        catch(err)
        {
            console.log("Error from getUTXOs: " + err);
        }
    }

    async createRawTransaction(UTXOs, listAddresses)
    {
        try
        {
            debug("creating raw transaction...");

            //calculating senders
            let senders;
            if(!(UTXOs instanceof Array))
            {
                UTXOs = JSON.parse('[' + JSON.stringify(UTXOs) + ']');
            }
            
            senders = map(UTXOs, (utxo) => { return {"txid": utxo.txid, "vout": utxo.vout} });
            senders = JSON.stringify(senders);
            debug("senders: " + senders);

            //calculating amount
            let totalAmount = 0;
            for(const utxo of UTXOs)
            {
                totalAmount += utxo.amount;
            }
            //codice per calcolare una fee statica
            const amount = (totalAmount - this.fee) / listAddresses.length;
            // codice per calcolare la fee in percentuale
            // let amount = totalAmount - (this.fee / 100 * totalAmount);
            // amount /= listAddresses.length;
            // amount = (amount).toFixed(8);
            // if (amount == 0)
            // {
            //     amount = 0.00000001;
            // }
            debug("listAddressesLength: " + listAddresses.length);
            debug("fee: " + this.fee);
            debug("amount: " + amount);

            if(amount < 0)
            {
                console.log("amount isn't enough for making a transaction");
                return null;
            }


            //calculating receivers
            const obj = {};
            for(const address of listAddresses)
            {
                obj[address] = amount;
            }
            const recipients = JSON.stringify(obj);
            debug("recipients: " + recipients);

            const cmd = this.bcreg + " createrawtransaction '''" + senders + "''' '''" + recipients +  "'''";
            debug("cmd-rawTx:" + cmd);
            const rawTransaction = await get(cmd);
            debug("rawTransaction:" + rawTransaction);
            return rawTransaction;
        }
        catch(err)
        {
            console.log("Error from createRawTransaction: " + err);
        }
    }

    async signTransaction(rawTransaction)
    {
        try
        {
            debug("signing raw transaction...");
            const signedTransaction = await get(this.bcreg + " -named signrawtransaction hexstring=" + rawTransaction);
            debug("signedTransaction:" + signedTransaction);
            return signedTransaction;
        }
        catch(err)
        {
            console.log("Error from signTransaction: " + err);
        }
    }

    async sendTransaction(signedTransaction)
    {
        try
        {
            debug("sending raw transaction...");
            const hashHexTransaction = await get(this.bcreg + " -named sendrawtransaction hexstring=" + JSON.parse(signedTransaction).hex);
            debug("hashHexTransaction: " + hashHexTransaction);
            return hashHexTransaction;
        }
        catch(err)
        {
            console.log("Error from sendTransaction: " + err);
        }
    }

    async generate()
    {
        try
        {
            console.log("generating new block...");
            const hashBlock = await get(this.bcreg + " generate 1");
            console.log("hashBlock:" + hashBlock);
            return hashBlock;
        }
        catch(err)
        {
            console.log("Error from generate: " + err);
        }
    }

    //generate-create-sign-send transaction
    async gcssTx (utxo, quantity)
    {
        try
        {
            const destinationAddresses = await this.generateNewAddress(quantity);
            const rawTransaction = await this.createRawTransaction(utxo, destinationAddresses);
            if(rawTransaction == null) { return null; }
            const signedTransaction = await this.signTransaction(rawTransaction);
            const hashHexTransaction = await this.sendTransaction(signedTransaction);
            //log(logFile, hashHexTransaction);
            return hashHexTransaction;
        }
        catch(err)
        {
            console.log("Error from gcssTx: " + err);
        }
    }
}

module.exports = Bitcoin;