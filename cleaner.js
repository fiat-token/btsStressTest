'use strict';

const Cleaner = require('./models/cleaner');
const { checkArg } = require('./libs');
require('dotenv').load();

const cleanerFee = checkArg(process.env.cleanerFee, 0.00000001);
const cleanerlogFile = checkArg(process.env.cleanerlogFile, "cleaner.log");
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const cleanerLogOnDisk = checkArg(process.env.cleanerLogOnDisk, false);
const cleanerLogOnTerminal = checkArg(process.env.cleanerLogOnTerminal, true);
const cleanerLogFormat = checkArg(process.env.cleanerLogFormat, "maincleaner");
const cleanerLogLevel = checkArg(process.env.cleanerLogLevel, 3);

const main = async () =>
{
    try
    {
        const cleaner = new Cleaner(cleanerFee, cleanerlogFile, cleanerThreshold, cleanerLogLevel, cleanerLogOnDisk, cleanerLogOnTerminal, cleanerLogFormat);
        let pippo = await cleaner.clean();
    }
    catch(err)
    {
        log.error("maincleaner: " + err);
    }
}

main();