//'use strict';

const { promisify } = require('util');
const { spawn } = require('child_process');
const spawnPromisified = promisify(spawn);

const bcreg = "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf";


const out = get(bcreg + " getbalance");
console.log(out);



async function get(cmd) 
{
    try
    {
        const { stdout, stderr, err } = await spawnPromisified(cmd);
        console.log('err-', cmd, stderr);
        return stdout;
    }
    catch(err)
    {
        throw new Error('il new si può omettere ma è più bellino');
    }
}