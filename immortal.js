'use strict';

const Maker = require('./models/maker');
const Cleaner = require('./models/cleaner');
const { checkArg } = require('./libs');
const { sleep } = require('sleep');

require('dotenv').load();

//immortal param
const cleanerSwitch = checkArg(process.env.cleanerSwitch, true);
const waitSec = checkArg(process.env.waitSec, 10);

//maker param
const makerfee = checkArg(process.env.makerfee, 0.00000001);
const makerLogFile = checkArg(process.env.makerLogFile, "maker.log");
const makerQuantity = checkArg(process.env.makerQuantity, 1);
const makerThreshold = checkArg(process.env.makerThreshold, 0.01);
const makerLogOnDisk = checkArg(process.env.makerLogOnDisk, false);
const makerLogOnTerminal = checkArg(process.env.makerLogOnTerminal, true);
const makerLogFormat = checkArg(process.env.makerLogFormat, "mainmaker");
const makerLogLevel = checkArg(process.env.makerLogLevel, 3);

//cleaner param
const cleanerFee = checkArg(process.env.cleanerFee, 0.00000001);
const cleanerlogFile = checkArg(process.env.cleanerlogFile, "cleaner.log");
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const cleanerLogOnDisk = checkArg(process.env.cleanerLogOnDisk, false);
const cleanerLogOnTerminal = checkArg(process.env.cleanerLogOnTerminal, true);
const cleanerLogFormat = checkArg(process.env.cleanerLogFormat, "maincleaner");
const cleanerLogLevel = checkArg(process.env.cleanerLogLevel, 3);

//immortal
const immortal = async () =>
{
    try
    {
        const maker = new Maker(makerfee, makerLogFile, makerQuantity, makerThreshold, makerLogLevel, makerLogOnDisk, makerLogOnTerminal, makerLogFormat);
        const cleaner = new Cleaner(cleanerFee, cleanerlogFile, cleanerThreshold, cleanerLogLevel, cleanerLogOnDisk, cleanerLogOnTerminal, cleanerLogFormat);

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