// Imports
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Routes
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017/test'
const client = new MongoClient(url)
export const db = client.db('animes')

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.json());

// CORS
app.use(cors());


client.connect().then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.error("Error connecting to MongoDB", error)
})

export default app;