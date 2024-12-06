<template>
  <v-container>
    <NavBar />

    <!-- Titre de la section -->
    <v-row>
      <v-col cols="12">
        <h1>Liste des Animes</h1>
      </v-col>
    </v-row>

    <!-- Sélecteur de genre -->
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-select
            v-model="selectedGenre"
            :items="genres"
            label="Filtrer par genre"
            @change="fetchAnimes"
            item-text="genre"
            item-value="genre"
            clearable
        />
      </v-col>
    </v-row>

    <!-- Afficher la liste des animes -->
    <v-row>
      <v-col v-for="(anime, index) in animes" :key="index" cols="12" sm="4">
        <v-card @click="goToAnimeDetail(anime)" class="hover-card" outlined>
          <v-card-title>{{ anime }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Message d'information si la liste des animes est vide -->
    <v-row v-if="animes.length === 0">
      <v-col cols="12">
        <v-alert type="info" bordered>Aucun anime trouvé.</v-alert>
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
  name: 'AnimeList',
  components: { NavBar },
  setup() {
    const animes = ref<string[]>([]);
    const selectedGenre = ref<string>(''); // Genre sélectionné
    const genres = ref([
      'Adventure', 'Comedy', 'Drama', 'Ghibli', 'Isekai', 'Mecha', 'Mystery',
      'Psychological', 'Science Fiction', 'Seinen', 'Shoujo', 'Shounen',
      'Slice of Life', 'Sports', 'Supernatural'
    ]);

    const router = useRouter();

    // Fonction pour récupérer la liste des animes, avec un genre filtré si sélectionné
    const fetchAnimes = async () => {
      try {
        const genreParam = selectedGenre.value ? `?genre=${selectedGenre.value}` : '';
        const response = await axios.get(`http://localhost:3000/api/animes${genreParam}`);
        animes.value = response.data;
      } catch (error) {
        console.error('Error fetching animes:', error);
      }
    };

    // Fonction pour aller à la page de détail d'un anime
    const goToAnimeDetail = (anime: string) => {
      router.push({ name: 'AnimeDetail', params: { anime } });
    };

    // Charger la liste des animes au montage
    onMounted(fetchAnimes);

    // Recharger les animes si le genre change
    watch(selectedGenre, fetchAnimes);

    return {
      animes,
      selectedGenre,
      genres,
      fetchAnimes,
      goToAnimeDetail
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
