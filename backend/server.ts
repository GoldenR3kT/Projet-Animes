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
    const { gender, mbti, enneagram, isMainCharacter } = req.query;

    const filter: any = { anime_name: animeName };

    if (gender) {
        filter.character_gender = gender;
    }

    if (mbti) {
        filter.character_mbti_type = mbti;
    }

    if (enneagram) {
        filter.character_enneagram_type = enneagram;
    }

    if (isMainCharacter) {
        filter.is_main_character = isMainCharacter === 'true';
    }

    try {
        const characters = await collection.find(filter).toArray();
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
        const rootDir = path.resolve(__dirname, '..'); // Accéder à la racine du projet
        const animeDir = path.join(rootDir, 'images', animeName); // Créer le chemin complet vers images/AnimeName

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

// Route pour supprimer un personnage
app.delete('/api/animes/:animeName/characters/:characterName', async (req, res) => {
    const animeName = req.params.animeName;
    const characterName = req.params.characterName;
    try {
        const result = await collection.deleteOne({ anime_name: animeName, character_name: characterName });

        if (result.deletedCount === 1) {
            res.json({ message: `Personnage ${characterName} supprimé avec succès.` });
        } else {
            res.status(404).json({ error: 'Personnage non trouvé' });
        }
    } catch (err) {
        console.error("Error deleting character:", err);
        res.status(500).json({ error: "Erreur lors de la suppression du personnage" });
    }
});

//update personnage
app.put('/api/animes/:animeName/characters/:characterName', async (req, res) => {
    const animeName = req.params.animeName;
    const characterName = req.params.characterName;
    const updatedData = req.body;

    try {
        const result = await collection.updateOne(
            { anime_name: animeName, character_name: characterName },
            { $set: updatedData }
        );

        if (result.modifiedCount > 0) {
            res.status(200).json({ message: "Character updated successfully." });
        } else {
            res.status(404).json({ error: "Character not found or no changes made." });
        }
    } catch (err) {
        console.error("Error updating character:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/characters/random', async (req, res) => {
    try {
        // Utilisation de $sample pour récupérer un document aléatoire
        const randomCharacter = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();

        if (randomCharacter.length > 0) {
            res.json(randomCharacter[0]);
        } else {
            res.status(404).json({ error: "No characters found in the database." });
        }
    } catch (err) {
        console.error("Error fetching random character:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/api/characters/:characterName/image', async (req, res) => {
    const characterName = req.params.characterName;

    try {
        // Rechercher le personnage par son nom
        const character = await collection.findOne({ character_name: characterName });

        if (character) {
            const rootDir = path.resolve(__dirname, '..');
            const imagePath = path.join(rootDir, 'images', character.anime_name, `${characterName}.jpg`);

            // Vérifier si l'image existe
            if (fs.existsSync(imagePath)) {
                res.sendFile(imagePath); // Envoyer l'image brute
            } else {
                res.status(404).json({ error: "Image not found" });
            }
        } else {
            res.status(404).json({ error: "Character not found" });
        }
    } catch (err) {
        console.error("Error fetching image:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Lancer le serveur sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;