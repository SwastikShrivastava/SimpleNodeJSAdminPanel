var config  = require('./config.json')
var atob = require('atob');
var express = require('express'),
    app = express(),
    session = require('express-session');

var path    = require("path");
var bodyParser = require('body-parser');
var request = require('request');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/public", express.static(__dirname));

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: config.cookieAge }
}));


function checkAdmin(username,password){
  new Promise(function(resolve,reject){
    
  });
}





var auth = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.redirect('/login');
};

var auth_su = function(req, res, next) {
  if (req.session && req.session.user == config.su_admin.su_admin_username && req.session.suadmin)
    return next();
  else
    return res.redirect('/login');
};

var auth_su_api = function(req, res, next) {
  if (req.session && req.session.user == config.su_admin.su_admin_username && req.session.suadmin)
    return next();
  else
    res.send("0");
};


app.get('/logout',function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/login',function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
  if(req.session)
  {
    req.session.destroy();
  }
});

app.post('/login',function(req,res){
  console.log(req.body.username)
  fs.readFile("./admin_details.json",function(err,data){
        var admin_details = JSON.parse(data);
        if(admin_details[req.body.username]!=undefined)
        {
          if(admin_details[req.body.username]==req.body.password)
          {
            req.session.user = req.body.username;
            req.session.admin = true;
            res.send('session');
          }
          else
          {
            res.send("WrongS");;
          }
        }
        else
        {
          res.send("WrongS");;
        }
    });
});

app.get('/panel',auth,function(req,res){
  res.sendFile(path.join(__dirname+'/panel.html'));
});

app.get('/youAreSuperAdmin',function(req,res){
  if(req.url.split("?").length <2)
  {
    res.redirect('/login');
  }
  else{
      var hash = req.url.split("?").pop()
      var data = atob(hash);
      if(data.search("=")!=-1){
        data = data.split("=").pop();
        var date =new Date().valueOf();
        if(date-data>10000)
        {
          res.redirect('/login');
        }
        else{
         res.sendFile(path.join(__dirname+'/super_index.html'));
        }
      }
      else{
        res.redirect('/login');
      }
    }
});

app.post('/superLogin',function(req,res){
  console.log(req.body.username)
  if(!req.body.username || !req.body.password)
  {
    res.send("Wrong");
  }
  else if (req.body.username == config.su_admin.su_admin_username && req.body.password == config.su_admin.su_admin_password)
  {
    if(req.body.time > config.su_admin.time_to_login)
    {
      res.send('login');
    }
    else
    {
      req.session.user = config.su_admin.su_admin_username;
      req.session.suadmin = true;
      res.send('superPanel');
    }
  }
  else{
    res.send("Wrong");
  }
});

app.get('/superPanel',auth_su,function(req,res){
  res.sendFile(path.join(__dirname+'/suPanel.html'));
});



/////////////////////////////////////////// SUPER ADMIN API's ////////////////////////////////////////////////////

app.post('/su/transfer',auth_su,function(req,res){
  var options = { method: 'POST',
                  url: config.b_chain_ip + 'transfer',
                  headers: 
                   { 'cache-control': 'no-cache',
                     'content-type': 'application/x-www-form-urlencoded' },
                  form: { apikey: config.authkey,
                          toaccount: req.body.t_accnt,
                          value: req.body.val 
                        } 
                };

                request(options, function (error, response, body) {
                  if (error)
                  {
                    res.send("0")
                  }
                  else{
                    res.send(body)
                  }
                });
});

app.post('/su/transferFrom',auth_su,function(req,res){
  var options = { method: 'POST',
                  url: config.b_chain_ip + 'transferFrom',
                  headers: 
                   { 'cache-control': 'no-cache',
                     'content-type': 'application/x-www-form-urlencoded' },
                  form: { apikey: config.authkey,
                          fromAccount: req.body.tf_f_accnt,
                          toAccount: req.body.tf_t_accnt ,
                          value:req.body.val
                        } 
                };

                request(options, function (error, response, body) {
                  if (error) throw new Error(error);

                  console.log(body);
                  res.send(body);
                });
});


app.post('/su/mintIn',auth_su,function(req,res){
  var options = { method: 'POST',
                  url: config.b_chain_ip + 'mintToken',
                  headers: 
                   { 'cache-control': 'no-cache',
                     'content-type': 'application/x-www-form-urlencoded' },
                  form: { apikey: config.authkey,
                          toaccount: req.body.m_accnt,
                          value: req.body.val
                        } 
                };

                request(options, function (error, response, body) {
                  if (error)
                  {
                    res.send("0")
                  }
                  else{
                    res.send(body)
                  }
                });
});


app.post('/su/burnFrom',auth_su_api,function(req,res){
  

    var options = { method: 'POST',
                  url: config.b_chain_ip + 'burnFrom',
                  headers: 
                   { 'cache-control': 'no-cache',
                     'content-type': 'application/x-www-form-urlencoded' },
                  form: { apikey: config.authkey,
                          fromAccount: req.body.bf_accnt,
                          value:req.body.val
                        } 
                };

                request(options, function (error, response, body) {
                  if (error) throw new Error(error);

                  console.log(body);
                  res.send(body);
                });

});

app.post('/su/checkFrozen',auth_su_api,function(req,res){
      var options = { method: 'POST',
                      url: config.b_chain_ip +'checkFrozen',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { apikey: config.authkey, 
                              targetAccount: req.body.cf_accnt } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });
});


app.post('/su/freezeAccnt',auth_su_api,function(req,res){
      var options = { method: 'POST',
                      url: config.b_chain_ip +'freezeAccount',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { apikey: config.authkey, 
                              targetAccount: req.body.fa_accnt } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });
});


app.post('/su/transferOwnership',auth_su_api,function(req,res){
      var options = { method: 'POST',
                      url: config.b_chain_ip +'transferOwnership',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { apikey: config.authkey, 
                              targetAccount: req.body.top_accnt } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });
});

app.post('/su/getOwnerBalance',auth_su_api,function(req,res){
  
    var options = { method: 'POST',
    url: config.b_chain_ip + 'ownerBalance',
    headers: 
     { 'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
      if (error)
      {
        res.send("0")
      }
      else{
        res.send(body)
      }
    });

});

app.post('/su/getOwnerAccnt',auth_su_api,function(req,res){
  
    var options = { method: 'POST',
      url: config.b_chain_ip +'ownerAccount',
      headers: 
       { 'postman-token': 'e14b9c16-1155-e03a-f6bc-add270c3b510',
         'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error)
        {
          res.send("0")
        }
        else{
          res.send(body)
        }
    });

});




app.post('/su/getTotalSupply',auth_su_api,function(req,res){
  
    var options = { method: 'POST',
      url: config.b_chain_ip +'totalSupply',
      headers: 
       { 'postman-token': 'e14b9c16-1155-e03a-f6bc-add270c3b510',
         'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error)
        {
          res.send("0")
        }
        else{
          res.send(body)
        }
    });

});

app.post('/su/newUser',auth_su_api,function(req,res){
  fs.readFile('./admin_details.json',function(err,data){
    var json_data = JSON.parse(data);
    console.log(json_data)
    json_data[req.body.user] = req.body.pass;
    fs.writeFile('./admin_details.json',JSON.stringify(json_data),(err)=>{
      res.send("1")
    });
  });

});

app.post('/su/removeUser',auth_su_api,function(req,res){
  fs.readFile('./admin_details.json',function(err,data){
    var json_data = JSON.parse(data);
    console.log(json_data)
    delete json_data[req.body.user]
    fs.writeFile('./admin_details.json',JSON.stringify(json_data),(err)=>{
      res.send("1")
    });
  });

});




///////////////////////////////////////////////////// ADMIN API's////////////////////////////////////////////


app.post('/a/getRecentTransactionReq',auth,function(req,res){

  var options = { method: 'GET',
      url: config.dashboard_ip +'getTxListForAdmin',
      headers: 
       { 'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error)
        {
          res.send("0")
        }
        else{
          res.send(body)
        }
    });

});







app.post('/a/performTxDollarToSIP',auth,function(req,res){

  console.log("Dollar to sip request:")
  var options = { method: 'POST',
                      url: config.b_chain_ip +'dollarToSip',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { amt: req.body.amt, 
                              addr: req.body.addr,
                              user: req.body.user,
                              cnav:req.body.cnav
                            } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        console.log("Sending Error!")
                        res.send("0")
                      }
                      else{
                        console.log("Sending Success!")
                        res.send(body)
                      }
                    });

});


app.post('/a/performTxSIPToETH',auth,function(req,res){

  var options = { method: 'POST',
                      url: config.b_chain_ip +'sipToEther',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                       form: { amt: req.body.amt, 
                              addr: req.body.addr,
                              pKey: req.body.pKey,
                              cnav:req.body.cnav
                            } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });

});


app.post('/a/performTxETHToSIP',auth,function(req,res){

  var options = { method: 'POST',
                      url: config.b_chain_ip +'etherToSip',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { amt: req.body.amt, 
                              addr: req.body.addr,
                              pKey: req.body.pKey,
                              cnav:req.body.cnav
                            } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });

});


app.post('/a/performTxETHToETH',auth,function(req,res){

  var options = { method: 'POST',
                      url: config.b_chain_ip +'etherToEther',
                      headers: 
                       { 'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: { amt: req.body.amt, 
                              addr: req.body.addr,
                              pKey: req.body.pKey,
                              d_addr:req.body.d_addr
                            } 

                    };

                    request(options, function (error, response, body) {
                      if (error)
                      {
                        res.send("0")
                      }
                      else{
                        res.send(body)
                      }
                    });

});


app.post('/a/completeTx',auth,function(req,res){

  var options = { method: 'POST',
      url: config.dashboard_ip +'completeTransaction',
      headers: 
       { 'Cache-Control': 'no-cache',
         'Content-Type': 'application/x-www-form-urlencoded' },
      form: { TID: req.body.TID, hash: req.body.hash  } };

    request(options, function (error, response, body) {
      if (error){
        res.send("0");
      }
      else
      {
        res.send(body);
      }
    });

});

////////////////////////////////////////////// SET VALUES /////////////////////////////////////////////////////




app.post('/su/setCNAV',auth_su_api,function(req,res){
    var options = { method: 'POST',
      url: config.dashboard_ip +'currentCNAV',
      headers: 
       { 'Cache-Control': 'no-cache',
         'Content-Type': 'application/x-www-form-urlencoded' },
      form: { CNAV: req.body.cnav } };

    request(options, function (error, response, body) {
      if (error){
        res.send(error);
      }
      else
      {
        res.send(body);
      }
    });

});


app.post('/su/setDL',auth_su_api,function(req,res){
    var options = { method: 'POST',
      url: config.dashboard_ip +'setDailyPercent',
      headers: 
       { 'Cache-Control': 'no-cache',
         'Content-Type': 'application/x-www-form-urlencoded' },
      form: { dailyPercent: req.body.dP } };

    request(options, function (error, response, body) {
      if (error){
        res.send(error);
      }
      else
      {
        res.send(body);
      }
    });

});


app.post('/su/getCNAV',function(req,res){
  console.log("here");
    var options = { method: 'GET',
      url: config.dashboard_ip +'getCNAV',
      headers: 
       { 'Cache-Control': 'no-cache',
         'Content-Type': 'application/x-www-form-urlencoded' },
      form: { }
       };

    request(options, function (error, response, body) {
      if (error){
        console.log("Err",error);
        res.send(error);
      }
      else
      {
        console.log("S:",body);
        res.send(body);
      }
    });

});


app.post('/su/getDailyPercent',function(req,res){
    var options = { method: 'GET',
      url: config.dashboard_ip +'getDailyPercent',
      headers: 
       { 'Cache-Control': 'no-cache',
         'Content-Type': 'application/x-www-form-urlencoded' },
      form: { }
       };

    request(options, function (error, response, body) {
      if (error){
        res.send(error);
      }
      else
      {
        res.send(body);
      }
    });

});





app.listen(3000);
console.log("app running at http://localhost:3000");