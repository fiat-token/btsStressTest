'use strict';
const { promisify } = require('util');
const { appendFile } = require('fs');
const execPromisified = promisify(exec);

const map = (array, transform) =>
{
    const mapped = [];
    for (const elem of array)
    {
        mapped.push(transform(elem));
    }
    return mapped;
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
    try
    {
        const { err, stdout, stderr } = await execPromisified(cmd, {maxBuffer: 1024 * 50000}); 
        // potrei usare spawn e andare di chunk, ma ho trovato dei problemi. Setto il buffer elevato per via di "bcreg listunspent"
        if(stderr)
        {
            console.log("stderr of " + cmd + " is: " + stderr);
        }

        return stdout;
    }
    catch(err)
    {
        throw Error(err);
    }
}

const log = async (file, data) =>
{
    const appendPromisified = promisify(appendFile);
    try
    {
       await appendPromisified(file, data);
    }
    catch(err)
    {
        console.error(err);
    }
}


module.exports = {
    map,
    range,
    get,
    log
}