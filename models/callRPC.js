'use strict';

const fetchPromise = require('node-fetch');
const Logger = require('./logger');

class callRPC
{
    constructor(connectionParams) 
    {
        this.log = new Logger("callRPC.log", "callRPC");
        this.user = connectionParams.user;
        this.pass = connectionParams.pass;
        this.header = { 'Authorization': this.getBasicAuth(this.user, this.pass) };
        this.socket = connectionParams.socket;
        this.counter = 0;
        
        this.log.info("user: " + this.user);
        this.log.info("pass: " + this.pass);
        this.log.info("header: " + JSON.stringify(this.header));
        this.log.info("socket: " + this.socket);
        this.log.info("counter: " + this.counter);
    }

    async fetch(method, param = 'null')
    {
        try
        {
            const bodyJSON =
            {
                method: method,
                params: param,
                id: this.counter++
            }
            const body = JSON.stringify(bodyJSON);
            const res = await fetchPromise(this.socket, { method: 'POST',  headers: this.header, body: body})
            const json = await res.json();
            if(json.error) throw new Error(json.error.message);
            return json.result;
        }
        catch(err)
        {
            this.log.error("fetch: " + err);
        }
    }

    getBasicAuth (user, pass)
    {
        try
        {
            if(!user) throw new Error("no user has been given");
            if(!pass) throw new Error("no password has been given");
    
            const strAuth = 'Basic ' + new Buffer(user + ':' + pass).toString('base64'); 
            return strAuth;
        }
        catch(err)
        {
            this.log.error("getBasicAuth: " + err);
        }
    }

    parseArgs(args)
    {
        const argsOnlyDefined = args.filter( (elem) => {return elem != '' &&  typeof elem != 'undefined'})
        return argsOnlyDefined;
    }

    async listunspent() { return await this.fetch('listunspent', {})};
    async getblock(hash) { return await this.fetch('getblock', hash)};
    async getblockcount() { return await this.fetch('getblockcount')};
    async getblockhash(index) { return await this.fetch('getblockhash', index)}; // index: Array
    async getblockheader(hash) { return await this.fetch('getblockheader', hash)};
    async getdifficulty() { return await this.fetch('getdifficulty')};
    async gettxout(txid, n) { return await this.fetch('gettxout', [txid, n])};
    async gettxoutsetinfo(txid, n) { return await this.fetch('gettxoutsetinfo')};
    async verifychain() { return await this.fetch('verifychain')};
    async verifytxoutproof(proof) { return await this.fetch('verifytxoutproof', proof)};
    async decoderawtransaction(hexstring) { return await this.fetch('decoderawtransaction', hexstring)};
    async decodescript(hex) { return await this.fetch('decodescript', hex)};
    async getrawtransaction(txid) { return await this.fetch('getrawtransaction', txid)};
    async validateaddress(bitcoinaddress) { return await this.fetch('validateaddress', bitcoinaddress)};
    async verifymessage(bitcoinaddress, signature, message) { return await this.fetch('verifymessage', [bitcoinaddress, signature, message])};
    async getnewaddress() { return await this.fetch('getnewaddress', [])};
    async createrawtransaction(senders, recipients) { return await this.fetch('createrawtransaction', [senders, recipients])};
    async signrawtransaction(hex) { return await this.fetch('signrawtransaction', hex)}; // hex: Array
    async sendrawtransaction(hex) { return await this.fetch('sendrawtransaction', hex)}; // hex: Array
    async generate(blocks) { return await this.fetch('generate', blocks)}; // hex: Array
    async getmempoolinfo() { return await this.fetch('getmempoolinfo')};
}

module.exports = callRPC;