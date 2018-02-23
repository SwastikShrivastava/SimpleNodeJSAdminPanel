var config  = require('./config_aws.json')
var express = require('express');
var Web3 = require('web3');
var bodyParser = require('body-parser');
var fs = require('fs');
require('dotenv').config();
var Tx = require('ethereumjs-tx');
            
function financialMfil(numMfil) {
    return Number.parseFloat(numMfil / 1e3).toFixed(3);
}


var web3 = new Web3(new Web3.providers.HttpProvider(config.infura));
var app = express();

var abiArray = config.cntrct_details.c_abi;
let contractAddress = config.cntrct_details.c_addr;

var contract = new web3.eth.Contract(abiArray,contractAddress);
var myAddress = config.admin.a_addr;

var gasPrice = web3.eth.gasPrice;
var gasLimit = 90000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/ethAcnt',function(req,res){


        var token = req.body.apikey;
        var user_name = req.body.username;
        console.log(token);

        if(token == config.authkey){ 
                var acntCreate = web3.eth.accounts.create();
                acntCreate.status = 125367;
                acntCreate.username = user_name;
                console.log(acntCreate);
                res.send(acntCreate);
                var tm = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

                acntCreate.time = tm;


                fs.appendFile('Accountlog.json', '\n'+ JSON.stringify(acntCreate), function (err){
                                 if(!err){
                                        }
                         });
        }
        else{
                var j = {status : 300};
                res.send(j);
        }

});

app.post('/acntBalance',function (req,res){

        var token = req.body.apikey;
        var address = req.body.address;
        var  latest;
        var ercBal, ethBal;
        console.log(typeof address);
        if(token == config.authkey){
            web3.eth.getBlockNumber().then(function(result){
                    latest = result;       
                    contract.methods.balanceOf(address).call().then(function (result) {

                    ercBal = result;
                    web3.eth.getBalance(address,latest,(err,res1)=>{
                        if(err)
                            {
                                console.log(err);
                                var err1 = { 'status' : 300};
                                res.send(err1);
                            }
                        else
                            {
                                ethBal = res1;
                                var Bal = {'etherBalance' : ethBal,'tokenBalance' : ercBal, 'Address' : address, 'status' : 125367 };
                                res.send(Bal);
                            }

                        });

                    });

            });

        }
       else 
       {
            var err = { 'status' : 300};
            res.send(err);
       }
 });


app.post('/totalSupply',function (req,res){

    var token = req.body.apikey;

    if(token == config.authkey)
    {
        const main = async () => {

            contract.methods.totalSupply().call().then(function(res){
                console.log(res);
            }).catch(function(err) {
                console.log(err);
                var err1 = { 'status' : 300};
                res.send(err1);
            });
        }
        main();
    }
    else
    {
            var err = { 'status' : 300};
            res.send(err);

    }

}); 

app.post('/transfer',function (req,res){ 

        var token = req.body.apikey;    
        var destAddress = req.body.toaccount;
        var transferAmount = req.body.value;

        if(token == config.authkey){

                const main = async () => {

                var count = await web3.eth.getTransactionCount(myAddress);
                console.log(`num transactions so far: ${count}`);

                var balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance before send: ${financialMfil(balance)} MFIL\n------------------------`);

                var gasPriceGwei = 3;
                var gasLimit = 3000000;

                var chainId = 3;
                var rawTransaction = {
                    "from": myAddress,
                    "nonce": "0x" + count.toString(16),
                    "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
                    "gasLimit": web3.utils.toHex(gasLimit),
                    "to": contractAddress,
                    "value": "0x0",
                    "data": contract.methods.transfer(destAddress, transferAmount).encodeABI(),
                    "chainId": chainId
                };
                console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

                var privKey = new Buffer(config.admin.p_key, 'hex');
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                var serializedTx = tx.serialize();

                console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
                var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

                console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);

                balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance after send: ${financialMfil(balance)} MFIL`);

                res.send(balance);

            }
            main();

        }else
            {
                var err = { 'status' : 300};
                res.send(err);

            }

});




app.post('/transferFrom',function (req,res){ 

        var token = req.body.apikey;    
        var fromAddress = req.body.fromAccount;
        var destAddress = req.body.toAccount;
        var transferAmount = req.body.value;

        if(token == config.authkey){

                const main = async () => {
              
                var count = await web3.eth.getTransactionCount(myAddress);
                console.log(`num transactions so far: ${count}`);

                var balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance before send: ${financialMfil(balance)} SIP\n------------------------`);

                var gasPriceGwei = 3;
                var gasLimit = 3000000;

                var chainId = 3;
                var rawTransaction = {
                    "from": fromAddress,
                    "nonce": "0x" + count.toString(16),
                    "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
                    "gasLimit": web3.utils.toHex(gasLimit),
                    "to": contractAddress,
                    "value": "0x0",
                    "data": contract.methods.transferFromAny(fromAddress, destAddress, transferAmount).encodeABI(),
                    "chainId": chainId
                };
                console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

                var privKey = new Buffer(config.admin.p_key, 'hex');
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                var serializedTx = tx.serialize();

                console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
                var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

                console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);

                balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance after send: ${financialMfil(balance)} MFIL`);
            }
            main();

        }else
            {
                var err = { 'status' : 300};
                res.send(err);

            }

});


app.post('/mintToken',function (req,res){ 

        var token = req.body.apikey;    
        var destAddress = req.body.toaccount;
        var transferAmount = req.body.value;
        
        if(token == config.authkey){

                const main = async () => {
      
                var count = await web3.eth.getTransactionCount(myAddress);
                console.log(`num transactions so far: ${count}`);

                var balance = await contract.methods.balanceOf(myAddress).call();
                //console.log(`Balance before send: ${financialMfil(balance)} MFIL\n------------------------`);

                var gasPriceGwei = 3;
                var gasLimit = 3000000;

                var chainId = 3;
                var rawTransaction = {
                    "from": myAddress,
                    "nonce": "0x" + count.toString(16),
                    "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
                    "gasLimit": web3.utils.toHex(gasLimit),
                    "to": contractAddress,
                    "value": "0x0",
                    "data": contract.methods.mintToken(destAddress, transferAmount).encodeABI(),
                    "chainId": chainId
                };
                console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

                var privKey = new Buffer(config.admin.p_key, 'hex');
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                var serializedTx = tx.serialize();

                console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
                var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

                console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);

                balance = await contract.methods.balanceOf(myAddress).call();
                //console.log(`Balance after send: ${financialMfil(balance)} MFIL`);
            }
            main();

            res.send(receipt.logs.transactionHash);

        }else
            {
                var err = { 'status' : 300};
                res.send(err);

            }

});


app.post('/burnFrom',function (req,res){ 

        var token = req.body.apikey;    
        var fromAddress = req.body.fromAccount;
        var burnAmount = req.body.value; 

        if(token == config.authkey){

                const main = async () => {

              
                var count = await web3.eth.getTransactionCount(myAddress);
                console.log(`num transactions so far: ${count}`);

                var balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance before send: ${financialMfil(balance)} SIP\n------------------------`);

                var gasPriceGwei = 3;
                var gasLimit = 3000000;

                var chainId = 3;
                var rawTransaction = {
                    "from": fromAddress,
                    "nonce": "0x" + count.toString(16),
                    "gasPrice": web3.utils.toHex(gasPriceGwei * 1e9),
                    "gasLimit": web3.utils.toHex(gasLimit),
                    "to": contractAddress,
                    "value": "0x0",
                    "data": contract.methods.burnFrom(fromAddress, burnAmount).encodeABI(),
                    "chainId": chainId
                };
                console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

                var privKey = new Buffer("1b94bf1f66718899d0710e2cd6687f75e43e8647f5024b8d4dc6143138554939", 'hex');
                var tx = new Tx(rawTransaction);
                tx.sign(privKey);
                var serializedTx = tx.serialize();

                console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
                var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

                console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);

                balance = await contract.methods.balanceOf(myAddress).call();
                console.log(`Balance after send: ${financialMfil(balance)} MFIL`);
            }
            main();

        }else
            {
                var err = { 'status' : 300};
                res.send(err);

            }

});















app.listen(9326, ()=>{
        console.log('Running ...');
});






