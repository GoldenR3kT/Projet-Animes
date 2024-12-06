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

    <!-- Section des filtres -->
    <v-row>
      <v-col cols="12">
        <v-divider></v-divider>
        <v-subheader class="mt-4">Filtres</v-subheader>
      </v-col>

      <v-col cols="12" sm="3">
        <v-select
            :items="['m', 'f']"
            label="Filtrer par sexe"
            v-model="selectedGender"
            @change="fetchCharacters"
            clearable
            outlined
        ></v-select>
      </v-col>

      <v-col cols="12" sm="3">
        <v-select
            :items="['ENFJ', 'ENFP', 'ENTJ', 'ENTP', 'ESFJ', 'ESFP', 'ESTJ', 'ESTP', 'INFJ', 'INFP', 'INTJ', 'INTP', 'ISFJ', 'ISFP', 'ISTJ', 'ISTP', 'XXXX']"
            label="Filtrer par MBTI"
            v-model="selectedMbti"
            @change="fetchCharacters"
            clearable
            outlined
        ></v-select>
      </v-col>

      <v-col cols="12" sm="3">
        <v-select
            :items="['1w2', '1w9', '2w1', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6', '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w1', '9w8', 'XwX']"
            label="Filtrer par Ennéagramme"
            v-model="selectedEnneagram"
            @change="fetchCharacters"
            clearable
            outlined
        ></v-select>
      </v-col>

      <v-col cols="12" sm="3">
        <v-select
            :items="['true', 'false']"
            label="Filtrer par personnage principal"
            v-model="selectedMainCharacter"
            @change="fetchCharacters"
            clearable
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
    const animes = ref<string[]>([]);
    const selectedAnime = ref<string>('');
    const selectedGender = ref<string>('');
    const selectedMbti = ref<string>('');
    const selectedEnneagram = ref<string>('');
    const selectedMainCharacter = ref<string>('');
    const characters = ref<string[]>([]);
    const searchQuery = ref<string>('');
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

    // Fonction pour récupérer les personnages d'un anime avec filtres
    const fetchCharacters = async () => {
      if (!selectedAnime.value) {
        characters.value = [];
        return;
      }

      try {
        const encodedAnimeName = encodeURIComponent(selectedAnime.value); // Encoder le nom de l'anime
        const response = await axios.get(`http://localhost:3000/api/animes/${encodedAnimeName}/characters`, {
          params: {
            gender: selectedGender.value,
            mbti: selectedMbti.value,
            enneagram: selectedEnneagram.value,
            isMainCharacter: selectedMainCharacter.value,
          }
        });
        characters.value = response.data; // Liste des personnages filtrés
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

    // Fonction watch pour chaque filtre, pour rafraîchir la liste des personnages
    watch([selectedAnime, selectedGender, selectedMbti, selectedEnneagram, selectedMainCharacter], fetchCharacters, { immediate: true });

    // Charger la liste des animes au montage
    onMounted(fetchAnimes);

    return {
      animes,
      selectedAnime,
      selectedGender,
      selectedMbti,
      selectedEnneagram,
      selectedMainCharacter,
      characters,
      searchQuery,
      fetchCharacters,
      getCharacterImage,
      goToCharacterDetail,
      searchCharacters
    };
  }
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
