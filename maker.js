'use strict';

//libs
const debug = require('debug')('mainmaker');
const Maker = require('./models/maker');
const { checkArg } = require('./libs');

//default params
require('dotenv').load();

const fee = checkArg(process.env.fee, 0.00000001);
const quantity = checkArg(process.env.quantity, 1);
const logFile = checkArg(process.env.logFileMaker, "maker.log");
const elaborateThreshold = checkArg(process.env.elaborateThreshold, 50);
const maxTXs = checkArg(process.env.maxTXs, 100);

//main 
const main = async () =>
{
    try
    {
        const maker = new Maker(fee, logFile, quantity, elaborateThreshold, maxTXs);
        await maker.make();
    }
    catch(err)
    {
        console.log("Error from mainmaker: " + err);
    }
}

main();