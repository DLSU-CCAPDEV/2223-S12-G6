const express = require('express');
const dotenv = require('dotenv');
const mongodb = require('mongodb');
const fs = require('fs');
const bodyParser =  require("body-parser");
const controller = require("./controllers/controller.js");
const { error } = require('console');
const { create } = require('hbs');
loggedin = false;
uname = null;

//const url = "mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority";
const url = "mongodb://127.0.0.1:27017/";

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

app.get('/',function(req,res){
  loggedin = false;
  res.render('index',{
    lin:"login",
    user:"LOGIN"
});
});
app.get('/login', controller.login);
app.post('/index', async function(req,res)
{
    uname = req.body.uname;
    pass = req.body.psw;
    acc = await findDocument({name:uname,pass:pass});
    console.log(uname +" " + pass+ " " + acc);
    if(acc!=null)
    {
      loggedin = true;
      res.render('index',
          {
              lin:"editProfile",
              user:req.body.uname,
          });
    }
    else
    {
      res.render('login',
      {
        error: "Incorrect Username or Password"
      });
    }
});
app.get('/index', function(req,res)
{
  if(uname!=null && loggedin==true)
  {
    res.render('index',
    {
      lin:"editProfile",
      user:uname
    });
  }
  else
  {
    res.render('index',
    {
      lin:"login",
      user:"LOGIN"
    })
  }
});
app.get('/editProfile',controller.Profile);
app.get('/register',controller.register);
app.post('/login', async function(req,res)
{
    console.log("Registering...");
    var email = req.body.email;
    var name = req.body.uname;
    var pass = req.body.psw;
    var document =
    {
      email: email,
      name : name,
      pass : pass,
    }

    await createDocument("accounts",document);
    console.log("Created new user " + name + " linked to " + email);
    res.render('login');
});
app.get('/ReviewForUserAccessOnly', function(req,res)
{

    var store = req.query.storeName;
    console.log(req.query.storeName);
    if(loggedin)
      var link = "ReviewForUserAccessOnly";
    else
      var link = "login";

    res.render('ReviewForUserAccessOnly',{
      storeName: store,
      loggedin: loggedin,
      link:link
  });
});
app.post('/ReviewForUserAccessOnly', async function(req,res)
{
    var store = req.body.storeName;
    var comment = req.body.commentInput;
    var picture = req.body.imageInput;
    var rating = req.body.stars;

    await createCollection(store);

    var document = 
    {
      user:uname,
      comment: comment,
      picture : picture,
      rating : rating
    }

    await createDocument(store,document);

    console.log(comment + rating + picture);
    res.render('ReviewForUserAccessOnly',
    {
      storeName: store,
      loggedin: loggedin,
      link:  "ReviewForUserAccessOnly"
    });
})

app.listen(port,hostname,function()
{
  console.log("Server listening at http://" + hostname + ":" +port );
})

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      console.log("Connecting...");
      await client.connect();
      console.log("Connected..!");
      // Send a ping to confirm a successful connection
      //await client.db("admin").command({ ping: 1 });
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
    await client.db("local").createCollection(collection);
  }catch(error)
  {
    console.log("Collection already created!");
  }
  finally{
    await client.close();
  } 
}

async function createDocument(collection,document)
{
  console.log(document);
  try
  {
    console.log("Connecting to Register...");
    await client.connect();
    console.log("Connected to Register!");
    await client.db("local").collection(collection).insertOne(document,{});
    console.log("Document Inserted");
  }catch(error){ console.log(error);}
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
    account = await client.db("local").collection("accounts").findOne({name:document.name,pass:document.pass},options);
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
