'use strict';

//libs
const debug = require('debug')('immortal');
const Maker = require('./models/maker');
const Cleaner = require('./models/cleaner');
const { checkArg } = require('./libs');
const { sleep } = require('sleep');

require('dotenv').load();

//immortal param
const bcreg = checkArg(process.env.bcreg, "bitcoin-cli -conf=/home/usrBTC/regtest/bitcoin.conf");
const fee = checkArg(process.env.fee, 0.00000001);
const cleanerSwitch = checkArg(process.env.cleanerSwitch, true);
const waitSec = checkArg(process.env.waitSec, 10);
const logFileImmortal = checkArg(process.env.logFileImmortal, "logFileImmortal.log");

//maker param
const logFileMaker = checkArg(process.env.logFileMaker, "logFileMaker.log");
const quantity = checkArg(process.env.quantity, 1);
const elaborateThreshold = checkArg(process.env.elaborateThreshold, 50);
const maxTXs = checkArg(process.env.maxTXs, 100);
const writeTxOnFile = checkArg(process.env.writeTxOnFile, false);

//cleaner param
const logFileCleaner = checkArg(process.env.logFileCleaner, "logFileCleaner.log");
const dimBlock = checkArg(process.env.dimBlock, 250);
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);

//immortal
const immortal = async () =>
{
    try
    {
        const maker = new Maker(bcreg, fee, logFileMaker, quantity, elaborateThreshold, maxTXs, writeTxOnFile);
        const cleaner = new Cleaner(bcreg, fee, logFileCleaner, cleanerThreshold, dimBlock);
        while (true) 
        {
            if(cleanerSwitch) 
            {
                await cleaner.clean();
                await maker.make();
            }
            else
            {
                await maker.make();
            }

            console.log("Waiting " + waitSec + " seconds..");
            sleep(waitSec);            
        }
    }
    catch(err)
    {
        console.log("Error from immortal: " + err);
    }
}

//main
const main = async () =>
{
    try
    {
        await immortal();
    }
    catch(err)
    {
        console.log("Error from main: " + err);
    }
}

main();