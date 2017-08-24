'use strict';

//libs
const Logger = require('./models/logger');
const Cleaner = require('./models/cleaner');
const { checkArg, map } = require('./libs');
require('dotenv').load();

//default params
const logFile = checkArg(process.env.logFileCleaner, "cleaner.log");
const format = "maincleaner";
const log = new Logger(logFile, format);

const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const cleanerThreshold = checkArg(process.env.cleanerThreshold, 0.01);
const dimBlock = checkArg(process.env.dimBlock, 250);

//main
const main = async () =>
{
    try
    {
        const cleaner = new Cleaner(fee, logFile, cleanerThreshold, dimBlock);
        await cleaner.clean();
    }
    catch(err)
    {
        log.error("main: " + err);
    }
}

main();