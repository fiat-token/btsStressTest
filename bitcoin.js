'use strict';

const debug = require('debug')('btcStressTest:server');
const { get, map } = require('./libs');

class Bitcoin
{
    constructor (bcreg, fee) 
    {
        this.bcreg = bcreg;
        this.fee = fee;
    }

    async generateNewAddress()
    {
        debug("generating new address...");
        const newAddress = await get(this.bcreg +  " getnewaddress | tr -d \"\\012\""); //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
        debug("newAddress:" + newAddress);
        return newAddress;
    }

    async getUTXOs(nUTXOs)
    {
        debug("get all UTXOs...");
        const strUTXOs = await get(this.bcreg + " listunspent");
        debug("UTXOs:" + strUTXOs);
        let objUTXOs = JSON.parse(strUTXOs);
        if(nUTXOs != "all")
        {
            objUTXOs = objUTXOs.slice(0, nUTXOs); //bug: slice() is not a function
        }
        const filteredUTXOs = map(objUTXOs, (utxo) => { return {"txid": utxo.txid, "vout": utxo.vout, "amount": utxo.amount} });
        return filteredUTXOs;
    }

    async createRawTransaction(UTXO, destionationAddress)
    {
        debug("creating raw transaction...");
        //const amount = (UTXO.amount - this.fee).toFixed(8);
        const amount = (this.fee / 100 * UTXO.amount).toFixed(8);
        delete UTXO.amount;
        const cmd = this.bcreg + " createrawtransaction '''[" + JSON.stringify(UTXO) + "]''' '''{" + '"' + destionationAddress + '": ' +  amount + "}'''";
        debug("cmd:" + cmd);
        const rawTransaction = await get(cmd);
        debug("rawTransaction:" + rawTransaction);
        return rawTransaction;
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