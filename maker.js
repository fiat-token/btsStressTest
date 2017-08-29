'use strict';

const debug = require('debug')('mainmaker');
const Maker = require('./models/maker');
const { checkArg } = require('./libs');
require('dotenv').load();

const makerfee = checkArg(process.env.makerfee, 0.00000001);
const makerLogFile = checkArg(process.env.makerLogFile, "maker.log");
const makerQuantity = checkArg(process.env.makerQuantity, 1);
const makerThreshold = checkArg(process.env.makerThreshold, 0.01);
const makerLogOnDisk = checkArg(process.env.makerLogOnDisk, false);
const makerLogOnTerminal = checkArg(process.env.makerLogOnTerminal, true);
const makerLogFormat = checkArg(process.env.makerLogFormat, "mainmaker");
const makerLogLevel = checkArg(process.env.makerLogLevel, 3);

const main = async () =>
{
    try
    {
        const maker = new Maker(makerfee, makerLogFile, makerQuantity, makerThreshold, makerLogLevel, makerLogOnDisk, makerLogOnTerminal, makerLogFormat);
        await maker.make();
    }
    catch(err)
    {
        console.log("Error from mainmaker: " + err);
    }
}

main();