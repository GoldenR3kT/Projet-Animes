<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>Graphiques des Personnages</h1>
        <v-btn color="primary" @click="goBack">Retour</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="4">
        <h3>Répartition par MBTI</h3>
        <line-chart v-if="mbtiData.labels.length" :data="mbtiData" :options="chartOptions" />
        <v-alert v-else type="info" border="start">Chargement des données MBTI...</v-alert>
      </v-col>
      <v-col cols="12" sm="4">
        <h3>Répartition par Ennéagramme</h3>
        <line-chart v-if="enneagramData.labels.length" :data="enneagramData" :options="chartOptions" />
        <v-alert v-else type="info" border="start">Chargement des données Ennéagramme...</v-alert>
      </v-col>
      <v-col cols="12" sm="4">
        <h3>Nombre de Personnages par Anime</h3>
        <bar-chart v-if="animeData.labels.length" :data="animeData" :options="chartOptions" />
        <v-alert v-else type="info" border="start">Chargement des données des Animes...</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartOptions } from 'chart.js';

// Enregistrement des composants de Chart.js
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default defineComponent({
  components: {
    LineChart: Line,
    BarChart: Bar,
  },
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.push('/');
    };

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
        const [mbtiResponse, enneagramResponse, animeResponse] = await Promise.all([
          fetch('http://localhost:3000/api/graph/mbti').then((res) => res.json()),
          fetch('http://localhost:3000/api/graph/enneagram').then((res) => res.json()),
          fetch('http://localhost:3000/api/graph/animes').then((res) => res.json()),
        ]);

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

    // Récupérer les données au montage
    onMounted(() => {
      fetchGraphData();
    });

    return {
      mbtiData,
      enneagramData,
      animeData,
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
