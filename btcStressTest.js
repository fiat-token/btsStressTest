'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromisified = promisify(exec);

//default params
let bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
let fee = 0.00001;

const unitTest = async () =>
{
    const destionationAddress = await generateNewAddress();
    const utxo = await getUTXOs(1);
    const rawTransaction = await createRawTransaction(utxo, destionationAddress);
    const signedTransaction = await signTransaction(rawTransaction);

    const hashHexTransaction = await sendTransaction(signedTransaction);
    const hashBlock = await generate();

    //TODO quando fai sign, controlla che il l'oggetto tornato abbia il campo complete a true
}

//unitTestMain();


const main = async (numberOfTransaction) =>
{
    try
    {
        const listSignedTransaction = [];
        const UTXOs = await getUTXOs("all"); // numberOfTransaction
        for(const num in range(numberOfTransaction))
        {
            console.log(num + "...");
            const destionationAddress = await generateNewAddress();
            const UTXO = UTXOs[num];
            const rawTransaction = await createRawTransaction(UTXO, destionationAddress);
            const signedTransaction = await signTransaction(rawTransaction);
            listSignedTransaction.push(signedTransaction);
        }

        for(const signed of range(listSignedTransaction))
        {
            sendTransaction(signed);
        }

        const hashBlock = await generate();
    }
    catch(err)
    {
        throw Error(err);
    }
}

main(1);

// functions

function map(array, transform)
{
    const mapped = [];
    for (const elem of array)
    {
        mapped.push(transform(elem));
    }
    return mapped;
}

function range(start, stop, step) 
{
    if (!stop) 
    {
        // one param defined
        stop = start;
        start = 0;
    }

    if (!step) step = 1;
    {
        
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) 
    {
        return [];
    }

    const result = [];

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) 
    {
        result.push(i);
    }

    return result;
};

async function generateNewAddress()
{
    console.log("generating new address...");
    const newAddress = await get(bcreg +  " getnewaddress | tr -d \"\\012\""); //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
    console.log("newAddress:" + newAddress);
    return newAddress;
}


async function getUTXO()
{
    console.log("get first UTXO...");
    const UTXO = await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout, amount: .amount}'"); 
    console.log("UTXO:" + UTXO);
    return JSON.parse(UTXO);
}

async function getUTXOs(nUTXOs)
{
    console.log("get all UTXOs...");
    const strUTXOs = await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout, amount: .amount}'"); 
    console.log("UTXOs:" + strUTXOs);
    let objUTXOs = JSON.parse(strUTXOs);
    if(nUTXOs != "all")
    {
        objUTXOs = objUTXOs.slice(0, nUTXOs);
    }
    const filteredUTXOs = map(objUTXOs, (utxo) => { return {txid: utxo.txid, vout: utxo.vout, amount: utxo.amount} });
    return filteredUTXOs;
}

async function createRawTransaction(utxos, destionationAddress)
{
    console.log("creating raw transaction...");
    //calcola fee
    const amount = utxo.amount - fee;
    for(let utxo of utxos)
    delete utxo.amount;
    const cmd = bcreg + " createrawtransaction '''" + JSON.stringify(utxos) + "''' '''{" + '"' + destionationAddress + '": ' +  amount + "}'''";
    //console.log("cmd:" + cmd);
    const rawTransaction = await get(cmd);
    console.log("rawTransaction:" + rawTransaction);
    return rawTransaction;
}

async function signTransaction(rawTransaction)
{
    console.log("signing raw transaction...");
    const signedTransaction = await get(bcreg + " -named signrawtransaction hexstring=" + rawTransaction);
    console.log("signedTransaction:" + signedTransaction);
    return signedTransaction;
}

async function sendTransaction(signedTransaction)
{
    console.log("sending raw transaction...");
    const hashHexTransaction = await get(bcreg + " -named sendrawtransaction hexstring=" + JSON.parse(signedTransaction).hex);
    console.log("hashHexTransaction:" + hashHexTransaction);
    return hashHexTransaction;
}

async function generate()
{
    console.log("generating new block...");
    const hashBlock = await get(bcreg + " generate 1");
    console.log("hashBlock:" + hashBlock);
    return hashBlock;
}

async function get(cmd) 
{
    try
    {
        const { err, stdout, stderr } = await execPromisified(cmd, {maxBuffer: 1024 * 50000}); 
        // potrei usare spawn e andare di chunk, ma ho trovato dei problemi. Setto il buffer elevato per via di "bcreg listunspent"
        if(stderr)
        {
            console.log("stderr of " + cmd + " is: " + stderr);
        }

        return stdout;
    }
    catch(err)
    {
        throw Error(err);
    }
}