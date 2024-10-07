import { MongoClient } from 'mongodb';


export default async (dbName) => {
    const {MONGODB_URI} = process.env;
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const database = client.db(dbName);
    return database;
};