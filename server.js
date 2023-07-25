const express = require('express');
const dotenv = require('dotenv');
const mongodb = require('mongodb');
const fs = require('fs');
const bodyParser =  require("body-parser");
const controller = require("./controllers/controller.js");
const { error } = require('console');
const hbs = require('hbs');
const { randomInt } = require('crypto');
loggedin = false;
uname = null;
avatar = null;

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
    var pass = req.body.psw;
    var acc = await findDocument({name:uname,pass:pass},{_id:0});
    try
    {
      avatar = acc.pic;
    }catch(error)
    {
      res.render('login',{
        error: "Incorrect Username or Password"
      })
    }
    
    console.log(uname +" " + pass+ " " + acc);
    if(acc!=null)
    {
      loggedin = true;
      res.render('index',
          {
              lin:"editProfile",
              user:req.body.uname,
              picture:avatar
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
      user:uname,
      picture:avatar
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
app.get('/editProfile', async function(req,res)
{
  await client.connect();
  var document = await client.db('local').collection('accounts').findOne({name:uname});
  var collections = await client.db('local').listCollections().toArray();
  var reviews = [];
  for(i=0;i<collections.length;i++)
  {
    var rev = await client.db('local').collection(collections[i].name).find({user:uname}).toArray();
    reviews = reviews.concat(rev);
  }
  console.log(reviews);

  await client.close();
  res.render('editProfile',
  {
    pic:document.pic,
    name:document.name,
    email:document.email,
    desc:document.desc,
    review: reviews
  });
  

});
app.get('/register',controller.register);
app.post('/login', async function(req,res)
{
    console.log("Registering...");
    await client.connect();

    var email = req.body.email;
    var name = req.body.uname;
    var pass = req.body.psw;
    var pic = req.body.avatar;
    var desc = req.body.desc;
    var document =
    {
      email: email,
      name : name,
      pass : pass,
      pic : pic,
      desc: desc
    }

    console.log(document);

    var msg = "Error! Email or Username already taken!";
    var sameEmail = await client.db('local').collection('accounts').findOne({email:email});
    var sameName = await client.db('local').collection('accounts').findOne({name:name});
    
    if(sameEmail===null && sameName===null)
    {
      await createDocument("accounts",document);
      console.log("Created new user " + name + " linked to " + email);
      res.render('login');
    }
    else
    {
      res.render('register',
      {
        msg:msg,
      })
    }

    
});
app.get('/ReviewForUserAccessOnly', async function(req,res)
{

    var store = req.query.storeName;
    console.log(req.query.storeName);
    if(loggedin)
      var link = "ReviewForUserAccessOnly";
    else
      var link = "login";

    await client.connect();
    var doc =
    {
      user:uname,
    }
    await client.db('local').collection(store).updateMany({user:uname},{$set:{hidden:''}});
    await client.db('local').collection(store).updateMany({$or:[{user:{$ne:uname}}]},{$set:{hidden:'hidden'}});
    var reviews = await client.db("local").collection(store).find().toArray();

    res.render('ReviewForUserAccessOnly',{
      name : uname,
      storeName: store,
      loggedin: loggedin,
      link:link,
      review: reviews,
  });
  await client.close();
});
app.post('/ReviewForUserAccessOnly', async function(req,res)
{
    var store = req.body.storeName;
    var comment = req.body.commentInput;
    var picture = req.body.imageInput;
    var userPic = avatar;
    var rating = req.body.stars;

    await createCollection(store);
    var num = await randomInt(10);

    var repString = comment.replace(/\s+/g,'-');
    console.log(repString);
    var revID = uname+repString+num;
    var document = 
    {
      user:uname,
      comment: comment,
      picture : picture,
      rating : rating,
      helpcount : 0,
      num: num,
      userPic: userPic,
      hidden:'',
      revID: revID
    }
    
    console.log(num);
    await createDocument(store,document);

    await client.connect();
    var reviews = await client.db("local").collection(store).find().toArray();
    //console.log(reviews);
    //console.log(comment + rating + picture);
    res.render('ReviewForUserAccessOnly',
    {
      name : uname,
      storeName: store,
      loggedin: loggedin,
      link:  "ReviewForUserAccessOnly",
      review: reviews,
    });

    await client.close();
})
app.get('/update', async function(req,res)
{
  console.log(req.query);
  var name = req.query.name;
  var comm = req.query.comment;
  var num = parseInt(req.query.num);
  var store = req.query.store;
  var value = parseInt(req.query.value);

  var query = {
    user : name,
    comment: comm,
    num: num
  };

  await client.connect();
  var doc = await client.db('local').collection(store).findOne(query,{helpcount:1});
  var final = doc.helpcount+value;
  console.log(doc);
  
  await client.db('local').collection(store).updateOne(doc,{$set: {helpcount:final}});
  await client.close();
  res.type('text/plain');
  res.write(""+final);
  res.end();
})

app.get('/saveEdit', async function(req,res)
{
  var name = req.query.name;
  var comm = req.query.comment;
  var num = parseInt(req.query.num);
  var store = req.query.store;
  var value = req.query.value.toString();
  var strFR = value.replace(/\s+/g,'-');
  var revID = name+strFR+num;
  console.log("Saved " + revID + "|");
  var query = {
    user : name,
    comment: comm,
    num: num
  };

  console.log(query);
  await client.connect();
  var doc = await client.db('local').collection(store).findOne(query);
  console.log(doc);
  await client.db('local').collection(store).updateOne(query,{$set: {comment:value, revID:revID}});
  await client.close();

  res.type('text/plain');
  res.write(value.length+"+"+value+"+"+revID);
  res.end();
  
})

app.get('/delete', async function(req,res)
{
  var name = req.query.name;
  var comm = req.query.comment;
  var num = parseInt(req.query.num);
  var store = req.query.store;
  var value = req.query.value;

  var query = {
    revID : value
  };

  try
  {
    await client.connect();
    var doc = await client.db('local').collection(store).findOneAndDelete(query);
    console.log(doc);
    await client.close();
    res.type('text/plain');
    res.write("true");
  }
  catch(error)
  {
    console.log(error);
    res.type('text/plain');
    res.write("false");
  }
 

  
  res.end();
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
    account = await client.db("local").collection("accounts").findOne({name:document.name,pass:document.pass});
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
