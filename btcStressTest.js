'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromisified = promisify(exec);

//default params
let bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
let fee = 0.00001;

const main = async () =>
{
    const destionationAddress = await generateNewAddress();
    const utxo = await getUTXO();
    const rawTransaction = await createRawTransaction(utxo, destionationAddress);
    const signedTransaction = await signTransaction(rawTransaction);
    const hashHexTransaction = await sendTransaction(signedTransaction);
    const hashBlock = await generate();

    //TODO quando fai sign, controlla che il l'oggetto tornato abbia il campo complete a true
}

main();


// functions

async function generateNewAddress()
{
    console.log("generating new address...");
    const newAddress = await get(bcreg +  " getnewaddress | tr -d \"\012\""); //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
    console.log("newAddress:" + newAddress);
    return newAddress;
}

async function getUTXO()
{
    console.log("get first utxo...");
    const utxo = await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout, amount: .amount}'"); 
    console.log("newAddress:" + utxo);
    return JSON.parse(utxo);
}

async function createRawTransaction(utxo, destionationAddress)
{
    console.log("creating raw transaction...");
    const amount = utxo.amount - fee;
    delete utxo.amount;
    const cmd = bcreg + " createrawtransaction '''[" + JSON.stringify(utxo) + "]''' '''{" + '"' + destionationAddress + '": ' +  amount + "}'''";
    console.log("str:" + str);
    const rawTransaction = await get(str);
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
        const { err, stdout, stderr } = await execPromisified(cmd);
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