<template>
  <v-container>
    <NavBar />
    <v-row>
      <v-col cols="12">
        <h1 class="text-center mt-5">Répartition des Genres par Anime</h1>
      </v-col>
    </v-row>

    <!-- Répartition des genres par anime -->
    <v-row class="mb-5 mt-5">
      <v-col cols="12">
        <h3 class="text-center">Répartition des Genres par Anime</h3>
        <bar-chart
            v-if="genderData.labels.length"
            :data="genderData"
            :options="chartOptions"
            class="chart"
        />
        <v-alert v-else type="info" border="start">Chargement des données sur les genres...</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartOptions,
} from 'chart.js';
import NavBar from "../components/NavBar.vue";

// Enregistrement des composants de Chart.js
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default defineComponent({
  components: {
    NavBar,
    BarChart: Bar,
  },
  setup() {
    const router = useRouter();

    const genderData = ref({
      labels: [],
      datasets: [],
    });

    const chartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Animes',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Nombre de Personnages',
          },
        },
      },
    };

    const fetchGenderData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/graph/gender');
        const data = await response.json();

        // Préparation des données pour le graphique
        const labels = data.map((anime: any) => anime.anime_name); // Noms des animes
        const maleCounts = data.map((anime: any) => anime.male_count); // Nombre d'hommes
        const femaleCounts = data.map((anime: any) => anime.female_count); // Nombre de femmes

        genderData.value = {
          labels,
          datasets: [
            {
              label: 'Hommes',
              data: maleCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Femmes',
              data: femaleCounts,
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
      } catch (error) {
        console.error('Error fetching gender data:', error);

        // En cas d'erreur, définissez des valeurs par défaut
        genderData.value = { labels: [], datasets: [] };
      }
    };

    onMounted(() => {
      fetchGenderData();
    });

    return {
      genderData,
      chartOptions,
    };
  },
});
</script>
