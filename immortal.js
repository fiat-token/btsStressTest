'use strict';

//libs
const debug = require('debug')('immortal');
const Maker = require('./maker');
const Cleaner = require('./cleaner');
const { checkArg } = require('./libs');
const { sleep } = require('sleep');

//default params
require('dotenv').load();
const cleanerSwitch = checkArg(process.env.cleanerSwitch, true);
const waitSec = checkArg(process.env.waitSec, 10);

//immortal
const immortal = async () =>
{
    try
    {
        const maker = new Maker(bcreg, fee, logFile, quantity, elaborateThreshold, maxTXs);
        const cleaner = new Cleaner(bcreg, fee, logFile, cleanerThreshold, dimBlock);
        while (true) 
        {
            if(cleanerSwitch) await cleaner.clean();
            await maker.make();
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