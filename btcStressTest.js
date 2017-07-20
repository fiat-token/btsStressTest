//'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromisified = promisify(exec);

//default params
let bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";
let fee = 0.00001;

const main = async () =>
{
    let address = await get(bcreg +  " getnewaddress | tr -d \"\012\"");
    console.log("address: " + address);
    let txidvout = JSON.parse(await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout, amount: .amount}'"));
    console.log("txidvout: " + txidvout.txid);
    let output = {};
    output.address = address;
    let amount = txidvout.amount - fee;
    delete txidvout.amount;
    let str = bcreg + " createrawtransaction '''[" + JSON.stringify(txidvout) + "]''' '''{" + '"' + address + '": ' +  output.amount + "}'''";
    console.log("str:" + str);
    let rawTransaction = await get(str);
    console.log("raw:" + rawTransaction);
    let signedTransaction = await get(bcreg + " -named signrawtransaction hexstring=" + rawTransaction);
    console.log("signing: " + rawTransaction);
    let resultSend = await get(bcreg + " -named sendrawtransaction hexstring=" + JSON.parse(signedTransaction).hex);
    console.log("send:" + resultSend);

    //TODO quando fai sign, controlla che il l'oggetto tornato abbia il campo complete a true
}

main();




// functions

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