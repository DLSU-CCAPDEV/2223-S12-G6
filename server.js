const express = require('express');
const dotenv = require('dotenv');
const mongodb = require('mongodb');
const fs = require('fs');
const bodyParser =  require("body-parser");
const controller = require("./controllers/controller.js");
const { error } = require('console');


const url = "mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
const client = new mongodb.MongoClient(url, {
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

app.get('/', controller.home);
app.get('/login', controller.login);
app.post('/index', async function(req,res)
{
    var uname = req.body.uname;
    var pass = req.body.psw;
    var acc = await findDocument({name:uname,pass:pass});
    console.log(uname +" " + pass+ " " + acc);
    if(acc!=null)
    {
      res.render('index',
          {
              lin:"editProfile",
              user:req.body.uname,
          });
    }
    else
    {
      res.redirect('/login');
    }
});

app.listen(port,hostname,function()
{
  console.log("Server listening at http://" + hostname + ":" +port );
})

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      await createCollection("accounts");
      await findDocument({name:"banana", pass:"1234"});
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close whens you finish/error
      await client.close();
      console.log("Client Closed");
    }
}
run().catch(console.dir);

async function createCollection(collection)
{
  
  try
  {
    await client.connect();
    await client.db("data").createCollection(collection);
  }catch(error)
  {
    console.log("Collection already created!");
  }
  finally{
    await client.close();
  } 
}

async function createDocument(document)
{
  
  try
  {
    await client.connect();
    await client.db("data").collection("accounts").createDocument(document);
  }catch(error){}
  finally
  {
    await client.close();
  }
}

async function findDocument(document)
{
 
  var account = null;
  try
  { 
    await client.connect();
    account = await client.db("data").collection("accounts").findOne({name:document.name,pass:document.pass},options);
    if(account != null)
      console.log("Account Found: Username: "+ account.name + " with password: " +account.pass);
    console.log(account);
  }catch(error){
    console.log(error);
    account = null;
  }
  finally
  {
    await client.close();
  }
  return account;
}
