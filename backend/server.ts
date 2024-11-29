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

app.get('/api/animes/:animeName/characters/:characterName', async (req, res) => {
    const animeName = req.params.animeName;
    const characterName = req.params.characterName;
    try {
        const character = await collection.findOne({ anime_name: animeName, character_name: characterName });
        res.json(character);
    } catch (err) {
        console.error("Error fetching character:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/animes/:animeName/gender', async (req, res) => {
    const animeName = req.params.animeName;

    try {
        const genderData = await collection.aggregate([
            { $match: { anime_name: animeName } }, // Filtre pour l'anime donné
            {
                $group: {
                    _id: '$character_gender',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    gender: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]).toArray();

        // Transformation des données pour un format plus compréhensible
        const result = {
            male: genderData.find(g => g.gender === 'm')?.count || 0,
            female: genderData.find(g => g.gender === 'f')?.count || 0
        };

        res.json(result);
    } catch (err) {
        console.error("Error fetching gender data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/graph/gender', async (req, res) => {
    try {
        const genderData = await collection.aggregate([
            {
                $group: {
                    _id: '$anime_name',
                    male_count: {
                        $sum: { $cond: [{ $eq: ['$character_gender', 'm'] }, 1, 0] }
                    },
                    female_count: {
                        $sum: { $cond: [{ $eq: ['$character_gender', 'f'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    anime_name: '$_id',
                    male_count: 1,
                    female_count: 1,
                    _id: 0
                }
            }
        ]).toArray();

        res.json(genderData);
    } catch (err) {
        console.error("Error fetching gender data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;