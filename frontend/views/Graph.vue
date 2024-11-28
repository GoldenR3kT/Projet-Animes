<template>
  <v-container>
    <NavBar />
    <v-row>
      <v-col cols="12">
        <h1 class="text-center mt-5">Graphiques des Personnages</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="text-center mb-5">
        <v-select
            v-model="selectedAnime"
            :items="animeList"
            label="Sélectionnez un Anime"
            clearable
            outlined
        ></v-select>
      </v-col>
    </v-row>

    <!-- Répartition par MBTI -->
    <v-row class="mb-5 mt-5">
      <v-col cols="12">
        <h3 class="text-center">Répartition par MBTI</h3>
        <line-chart
            v-if="filteredMbtiData.labels.length"
            :data="filteredMbtiData"
            :options="chartOptions"
            class="chart"
        />
        <v-alert v-else type="info" border="start">Chargement des données MBTI...</v-alert>
      </v-col>
    </v-row>

    <!-- Répartition par Ennéagramme -->
    <v-row class="mb-5">
      <v-col cols="12">
        <h3 class="text-center">Répartition par Ennéagramme</h3>
        <line-chart
            v-if="filteredEnneagramData.labels.length"
            :data="filteredEnneagramData"
            :options="chartOptions"
            class="chart"
        />
        <v-alert v-else type="info" border="start">Chargement des données Ennéagramme...</v-alert>
      </v-col>
    </v-row>

    <!-- Nombre de Personnages par Anime -->
    <v-row class="mb-5">
      <v-col cols="12">
        <h3 class="text-center">Nombre de Personnages par Anime</h3>
        <bar-chart
            v-if="filteredAnimeData.labels.length"
            :data="filteredAnimeData"
            :options="chartOptions"
            class="chart"
        />
        <v-alert v-else type="info" border="start">Chargement des données des Animes...</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>


<script lang="ts">
import {defineComponent, ref, onMounted, computed} from 'vue';
import { useRouter } from 'vue-router';
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartOptions } from 'chart.js';
import NavBar from "../components/NavBar.vue";

// Enregistrement des composants de Chart.js
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default defineComponent({
  components: {
    NavBar,
    LineChart: Line,
    BarChart: Bar,
  },
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.push('/');
    };

    const animeList = ref<string[]>([]);
    const selectedAnime = ref<string | null>(null);

    // Définition des données de graphiques
    const mbtiData = ref({
      labels: [],
      datasets: [],
    });
    const enneagramData = ref({
      labels: [],
      datasets: [],
    });
    const animeData = ref({
      labels: [],
      datasets: [],
    });

    // Configuration des options du graphique
    const chartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    // Récupérer les données pour chaque graphique
    const fetchGraphData = async () => {
      try {
        const [animeNames, mbtiResponse, enneagramResponse, animeResponse] = await Promise.all([
          fetch('http://localhost:3000/api/animes').then((res) => res.json()),
          fetch('http://localhost:3000/api/graph/mbti').then((res) => res.json()),
          fetch('http://localhost:3000/api/graph/enneagram').then((res) => res.json()),
          fetch('http://localhost:3000/api/graph/animes').then((res) => res.json()),
        ]);

        animeList.value = animeNames;

        // Préparation des données pour le graphique MBTI
        mbtiData.value = {
          labels: mbtiResponse.map((item: any) => item.mbti),
          datasets: [
            {
              label: 'Pourcentage par MBTI',
              data: mbtiResponse.map((item: any) => item.count),
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        };

        // Préparation des données pour le graphique Ennéagramme
        enneagramData.value = {
          labels: enneagramResponse.map((item: any) => item.enneagram),
          datasets: [
            {
              label: 'Pourcentage par Ennéagramme',
              data: enneagramResponse.map((item: any) => item.count),
              backgroundColor: 'rgba(153,102,255,0.2)',
              borderColor: 'rgba(153,102,255,1)',
              borderWidth: 1,
            },
          ],
        };

        // Préparation des données pour le graphique des Animes
        animeData.value = {
          labels: animeResponse.map((item: any) => item.anime),
          datasets: [
            {
              label: 'Nombre de Personnages par Anime',
              data: animeResponse.map((item: any) => item.count),
              backgroundColor: 'rgba(255,159,64,0.2)',
              borderColor: 'rgba(255,159,64,1)',
              borderWidth: 1,
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching graph data:', error);

        // En cas d'erreur, définissez des valeurs par défaut pour éviter les plantages
        mbtiData.value = { labels: [], datasets: [] };
        enneagramData.value = { labels: [], datasets: [] };
        animeData.value = { labels: [], datasets: [] };
      }
    };

    // Fonction pour filtrer les données en fonction de l'anime sélectionné
    const filterData = (data: any, field: string) => {
      if (!selectedAnime.value) return data; // Pas de filtre si aucun anime sélectionné
      const filteredLabels: string[] = [];
      const filteredCounts: number[] = [];
      data.labels.forEach((label: string, index: number) => {
        if (label === selectedAnime.value) {
          filteredLabels.push(label);
          filteredCounts.push(data.datasets[0].data[index]);
        }
      });
      return {
        labels: filteredLabels,
        datasets: [
          {
            ...data.datasets[0],
            data: filteredCounts,
          },
        ],
      };
    };

    const filteredMbtiData = computed(() => filterData(mbtiData.value, 'mbti'));
    const filteredEnneagramData = computed(() => filterData(enneagramData.value, 'enneagram'));
    const filteredAnimeData = computed(() => filterData(animeData.value, 'anime'));

    // Récupérer les données au montage
    onMounted(() => {
      fetchGraphData();
    });

    return {
      selectedAnime,
      animeList,
      mbtiData,
      enneagramData,
      animeData,
      filteredMbtiData,
      filteredEnneagramData,
      filteredAnimeData,
      chartOptions,
      goBack,
    };
  },
});
</script>

<style scoped>
v-row {
  margin-top: 20px;
}
</style>
