'use strict'

const Logger = require('./models/logger');


let a = "C:/Users/cmandracchia/Desktop/btcStressTest/ppp.txt";
let b = "formattone1";

const log1 = new Logger(a, b);
const pippo = async () =>
{
    await log1.error("err");
    await log1.warn("war");
    log1.debug("deb");
}

pippo();



