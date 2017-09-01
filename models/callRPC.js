'use strict';

const fetchPromise = require('node-fetch');
const Logger = require('./logger');

class callRPC
{
    constructor(connectionParams) 
    {
        this.log = new Logger("callRPC.log", "callRPC.js");
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

    async fetch(method = '', param = 'null') // param = Array
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
            //console.log("counter: " + this.counter);
            const json = await res.json();
            if(json.error) throw new Error(json.error.message);
            return json.result;
        }
        catch(err)
        {
            this.log.error("fetch-" + method + ": " + err);
        }
    }

    getBasicAuth (user = '', pass = '')
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
    
    async listunspent() { try { return await this.fetch('listunspent', {})} catch(err) { this.log.error("listunspent: " + err);} };
    async getblock(hash = '') { try { return await this.fetch('getblock', hash)} catch(err) { this.log.error("getblock: " + err);} };
    async getblockcount() { try { return await this.fetch('getblockcount')} catch(err) { this.log.error("getblockcount: " + err);} };
    async getblockhash(index) { try { return await this.fetch('getblockhash', index)} catch(err) { this.log.error("getblockhash: " + err);} }; // index: Array
    async getblockheader(hash = '') { try { return await this.fetch('getblockheader', hash)} catch(err) { this.log.error("getblockheader: " + err);} };
    async getdifficulty() { try { return await this.fetch('getdifficulty')} catch(err) { this.log.error("getdifficulty: " + err);} };
    async gettxout(txid = '', n = 0) { try { return await this.fetch('gettxout', [txid, n])} catch(err) { this.log.error("gettxout: " + err);} };
    async gettxoutsetinfo(txid = '', n = 0) { try { return await this.fetch('gettxoutsetinfo')} catch(err) { this.log.error("gettxoutsetinfo: " + err);} };
    async verifychain() { try { return await this.fetch('verifychain')} catch(err) { this.log.error("verifychain: " + err);} };
    async verifytxoutproof(proof = '') { try { return await this.fetch('verifytxoutproof', proof)} catch(err) { this.log.error("verifytxoutproof: " + err);} };
    async decoderawtransaction(hexstring = '') { try { return await this.fetch('decoderawtransaction', hexstring)} catch(err) { this.log.error("decoderawtransaction: " + err);} };
    async decodescript(hex = '') { try { return await this.fetch('decodescript', hex)} catch(err) { this.log.error("decodescript: " + err);} };
    async getrawtransaction(txid = '') { try { return await this.fetch('getrawtransaction', txid)} catch(err) { this.log.error("getrawtransaction: " + err);} };
    async validateaddress(bitcoinaddress = '') { try { return await this.fetch('validateaddress', bitcoinaddress)} catch(err) { this.log.error("validateaddress: " + err);} };
    async verifymessage(bitcoinaddress = '', signature = '', message = '') { try { return await this.fetch('verifymessage', [bitcoinaddress, signature, message])} catch(err) { this.log.error("verifymessage: " + err);} };
    async getnewaddress() { try { return await this.fetch('getnewaddress', [])} catch(err) { this.log.error("getnewaddress: " + err);} };
    async createrawtransaction(senders = [], recipients = {}) { try { return await this.fetch('createrawtransaction', [senders, recipients])} catch(err) { this.log.error("createrawtransaction: " + err);} };
    async signrawtransaction(hex= []) { try { return await this.fetch('signrawtransaction', hex)} catch(err) { this.log.error("signrawtransaction: " + err);} }; // hex: Array
    async sendrawtransaction(hex = []) { try { return await this.fetch('sendrawtransaction', hex)} catch(err) { this.log.error("sendrawtransaction: " + err);} }; // hex: Array
    async generate(blocks = 1) { try { return await this.fetch('generate', blocks)} catch(err) { this.log.error("generate: " + err);} }; 
    async getmempoolinfo() { try { return await this.fetch('getmempoolinfo', [])} catch(err) { this.log.error("getmempoolinfo: " + err);} };
}

module.exports = callRPC;