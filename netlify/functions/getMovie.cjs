const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

exports.handler = async function (event, context) {
  try {
    if (!cachedClient || !cachedDb) {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      cachedClient = await client.connect();
      cachedDb = cachedClient.db('moviegame1');
    }

    const collection = cachedDb.collection('movies1');
    const movies = await collection.find({}).toArray();

    return {
      statusCode: 200,
      body: JSON.stringify(movies),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
