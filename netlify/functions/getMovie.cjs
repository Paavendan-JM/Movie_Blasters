const { MongoClient } = require('mongodb');

import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

exports.handler = async function (event, context) {
  try {
    const client = await clientPromise;
    const db = client.db('moviegame1');    
    const collection = db.collection('movies1'); 

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
