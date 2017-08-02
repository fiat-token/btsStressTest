'use strict';

//libs
const debug = require('debug')('maincleaner');
const Cleaner = require('./models/cleaner');
const { checkArg } = require('./libs');

//default params
require('dotenv').load();

const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFileCleaner, "cleaner.log");
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const dimBlock = checkArg(process.env.dimBlock, 250);

//main
const main = async () =>
{
    try
    {
        const cleaner = new Cleaner(bcreg, fee, logFile, cleanerThreshold, dimBlock);
        await cleaner.clean();
    }
    catch(err)
    {
        console.log("Error from maincleaner: " + err);
    }
}

main();