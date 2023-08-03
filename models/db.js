const mongodb = require('mongodb');
const {randomInt} = require('crypto');

const url = "mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority";
const client = new mongodb.MongoClient(url, {
    serverApi:
    {
      version:mongodb.ServerApiVersion.v1,
      strict:true,
      deprecationErrors: true
    },
    useUnifiedTopology : true
  });

const dbname = "data";

const database = {

    createDocument : async function(document,collection)
    {
        await client.connect();
        await client.db(dbname).collection(collection).insertOne(document,{});
        await client.close();
    },

    regAcc : async function(document, callback)
    {
        await client.connect();
        var sameName    = await client.db(dbname).collection('accounts').findOne({name:document.username});
        var sameEmail   = await client.db(dbname).collection('accounts').findOne({email:document.email});
        await client.close();

        if(sameName===null && sameEmail===null && document.pass.length>8)
        {
            await this.createDocument(document,'accounts');
            return callback(true);
        }
        else
        {
            return callback(false);
        }
        
    },

    findAcc : async function(document,callback)
    {
        await client.connect();
        var acc = await client.db(dbname).collection('accounts').findOne(document);
        await client.close();
        return callback(acc);
    },

    getUserReviews : async function(user, callback)
    {
        await client.connect();
        var collections = await client.db(dbname).listCollections().toArray();
        var reviews = [];
        for(i=0;i<collections.length;i++)
        {
            var rev = await client.db(dbname).collection(collections[i].name).find({user:user}).toArray();
            reviews = reviews.concat(rev);
        }
        await client.close();
        return callback(reviews);
    },

    getStoreReviews : async function(collection,user,callback)
    {

        await client.connect();
        await client.db(dbname).collection(collection).updateMany({user:user},{$set:{hidden:''}});
        await client.db(dbname).collection(collection).updateMany({$or:[{user:{$ne:user}}]},{$set:{hidden:'hidden'}});
        var reviews = await client.db(dbname).collection(collection).find().toArray();
        await client.close();

        return callback(reviews);
    },

    createCollection : async function(collection)
    {
        await client.connect();
        try
        {
            await client.db(dbname).createCollection(collection);
        }
        catch(error)
        {
            console.log("Collection already Created!");
        }
        await client.close();
    },

    insertReview : async function(document,collection, callback)
    {
        await client.connect();

        document.num = randomInt(10);
        var regString = document.comment.replace(/\s+/g,'-');
        var revID = document.user+regString+document.num;
        document.revID = revID;
        console.log(document);

        try
        {
            await client.db(dbname).collection(collection).insertOne(document,{});
        }
        catch(error)
        {
            console.log("ERROR LIMAW");
        }
        
        var reviews = await client.db(dbname).collection(collection).find().toArray();
        await client.close();
        return callback(reviews);
    },

    updateRevCount : async function(document, value, collection, callback)
    {
        await client.connect();
        var doc = await client.db(dbname).collection(collection).findOne(document, {helpcount:1});
        console.log(doc);
        var final = doc.helpcount + value;
        await client.db(dbname).collection(collection).updateOne(document,{$set: {helpcount: final}});
        await client.close();
        
        return callback(final);
    },

    updateRevCom : async function(document,collection, comment, revID)
    {
        await client.connect();
        var doc = await client.db(dbname).collection(collection).findOne(document);
        await client.db(dbname).collection(collection).updateOne(document,{$set: {comment:comment,revID:revID}});
        await client.close();
    },

    deleteRev : async function(document, collection)
    {
        await client.connect();
        await client.db(dbname).collection(collection).findOneAndDelete(document);
        await client.close();
    }

}   

module.exports = database;