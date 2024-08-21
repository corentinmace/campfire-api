import * as mongoDB from "mongodb";
import dotenv from "dotenv";
export const collections: {
    users?: mongoDB.Collection,
} = {}

export async function connectToDatabase () {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    collections.users = db.collection('users');

    console.log(`Successfully connected to database: ${db.databaseName}`);
}
