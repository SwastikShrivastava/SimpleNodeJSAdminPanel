var express = require('express'),
    app = express(),
    session = require('express-session');

var path = require("path");
var bodyParser = require('body-parser')
var cors = require('cors')
var request = require("request");




app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/public", express.static(__dirname));

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));



var auth = function(req, res, next) {
  if (req.session && req.session.user == "codedude" && req.session.admin)
    return next();
  else
    return res.redirect('/login');
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
  if(!req.body.username || !req.body.password)
  {
    res.send("Wrong");
  }
  else if (req.body.username == "swastik" && req.body.password == "okay")
  {
    req.session.user = "swastik";
    req.session.admin = true;
    res.redirect('/panel');
  }
  else{
    res.send("Wrong");
  }
});




app.post('/getBalance',function(req,res){


var bal;
var options = { method: 'POST',
                      url: 'http://18.220.204.121:9326/acntBalance',
                      headers: 
                       { 'postman-token': '297313bf-d5e7-335d-37dc-1edebf764eaf',
                         'cache-control': 'no-cache',
                         'content-type': 'application/x-www-form-urlencoded' },
                      form: 
                       { apikey: 'ironmandiesininfinityWars',
                         address: req.body.toaccount } 
             };

             //console.log(req.body.toaccount);

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  //console.log(JSON.parse(body).tokenBalance);
  bal = body;
  res.send(bal)

});



});



app.get('/panel',auth,function(req,res){
  res.sendFile(path.join(__dirname+'/panel.html'));
})
 
app.listen(3000);
console.log("app running at http://localhost:3000");