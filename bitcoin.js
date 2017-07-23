'use strict';

const debug = require('debug')('btcStressTest:server');
const { get, map, range } = require('./libs');

class Bitcoin
{
    constructor (bcreg, fee) 
    {
        this.bcreg = bcreg;
        this.fee = fee;
    }

    async generateNewAddress(quantity)
    {
        console.log("generating " + quantity + " new addresses...");
        const listAddress = [];
        for(const i of range(quantity))
        {
            const newAddress = await get(this.bcreg +  " getnewaddress | tr -d \"\\012\""); //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
            listAddress.push(newAddress);
            console.log("newAddress:" + newAddress);
        }
        console.log("final array addresses:" + JSON.stringify(listAddress));
        return listAddress;
    }

    async getUTXOs(nUTXOs)
    {
        debug("get all UTXOs...");
        const strUTXOs = await get(this.bcreg + " listunspent");
        debug("UTXOs:" + strUTXOs);
        let objUTXOs = JSON.parse(strUTXOs);
        if(nUTXOs != "all")
        {
            //objUTXOs = objUTXOs.slice(0, nUTXOs); //bug: slice() is not a function
            console.log("instanceof: " + (objUTXOs instanceof Array));
            console.log(objUTXOs);
        }
        const filteredUTXOs = map(objUTXOs, (utxo) => { return {"txid": utxo.txid, "vout": utxo.vout, "amount": utxo.amount} });
        return filteredUTXOs;
    }

    async createRawTransaction(UTXOs, listAddresses)
    {
        try
        {
            console.log("creating raw transaction...");

            //calculating senders
            if(!(UTXOs instanceof Array))
            {
                UTXOs = JSON.parse('[' + JSON.stringify(UTXOs) + ']');
            }
            const senders = JSON.stringify(UTXOs);
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
            console.log("listAddresses:");
            console.log(listAddresses);
            for(const address of listAddresses)
            {
                console.log("one address:");
                console.log(address);
                obj.address = amount;
            }
            console.log("final obj:");
            console.log(obj);
            const recipients = JSON.stringify(obj);
            console.log("recipients: " + recipients);

            const cmd = this.bcreg + " createrawtransaction '''" + senders + "''' '''" + recipients +  "'''";
            console.log("cmd:" + cmd);
            const rawTransaction = await get(cmd);
            console.log("rawTransaction:" + rawTransaction);
            return rawTransaction;
        }
        catch(err)
        {
            console.log("Error from createRawTransaction: " + err);
        }
    }

    async signTransaction(rawTransaction)
    {
        debug("signing raw transaction...");
        const signedTransaction = await get(this.bcreg + " -named signrawtransaction hexstring=" + rawTransaction);
        debug("signedTransaction:" + signedTransaction);
        return signedTransaction;
    }

    async sendTransaction(signedTransaction)
    {
        debug("sending raw transaction...");
        const hashHexTransaction = await get(this.bcreg + " -named sendrawtransaction hexstring=" + JSON.parse(signedTransaction).hex);
        debug("hashHexTransaction:" + hashHexTransaction);
        return hashHexTransaction;
    }

    async generate()
    {
        console.log("generating new block...");
        const hashBlock = await get(this.bcreg + " generate 1");
        console.log("hashBlock:" + hashBlock);
        return hashBlock;
    }
}

module.exports = Bitcoin;