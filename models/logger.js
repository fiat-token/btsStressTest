'use strict'

const { promisify } = require('util');
const { appendFile } = require('fs');
const appendPromisified = promisify(appendFile);
const consoleLogPromisified = promisify( (data) => { return console.log(data) } );

class Logger
{
    constructor(file = 'logger.log', format = '', actualLevel = 3, onDisk = false, onTerminal = true) 
    {
        this.file = file;
        this.format = format;
        this.actualLevel= actualLevel;
        this.onDisk = onDisk;
        this.onTerminal = onTerminal;
        this.listLevel = {1: "ERROR", 2: "WARN", 3: "INFO", 4:"DEBUG", 5: "TRACE"}; 
    }

    async append(file, logLevel, data)
    {
        try
        {
            if(logLevel <= this.actualLevel)
            {
                const str = "[ time:" + new Date() + " pid:" + process.pid + " " + this.listLevel[logLevel] + ": " + this.format + " ] " + data;
                const promises = [];
                if(this.onDisk) promises.push(appendPromisified(file, str + "\n"));
                if(this.onTerminal) promises.push(consoleLogPromisified(str));
                await Promise.all(promises);
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