'use strict'

const { promisify } = require('util');
const { appendFile } = require('fs');
const appendPromisified = promisify(appendFile);
const writePromisified = promisify( (data) => { return process.stdout.write(data, 'utf-8') } );
const { checkArg } = require('../libs');
require('dotenv').load();

//append format finale

class Logger
{
    constructor(file, format = '') 
    {
        this.file = file;
        this.format = format;
        this.actualLevel= checkArg(process.env.logLevel, 1);
        this.onDisk = checkArg(process.env.onDisk, false);
        this.onTerminal = checkArg(process.env.onTerminal, true);
        this.listLevel = {1: "ERROR", 2: "WARN", 3: "INFO", 4:"DEBUG", 5: "TRACE"}; 
    }

    async append(file, logLevel, data)
    {
        try
        {
            if(logLevel <= this.actualLevel)
            {
                const str = "[ " + this.listLevel[logLevel] + ": TIME:" + Date.now() + " PID:" + process.pid + " " + this.format + " ] " + data + "\n";

                if(this.onDisk) await appendPromisified(file, str);
                if(this.onTerminal) process.stdout.write(str);
            }
        }
        catch(err)
        {
            console.log("Error from append:" + err);
        }
    }

    async error(data) { await this.append(this.file, 1, data); }
    async warn(data) { await this.append(this.file, 2, data); }
    async info(data) { await this.append(this.file, 3, data); }
    async debug(data) { await this.append(this.file, 4, data); }
    async trace(data) { await this.append(this.file, 5, data); }
}

module.exports = Logger;