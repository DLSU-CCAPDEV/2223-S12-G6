const express = require('express');
const dotenv = require('dotenv');
const bodyParser =  require("body-parser");
const hbs = require('hbs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const routes = require('./routes/routes.js');

const app = express();
app.use(bodyParser.urlencoded({extended:false}));

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
  console.log("Running Server at " + hostname+ ':' + port);
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
