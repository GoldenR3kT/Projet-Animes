<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="goToGraphPage">Graph</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Sélectionner un anime -->
      <v-col cols="12" sm="6">
        <v-select
            :items="animes"
            label="Choisir un anime"
            v-model="selectedAnime"
            @change="fetchCharacters"
        outlined
        ></v-select>
      </v-col>
    </v-row>

    <!-- Liste des personnages -->
    <v-row v-if="characters.length > 0">
      <v-col
          v-for="(character, index) in characters"
          :key="index"
          cols="12"
          sm="4"
      >
        <v-card>
          <!-- Image du personnage -->
          <v-img
              :src="getCharacterImage(character)"
              lazy-src="../../images/default-placeholder.png"
              aspect-ratio="1"
              alt="Image de {{ character }}"
          ></v-img>
          <!-- Nom du personnage -->
          <v-card-title>{{ character }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Message lorsque aucun personnage n'est trouvé -->
    <v-row v-if="characters.length === 0 && selectedAnime !== ''">
      <v-col cols="12">
        <v-alert type="info" bordered>Il n'y a pas de personnages disponibles pour cet anime.</v-alert>
      </v-col>
    </v-row>

    <!-- Message d'information pour la sélection de l'anime -->
    <v-row v-if="characters.length === 0 && selectedAnime === ''">
      <v-col cols="12">
        <v-alert type="info" bordered>Veuillez sélectionner un anime pour voir les personnages.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CharacterList',
  setup() {
    const animes = ref<string[]>([]); // Liste des anime
    const selectedAnime = ref<string>(''); // Anime sélectionné
    const characters = ref<string[]>([]);
    const router = useRouter();

    const baseImageUrl = 'http://localhost:3000/images'; // Base URL des images

    // Fonction pour récupérer la liste des animes depuis le backend
    const fetchAnimes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/animes');
        animes.value = response.data; // Liste des noms d'animes uniques
      } catch (error) {
        console.error('Error fetching animes:', error);
      }
    };

    // Fonction pour récupérer les personnages d'un anime
    const fetchCharacters = async () => {
      if (!selectedAnime.value) {
        characters.value = [];
        return;
      }

      try {
        const encodedAnimeName = encodeURIComponent(selectedAnime.value); // Encoder le nom de l'anime
        const response = await axios.get(`http://localhost:3000/api/animes/${encodedAnimeName}/characters`);
        characters.value = response.data; // Liste des personnages
        console.log('Characters fetched:', characters.value); // Vérification de la réponse
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
    };

    const getCharacterImage = (character: string) => {
      if (!selectedAnime.value) return '';
      return `../images/${selectedAnime.value}/${character}.png`;
    };

    // Watch sur selectedAnime pour déclencher l'appel à fetchCharacters lorsqu'il change
    watch(selectedAnime, () => {
      fetchCharacters();
    });

    // Récupérer les animes au chargement du composant
    onMounted(() => {
      fetchAnimes();
    });

    const goToGraphPage = () => {
      router.push('/graph');
    };

    return {
      goToGraphPage,
      animes,
      selectedAnime,
      characters,
      fetchCharacters,
      getCharacterImage
    };
  },
});
</script>

<style scoped>

</style>
