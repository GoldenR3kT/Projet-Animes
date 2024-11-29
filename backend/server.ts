// Imports
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import multer from 'multer';
import path from 'path';
import fs from 'fs';


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

// Configuration de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const animeName = req.body.anime; // Récupérer le nom de l'anime depuis le formulaire
        const animeDir = path.join(__dirname, 'images', animeName);

        // Vérifier si le dossier de l'anime existe, sinon le créer
        if (!fs.existsSync(animeDir)) {
            fs.mkdirSync(animeDir, { recursive: true });
        }

        cb(null, animeDir); // Enregistrer l'image dans le dossier de l'anime
    },
    filename: (req, file, cb) => {
        const characterName = req.body.name; // Récupérer le nom du personnage depuis le formulaire
        const extension = path.extname(file.originalname); // Récupérer l'extension du fichier
        cb(null, `${characterName}${extension}`); // Nom du fichier : <character_name>.<extension>
    },
});

// Middleware Multer
const upload = multer({ storage });

app.post('/api/characters', upload.single('image'), async (req, res) => {
    const { name, anime, animeGenre, mbti, enneagram, gender } = req.body;

    try {
        // Insérer les données du personnage dans la base de données
        const result = await collection.insertOne({
            anime_name: anime,
            anime_genre: animeGenre,
            character_name: name,
            character_mbti_type: mbti,
            character_enneagram_type: enneagram,
            character_gender: gender,
        });

        res.status(201).json({
            message: 'Personnage ajouté avec succès',
            id: result.insertedId,
            imagePath: req.file.path,
        });
    } catch (err) {
        console.error("Erreur lors de l'ajout du personnage :", err);
        res.status(500).json({ error: "Erreur lors de l'ajout du personnage" });
    }
});

// Route pour rechercher un personnage par nom et anime
app.get('/api/characters/search', async (req, res) => {
    const { name, anime } = req.query;

    const query: any = {};

    // Si un anime est sélectionné, ajouter le filtre
    if (anime) {
        query.anime_name = anime;
    }

    // Si un nom de personnage est fourni, ajouter le filtre
    if (name) {
        query.character_name = { $regex: new RegExp(name as string, 'i') };
    }

    try {
        // Recherche des personnages correspondant aux critères
        const characters = await collection.find(query).toArray();
        const characterNames = characters.map((character: any) => character.character_name);
        res.json(characterNames);
    } catch (err) {
        console.error("Error searching characters:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;