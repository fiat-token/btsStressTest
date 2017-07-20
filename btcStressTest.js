//'use strict';

const { promisify } = require('util');
const { exec } = require('child_process');
const execPromisified = promisify(exec);

//default params
let bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";

const main = async () =>
{
    let address = await get(bcreg +  " getnewaddress");
    console.log(address);
    let txidvout = JSON.parse(await get(bcreg + " listunspent | jq -r '.[0] | { txid: .txid, vout: .vout }'"));
    console.log(txidvout.txid);
    let output = {};
    output.address = address;
    output.amount = 0,04;
    let str = bcreg + "createrawtransaction '''" + JSON.stringify(txidvout) + " ''' '''" + JSON.stringify(output) + "'''";
    console.log("str:" + str);
    let rawTransaction = get(str);
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
        throw Error('il new si può omettere ma è più bellino');
    }
}