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
    },

    getRatings : async function(callback)
    {
        
    try
    {   
        var totalRating = [0, 0, 0, 0, 0];
        await client.connect();
        var revs1 = await client.db(dbname).collection("JOLLIBEE").find().project({_id:0,rating:1}).toArray();
        var revs2 = await client.db(dbname).collection("MCDO").find().project({_id:0,rating:1}).toArray();
        var revs3 = await client.db(dbname).collection("KFC").find().project({_id:0,rating:1}).toArray();
        var revs4 = await client.db(dbname).collection("ATE RICA'S BACSILOG").find().project({_id:0,rating:1}).toArray();
        var revs5 = await client.db(dbname).collection("CANTEEN").find().project({_id:0,rating:1}).toArray();
        await client.close();
        revs1.forEach(rev=>
            {
                totalRating[0] = totalRating[0] + parseInt(rev.rating);
            })
        revs2.forEach(rev=>
            {
                totalRating[1] = totalRating[1] + parseInt(rev.rating);
            })
        revs3.forEach(rev=>
            {
                totalRating[2] = totalRating[2] + parseInt(rev.rating);
            })
        revs4.forEach(rev=>
            {
                totalRating[3] = totalRating[3] + parseInt(rev.rating);
            })
        revs5.forEach(rev=>
            {
                totalRating[4] = totalRating[4] + parseInt(rev.rating);
            })            
        
        totalRating[0] = totalRating[0]/revs1.length;
        totalRating[1] = totalRating[1]/revs2.length;
        totalRating[2] = totalRating[2]/revs3.length;
        totalRating[3] = totalRating[3]/revs4.length;
        totalRating[4] = totalRating[4]/revs5.length;
        //console.log(totalRating);
        totalRating[0] = Math.round(totalRating[0]*100)/100;
        totalRating[1] = Math.round(totalRating[1]*100)/100;
        totalRating[2] = Math.round(totalRating[2]*100)/100;
        totalRating[3] = Math.round(totalRating[3]*100)/100;
        totalRating[4] = Math.round(totalRating[4]*100)/100;

    }
    catch(error)
    {
        console.log(error);
        return callback(0);
    }
       
        return callback(totalRating);
    }
}   

module.exports = database;