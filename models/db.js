const mongodb = require('mongodb');

const client = mongodb.MongoClient;
const url = "mongodb+srv://TM6606:TM6606@bananacluster.lzoy6lc.mongodb.net/?retryWrites=true&w=majority";

const dbname = "data";
const options = {useUnifiedTopology : true};

const database = {

    findAcc : async function(username)
    {
        await client.connect();
        
    }
}