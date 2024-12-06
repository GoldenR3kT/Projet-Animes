<template>
  <v-container>
    <NavBar />

    <v-row>
      <!-- Sélectionner un anime -->
      <v-col cols="12" sm="6">
        <v-select
            :items="animes"
            label="Choisir un anime"
            v-model="selectedAnime"
            @change="fetchCharacters"
            clearable
            outlined
        ></v-select>
      </v-col>

      <!-- Barre de recherche -->
      <v-col cols="12" sm="6">
        <v-text-field
            v-model="searchQuery"
            label="Rechercher un personnage"
            @input="searchCharacters"
            clearable
            outlined
            :disabled="!selectedAnime"/>
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
        <v-card @click="goToCharacterDetail(character)" class="hover-card" outlined>
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
import NavBar from "../components/NavBar.vue";

export default defineComponent({
  name: 'CharacterList',
  components: { NavBar },
  setup() {
    const animes = ref<string[]>([]); // Liste des animes
    const selectedAnime = ref<string>(''); // Anime sélectionné
    const characters = ref<string[]>([]);
    const searchQuery = ref<string>(''); // Texte de recherche
    const router = useRouter();

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

    // Fonction de recherche de personnages
    const searchCharacters = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/characters/search', {
          params: {
            name: searchQuery.value,
            anime: selectedAnime.value || undefined,
          }
        });
        characters.value = response.data;
      } catch (error) {
        console.error('Error searching characters:', error);
      }
    };

    const getCharacterImage = (character: string) => {
      if (!selectedAnime.value && !character) return '../../images/default-placeholder.png';
      if (!selectedAnime.value) return `../../images/${character}.png`;
      return `../../images/${selectedAnime.value}/${character}.png`;
    };

    const goToCharacterDetail = (character: string) => {
      const animeParam = selectedAnime.value;
      router.push({ name: 'CharacterDetail', params: { anime: animeParam, character } });
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
      searchCharacters,
      searchQuery,
      getCharacterImage,
      goToCharacterDetail
    };
  },
});
</script>

<style scoped>
.hover-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.hover-card:hover {
  transform: scale(1.05);
}
</style>
