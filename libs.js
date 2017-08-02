'use strict';

const debug = require('debug')('libs');
const { promisify } = require('util');
const { appendFile } = require('fs');
const { exec } = require('child_process');
const readline = require('readline');

const execPromisified = promisify(exec);
const appendPromisified = promisify(appendFile);


const map = (array, transform) =>
{
    const mapped = [];
    for (const elem of array)
    {
        mapped.push(transform(elem));
    }
    return mapped;
}

const filter = (array, test) =>
{
    const filtered = [];
    for (const elem of array)
    {
        if (test(elem))
        {
            filtered.push(elem);
        }        
    }
    return filtered;
}

const sip = (array, preChunk) =>
{
    let chunk = Number(preChunk);
    const sipped = [];
    for (let offset = 0; offset < array.length; offset += chunk) 
    {
        sipped.push(array.slice(offset, offset + chunk));
    }
    return sipped;
}

const range = (start, stop, step) =>
{

    if (!stop) 
    {
        // one param defined
        stop = start;
        start = 0;
    }

    if (!step) step = 1;
    {
        
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) 
    {
        return [];
    }

    const result = [];

    for (let i = start; step > 0 ? i < stop : i > stop; i += step) 
    {
        result.push(i);
    }

    return result;
}

const get = async (cmd) =>
{
    let ret = {};
    try
    {
        ret = await execPromisified(cmd + ' | tr -d \"\\012\"', {maxBuffer: 1024 * 50000});
        //  tr -d "\012" è il chomp del perl, serve per mozzare il "\n", ossia l'accapo
        // potrei usare spawn e andare di chunk, ma ho trovato dei problemi. Setto il buffer elevato per via di "bcreg listunspent"
        if(ret.stderr)
        {
            console.log("stderr of " + cmd + " is: " + ret.stderr);
        }
    }
    catch(err)
    {
        console.log("Error from get: " + err);
    }
    return ret.stdout;
}

const log = async (file, data) =>
{
    try
    {
       await appendPromisified(file, data);
    }
    catch(err)
    {
        console.log("Error from log:" + err);
    }
}

const checkArg = (arg, def) =>
{
    try
    {
        if(arg == "false") arg = false;
        const data = def.constructor(typeof arg === "undefined" ? def : arg);
        return data;
    }
    catch(err)
    {
        console.log("error from checkArg: " + err);
    }
}

const loading = (line) =>
{
    readline.clearLine(process.stdout, 0);  // clear current text
    readline.cursorTo(process.stdout, 0);  // move cursor to beginning of line
    process.stdout.write(line);
}



module.exports = {
    map,
    range,
    get,
    log,
    filter,
    sip,
    checkArg,
    loading
}