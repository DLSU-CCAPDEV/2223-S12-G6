const express = require('express');
const dotenv = require('dotenv');
const mongodb = require('mongodb');
const fs = require('fs');
const bodyParser =  require("body-parser");
const controller = require("./controllers/controller.js");
const { error } = require('console');
const hbs = require('hbs');
const { randomInt } = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
loggedin = false;
uname = null;
avatar = null;
const routes = require('./routes/routes.js');
const url = "mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority";
//const url = "mongodb://127.0.0.1:27017/";

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
const client = new mongodb.MongoClient(url, {
  serverApi:
  {
    version:mongodb.ServerApiVersion.v1,
    strict:true,
    deprecationErrors: true
  },
  useUnifiedTopology : true
});
const options = {
  projection: {_id :0, name:1,pass:1},  
}

dotenv.config();
var port = process.env.PORT;
var hostname  = process.env.HOSTNAME;

app.set('view engine', 'hbs');
app.use(express.static('public'));

app.use(session({
  name: 'bananaflavoredcookie',
  secret: 'bananaboi',
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 7,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
      mongoUrl: 'mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority'
  })
}));

app.use('/', routes);

app.listen(port,hostname,function()
{
  console.log("Server listening at http://" + hostname + ":" +port );
})

hbs.registerHelper('ifEquals', function(var1,var2,options)
{
  if(var1===var2)
  {
    return options.fn(this);
  }
  else
  {
    return options.inverse(this);
  }
});
