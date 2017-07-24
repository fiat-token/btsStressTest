//'use strict';

require('dotenv').load();
const debug = require('debug')('stress');
const { promisify } = require('util');
const { exec } = require('child_process');
const { map, range } = require('./libs');
const Bitcoin = require('./bitcoin');
const execPromisified = promisify(exec);

//default params
const bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
const fee = 0.001;
const numberOfTransactions = process.argv[2] || 1;


const main = async (numberOfTransactions) =>
{
    try
    {
        console.log("calculating " + numberOfTransactions + " transactions...");
        const btc = new Bitcoin(bcreg, fee);
        const listSignedTransaction = [];
        const UTXOs = await btc.getUTXOs("all"); // change all with numberOfTransactions
        for(const num in range(numberOfTransactions))
        {
            if(num % 50 == 0) { console.log("\t" + num + "..."); }

            const destionationAddress = await btc.generateNewAddress();
            const UTXO = UTXOs[num];
            const rawTransaction = await btc.createRawTransaction(UTXO, destionationAddress);
            const signedTransaction = await btc.signTransaction(rawTransaction);
            listSignedTransaction.push(signedTransaction);
        }

        console.log("sending transactions..");
       
        for(const signed in listSignedTransaction)
        {
            if(signed % 50 == 0) { console.log("\t" + signed + "..."); }

            btc.sendTransaction(listSignedTransaction[signed]);
        }
        
        const begin = Date.now();
        const hashBlock = await btc.generate();
        const end =  Date.now();
        console.log("time elapsed in s: " + (end - begin)/1000) ;
    }
    catch(err)
    {
        throw Error(err);
    }
}

main(numberOfTransactions);



const unitTestExample = async () =>
{
    const destionationAddress = await btc.generateNewAddress();
    const utxo = await btc.getUTXOs(1);
    const rawTransaction = await btc.createRawTransaction(utxo, destionationAddress);
    const signedTransaction = await btc.signTransaction(rawTransaction);

    const hashHexTransaction = await btc.sendTransaction(signedTransaction);
    const hashBlock = await btc.generate();

    //TODO quando fai sign, controlla che il l'oggetto tornato abbia il campo complete a true
}

//unitTestExample();