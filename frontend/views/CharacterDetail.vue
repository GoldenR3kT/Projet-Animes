<template>
  <v-container>
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
            :src="getCharacterImage()"
            lazy-src="../../images/default-placeholder.png"
            aspect-ratio="1"
            alt="Image de {{ characterName }}"
        ></v-img>
      </v-col>

      <v-col cols="12" sm="6">
        <!-- Informations sur le personnage -->
        <v-card>
          <v-card-text>
            <p><strong>Nom :</strong> {{ characterName }}</p>
            <p><strong>Anime :</strong> {{ animeName }}</p>
            <p><strong>Description :</strong> {{ characterDetails.description }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
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
    const characterDetails = ref<any>({});

    // URL des images
    const baseImageUrl = 'http://localhost:3000/images';

    // Récupérer les détails du personnage
    const fetchCharacterDetails = async () => {
      try {
        const response = await axios.get(
            `http://localhost:3000/api/animes/${encodeURIComponent(animeName.value)}/characters/${encodeURIComponent(characterName.value)}`
        );
        characterDetails.value = response.data; // Assurez-vous que l'API renvoie les informations nécessaires
      } catch (error) {
        console.error('Error fetching character details:', error);
      }
    };

    // URL de l'image du personnage
    const getCharacterImage = () => {
      return `../../images/${animeName.value}/${characterName.value}.png`;
    };

    onMounted(() => {
      fetchCharacterDetails();
    });

    return {
      animeName,
      characterName,
      characterDetails,
      getCharacterImage,
    };
  },
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
</style>
