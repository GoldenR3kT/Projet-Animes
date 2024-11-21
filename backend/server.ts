// Imports
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Connexion à la base de données
const dbName = 'test';
export const db = client.db(dbName);
const collection = db.collection('animes');

// Création de l'application Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Connexion à MongoDB
client.connect()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB", error);
    });

// Route pour récupérer les 20 premiers documents
app.get('/api/animes', async (req, res) => {
    try {
        // Utilisation de la méthode distinct() pour récupérer les noms d'animes uniques
        const animes = await collection.distinct('anime_name');
        res.json(animes);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Route pour récupérer les personnages d'un anime donné
app.get('/api/animes/:animeName/characters', async (req, res) => {
    const animeName = req.params.animeName;
    try {
        // Recherche des personnages associés à cet anime
        const characters = await collection.find({ anime_name: animeName }).toArray();
        // Extraction uniquement des noms de personnages
        const characterNames = characters.map((character: any) => character.character_name);
        res.json(characterNames);
    } catch (err) {
        console.error("Error fetching characters:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;