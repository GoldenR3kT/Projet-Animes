<template>
  <NavBar />
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">

    <v-card max-width="500" outlined>
      <v-card-title class="text-h5 text-center">{{ character.character_name || "Chargement..." }}</v-card-title>
      <v-card-subtitle class="text-center">{{ character.anime_name }}</v-card-subtitle>

      <v-card-text>
        <!-- Image floutée -->
        <v-img
            v-if="imagePath"
            :src="imagePath"
            class="blurred-image"
            aspect-ratio="100"
        ></v-img>
        <v-alert v-else type="info" text>
          Aucune image disponible.
        </v-alert>

        <!-- Formulaire pour essayer de deviner le nom -->
        <v-text-field
            v-model="userGuess"
            label="Devinez le nom du personnage"
            outlined
            dense
            @keyup.enter="checkGuess"
        />
        <v-btn color="primary" @click="checkGuess">Essayer</v-btn>

        <!-- Message d'indication -->
        <v-alert v-if="feedbackMessage" :type="feedbackType" class="mt-2">{{ feedbackMessage }}</v-alert>
      </v-card-text>

      <v-card-actions class="d-flex justify-center">
        <v-btn color="primary" @click="fetchRandomCharacter">Nouvel essai</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import NavBar from "../components/NavBar.vue";

export default {
  components: { NavBar },
  setup() {
    const character = ref({}); // Déclaration de la variable pour stocker le personnage
    const animeName = ref('');  // Stocker le nom de l'anime
    const characterName = ref(''); // Stocker le nom du personnage
    const userGuess = ref(''); // Stocker la réponse de l'utilisateur
    const guessCount = ref(0); // Compter le nombre d'essais incorrects
    const feedbackMessage = ref(''); // Message de feedback à l'utilisateur
    const feedbackType = ref(''); // Type de message de feedback ('success' ou 'error')

    // Fonction pour récupérer un personnage aléatoire
    const fetchRandomCharacter = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/characters/random");
        character.value = response.data;
        animeName.value = character.value.anime_name; // Mise à jour du nom de l'anime
        characterName.value = character.value.character_name; // Mise à jour du nom du personnage
        userGuess.value = ''; // Réinitialiser la réponse de l'utilisateur
        guessCount.value = 0; // Réinitialiser le compteur d'essais
        feedbackMessage.value = ''; // Réinitialiser le message de feedback
      } catch (error) {
        console.error("Erreur lors de la récupération du personnage :", error);
      }
    };

    // Propriété calculée pour obtenir le chemin de l'image
    const imagePath = computed(() => {
      if (animeName.value && characterName.value) {
        return `../../images/${animeName.value || 'all-animes'}/${characterName.value}.png`;
      }
      return ''; // Retourner une chaîne vide si les informations ne sont pas disponibles
    });

    // Classe dynamique pour flouter l'image en fonction du nombre d'essais
    const blurredImageClass = computed(() => {
      console.log("Calcul de la classe de l'image floutée...");
      const blurAmount = 20 - guessCount.value; // Réduire le flou à chaque essai
      return {
        'blurred-image': true,
        'blurred-image-weak': blurAmount <= 0 ? 0 : blurAmount, // Contrôler l'intensité du flou
      };
    });

    const blurAmount = () => {
      console.log("Calcul de l'intensité du flou...");
      console.log("Nombre d'essais :", guessCount.value);
      console.log("Intensité du flou :", 20 - guessCount.value);
      return 20 - guessCount.value;
    } // Réduire le flou à chaque essai

    // Fonction pour vérifier la réponse de l'utilisateur
    const checkGuess = () => {
      console.log("Vérification de la réponse...");
      console.log("Réponse de l'utilisateur :", userGuess.value);
      console.log("Nom du personnage :", characterName.value);
      console.log("Nombre d'essais :", guessCount.value);
      if (userGuess.value.trim().toLowerCase() === characterName.value.toLowerCase()) {
        feedbackMessage.value = "Bravo, vous avez trouvé le personnage!";
        feedbackType.value = "success";
      } else {
        guessCount.value += 1;
        feedbackMessage.value = `Essai incorrect! Nombre d'essais : ${guessCount.value}`;
        feedbackType.value = "error";
      }
    };

    // Appel initial pour charger un personnage au montage
    onMounted(() => {
      fetchRandomCharacter();
    });

    return {
      character,
      userGuess,
      fetchRandomCharacter,
      imagePath, // Retours de l'URL de l'image à utiliser dans le template
      checkGuess, // Fonction pour vérifier la réponse
      feedbackMessage, // Message de feedback
      feedbackType, // Type de message de feedback
      blurredImageClass, // Classe dynamique pour flouter l'image
      blurAmount,
    };
  },
};
</script>

<style scoped>
.blurred-image {
  filter: blur(v-bind(blurAmount)); /* Appliquer un flou à l'image par défaut */
  border-radius: 8px; /* Ajoute des coins arrondis */
  width: 300px; /* Largeur fixe */
  height: 300px; /* Hauteur fixe */
  object-fit: cover; /* Assure que l'image s'ajuste sans déformation */
}

</style>
