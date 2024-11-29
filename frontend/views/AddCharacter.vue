<template>
  <v-container>
    <NavBar />
    <v-row justify="center" class="mt-5">
      <v-col cols="12" md="8" lg="6">
        <h1 class="text-center">Ajouter un Personnage</h1>
        <v-form ref="form" @submit.prevent="submitCharacter" v-model="isFormValid">

          <v-text-field
              v-model="character.name"
              label="Nom du personnage"
              :rules="[rules.required]"
              outlined
              dense
          ></v-text-field>

          <v-file-input
              v-model="character.image"
              label="Image du personnage"
              accept="image/*"
              show-size
              :rules="[rules.required]"
              outlined
              dense
          ></v-file-input>

          <v-select
              v-model="character.anime"
              :items="animeList"
              label="Anime"
              :rules="[rules.required]"
              outlined
              dense
          ></v-select>

          <v-select
              v-model="character.mbti"
              :items="mbtiTypes"
              label="Type MBTI"
              :rules="[rules.required]"
              outlined
              dense
          ></v-select>

          <v-select
              v-model="character.enneagram"
              :items="enneagramTypes"
              label="Type Ennéagramme"
              :rules="[rules.required]"
              outlined
              dense
          ></v-select>

          <v-select
              v-model="character.gender"
              :items="genders"
              label="Genre"
              :rules="[rules.required]"
              outlined
              dense
          ></v-select>

          <v-row justify="center" class="mt-4">
            <v-btn type="submit" color="primary" :disabled="!isFormValid">
              Ajouter
            </v-btn>
            <v-btn color="grey" class="ml-3" @click="resetForm">
              Réinitialiser
            </v-btn>
          </v-row>
        </v-form>

        <v-alert
            v-if="successMessage"
            type="success"
            class="mt-3"
            dismissible
            @click:close="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import NavBar from '../components/NavBar.vue';

export default defineComponent({
  components: { NavBar },
  setup() {
    const form = ref();
    const isFormValid = ref(false);

    // Données pour le formulaire
    const character = ref({
      name: '',
      anime: '',
      mbti: '',
      enneagram: '',
      gender: '',
      image: null,
    });

    const genders = ref<string[]>(['m', 'f']);

    // Liste des options
    const animeList = ref<string[]>([]);
    const mbtiTypes = ref<string[]>([
      'INTJ',
      'INTP',
      'ENTJ',
      'ENTP',
      'INFJ',
      'INFP',
      'ENFJ',
      'ENFP',
      'ISTJ',
      'ISFJ',
      'ESTJ',
      'ESFJ',
      'ISTP',
      'ISFP',
      'ESTP',
      'ESFP',
    ]);
    const enneagramTypes = ref<number[]>(['1w2', '1w9', '2w1', '2w3', '3w2', '3w4',
      '4w3', '4w5', '5w4', '5w6', '6w5', '6w7',
      '7w6', '7w8', '8w7', '8w9', '9w1', '9w8',
      'XwX',]);

    // Règles de validation
    const rules = {
      required: (value: string) => !!value || 'Ce champ est requis',
    };

    // Message de succès
    const successMessage = ref('');

    // Fetch des animes
    const fetchAnimeList = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/animes');
        animeList.value = await response.json();
      } catch (error) {
        console.error('Erreur lors du chargement des animes:', error);
      }
    };

    // Soumission du formulaire
    const submitCharacter = async () => {
      const formData = new FormData();

      // Ajouter les champs au formulaire
      formData.append('name', character.value.name);
      formData.append('anime', character.value.anime);
      formData.append('mbti', character.value.mbti);
      formData.append('enneagram', character.value.enneagram);
      formData.append('gender', character.value.gender);

      // Ajouter l'image si elle est définie
      if (character.value.image) {
        formData.append('image', character.value.image);
      }

      try {
        const response = await fetch('http://localhost:3000/api/characters', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          successMessage.value = `Personnage "${character.value.name}" ajouté avec succès !`;
          resetForm();
        } else {
          console.error('Erreur lors de l\'ajout du personnage:', await response.text());
        }
      } catch (error) {
        console.error('Erreur réseau:', error);
      }
    };


    // Réinitialisation du formulaire
    const resetForm = () => {
      character.value = {
        name: '',
        anime: '',
        mbti: '',
        enneagram: '',
        gender: '',
        image: null,
      };
      form.value.resetValidation();
    };


    // Charger la liste des animes au montage
    onMounted(fetchAnimeList);

    return {
      form,
      isFormValid,
      character,
      animeList,
      mbtiTypes,
      enneagramTypes,
      rules,
      successMessage,
      submitCharacter,
      resetForm,
      genders,
    };
  },
});
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
