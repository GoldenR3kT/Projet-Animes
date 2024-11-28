<template>
  <v-container class="character-detail-container" >
    <NavBar />
    <v-row>
      <v-col cols="12">
        <h1>Personnalité de {{ characterName }}</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <!-- Image du personnage -->
        <v-img
            class="fixed-image"
            :src="getCharacterImage()"
            lazy-src="../../images/default-placeholder.png"
            aspect-ratio="1"
            alt="Image de {{ characterName }}"
        ></v-img>
      </v-col>

      <v-col cols="12" sm="6">
        <!-- Informations sur le personnage -->
        <v-card>
          <v-card-text class="text-left">
            <p><strong>Nom :</strong> {{ characterName }}</p>
            <p><strong>Genre :</strong> {{ genderText }}</p>
            <p><strong>Anime :</strong> {{ animeName }}</p>
            <p><strong>Type personnalité MBTI :</strong> {{ characterDetails.character_mbti_type }}</p>
            <p><strong>Type personnalité Ennéagramme :</strong> {{ characterDetails.character_enneagram_type }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";

export default defineComponent({
  name: 'CharacterDetail',
  components: { NavBar },
  setup() {
    const route = useRoute();
    const animeName = ref<string>(route.params.anime as string);
    const characterName = ref<string>(route.params.character as string);
    const characterData = ref<any>({}); // Stocke les données du personnage

    // URL des images
    const baseImageUrl = 'http://localhost:3000/images';

    // Récupérer les détails du personnage
    const fetchCharacterDetails = async () => {
      try {
        const response = await axios.get(
            `http://localhost:3000/api/animes/${encodeURIComponent(animeName.value)}/characters/${encodeURIComponent(characterName.value)}`
        );
        characterData.value = response.data; // Assurez-vous que l'API renvoie les informations nécessaires
      } catch (error) {
        console.error('Error fetching character details:', error);
      }
    };

    // URL de l'image du personnage
    const getCharacterImage = () => {
      return `../../images/${animeName.value}/${characterName.value}.png`;
    };

    // Conversion du genre
    const genderText = computed(() => {
      if (characterData.value.character_gender === 'm') {
        return 'Homme';
      } else if (characterData.value.character_gender === 'f') {
        return 'Femme';
      }
      return 'Inconnu'; // Au cas où la valeur n'est pas "m" ou "f"
    });

    onMounted(() => {
      fetchCharacterDetails();
    });

    return {
      animeName,
      characterName,
      characterDetails: characterData,
      getCharacterImage,
      genderText,
    };
  },
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}

/* Alignement du texte à gauche */
.text-left {
  text-align: left;
}

html, body, #app {
  background-color: white !important;
  color: black; /* Optionnel, pour le texte */
}

.character-detail-container {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centre verticalement le contenu */
}

.fixed-image {
  width: 300px; /* Largeur fixe */
  height: 300px; /* Hauteur fixe */
  object-fit: cover; /* Assure que l'image s'ajuste sans déformation */
  border-radius: 10px; /* Ajoute des coins arrondis pour un style plus élégant */
  margin: 0 auto; /* Centre l'image horizontalement */
}

</style>