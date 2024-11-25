// Imports
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

// Connexion à la base de données
const dbName = 'test';
const url = 'mongodb+srv://Ilyane:Animes@cluster0.lpoye.mongodb.net/';

// Création du client MongoDB
const client = new MongoClient(url, {
    tls: true, // Assure l'utilisation de TLS si MongoDB Cluster le nécessite
    tlsAllowInvalidCertificates: true, // Autorise les certificats auto-signés pour les environnements de développement
});

// Déclaration de variables pour la base et la collection
let db;
let collection;

// Création de l'application Express
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Connexion à MongoDB
async function connectToMongoDB() {
    try {
        // Connexion au client MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        // Initialisation de la base de données et de la collection
        db = client.db(dbName);
        collection = db.collection('animes');
        console.log(`Database: "${dbName}" and Collection: "animes" initialized`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Arrête l'application si la connexion échoue
    }
}

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

app.get('/api/graph/mbti', async (req, res) => {
    try {
        const mbtiData = await collection.aggregate([
            { $group: { _id: '$character_mbti_type', count: { $sum: 1 } } },
            { $project: { mbti: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        res.json(mbtiData);
    } catch (err) {
        console.error("Error fetching MBTI data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/graph/enneagram', async (req, res) => {
    try {
        const enneagramData = await collection.aggregate([
            { $group: { _id: '$character_enneagram_type', count: { $sum: 1 } } },
            { $project: { enneagram: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        res.json(enneagramData);
    } catch (err) {
        console.error("Error fetching Enneagram data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/graph/animes', async (req, res) => {
    try {
        const animeData = await collection.aggregate([
            { $group: { _id: '$anime_name', count: { $sum: 1 } } },
            { $project: { anime: '$_id', count: 1, _id: 0 } }
        ]).toArray();
        res.json(animeData);
    } catch (err) {
        console.error("Error fetching anime data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Lancer le serveur après avoir établi la connexion à MongoDB
connectToMongoDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

export default app;