<template>
  <NavBar />
  <v-container class="d-flex justify-center align-center" style="height: 100vh;">

    <v-card max-width="500" outlined>
      <v-card-title class="text-h5 text-center">{{ character.character_name || "Chargement..." }}</v-card-title>
      <v-card-subtitle class="text-center">{{ character.anime_name }}</v-card-subtitle>

      <v-card-text>
        <!-- Image floutée avec v-bind:style -->
        <v-img
            v-if="imagePath"
            :src="imagePath"
            :style="{ filter: `blur(${blurAmount}px)` }"
            class="fixed-image"
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

    // Propriété calculée pour le flou dynamique
    const blurAmount = computed(() => {
      return guessCount.value >= 0 ? 20 - Math.min(guessCount.value, 20) : 20;
    });

    // Fonction pour vérifier la réponse de l'utilisateur
    const checkGuess = () => {
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
      imagePath, // URL de l'image
      checkGuess, // Fonction pour vérifier la réponse
      feedbackMessage, // Message de feedback
      feedbackType, // Type de message de feedback
      blurAmount, // Valeur dynamique du flou
    };
  },
};
</script>

<style scoped>
.fixed-image {
  top: 0;
  left: 0;
  z-index: -1;
  width: 300px;
  height: 300px;
  transition: filter 0.3s ease; /* Ajout d'une transition pour un effet plus fluide */
}

</style>
