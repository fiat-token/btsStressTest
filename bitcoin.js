'use strict';

const debug = require('debug')('stress');
const { get, map, range, log } = require('./libs');
const file = "log.log";

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
                const newAddress = await get(this.bcreg +  " getnewaddress | tr -d \"\\012\""); //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
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
                //objUTXOs = objUTXOs.slice(0, nUTXOs); //bug: slice() is not a function
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
            debug("UTXOs");
            debug(UTXOs);
            console.error("dai cazzo");
            if(!(UTXOs instanceof Array))
            {
                debug("qui");
                UTXOs = JSON.parse('[' + JSON.stringify(UTXOs) + ']');
                debug("quo");
                senders = UTXOs;
                debug("qua");
                debug(senders);
                delete senders[amount];
                debug("là");
            }
            debug("dlam");
            senders = JSON.stringify(senders);
            debug("senders: " + senders);

            //calculating amount
            let totalAmount = 0;
            for(const utxo of UTXOs)
            {
                totalAmount += utxo.amount;
            }
            totalAmount /= UTXOs.length;
            const amount = ( totalAmount - (this.fee / 100 * totalAmount) ).toFixed(8);
            debug("amount: " + amount);

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
}

module.exports = Bitcoin;