//'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromisified = promisify(exec);

//default params
let bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";

const main = async () =>
{
    let address = await get(bcreg +  " getnewaddress | tr -d \"\012\"");
    console.log("address: " + address);
    let txidvout = JSON.parse(await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout }'"));
    console.log("txidvout: " + txidvout.txid);
    let output = {};
    output.address = address;
    output.amount = 0.04;
    let str = bcreg + " createrawtransaction '''[" + JSON.stringify(txidvout) + "]''' '''{" + '"' + address + '": ' +  output.amount + "}'''";
    console.log("str:" + str);
    let rawTransaction = await get(str);
    console.log("raw:" + rawTransaction);
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