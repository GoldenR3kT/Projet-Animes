<template>
  <v-container class="character-detail-container">
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

    <!-- Bouton Modifier -->
    <v-row class="mt-5">
      <v-col cols="12" class="text-center">
        <v-btn color="primary" @click="editMode = true">Modifier</v-btn>
      </v-col>
    </v-row>

    <!-- Formulaire de modification -->
    <v-row v-if="editMode" class="mt-5">
      <v-col cols="12" sm="6">
        <v-text-field label="Nom" v-model="editedCharacter.character_name"></v-text-field>
        <v-select
            label="Genre"
            v-model="editedCharacter.character_gender"
            :items="['m', 'f']"
            item-text="genre"
        ></v-select>
        <v-text-field label="Type MBTI" v-model="editedCharacter.character_mbti_type"></v-text-field>
        <v-text-field label="Type Ennéagramme" v-model="editedCharacter.character_enneagram_type"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" class="text-center">
        <v-btn color="success" class="mr-2" @click="saveCharacter">Enregistrer</v-btn>
        <v-btn color="error" @click="cancelEdit">Annuler</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>


<script lang="ts">
import { defineComponent, onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import NavBar from "../components/NavBar.vue";
import { watch } from 'vue';

export default defineComponent({
  name: 'CharacterDetail',
  components: { NavBar },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const animeName = ref<string>(route.params.anime as string);
    const characterName = ref<string>(route.params.character as string);
    const characterData = ref<any>({});
    const editMode = ref(false);

    // Clone les données pour modification
    const editedCharacter = ref<any>({});

    const fetchCharacterDetails = async () => {
      try {
        const response = await axios.get(
            `http://localhost:3000/api/animes/${encodeURIComponent(animeName.value)}/characters/${encodeURIComponent(characterName.value)}`
        );
        characterData.value = response.data;
        editedCharacter.value = { ...response.data }; // Clone les données actuelles
      } catch (error) {
        console.error('Error fetching character details:', error);
      }
    };

    watch(
        () => route.params.character,
        (newCharacterName) => {
          characterName.value = newCharacterName as string; // Met à jour le nom local
          fetchCharacterDetails(); // Recharge les détails du personnage
        }
    );

    const saveCharacter = async () => {
      try {
        const validData = {
          character_name: editedCharacter.value.character_name || characterData.value.character_name,
          character_gender: editedCharacter.value.character_gender || characterData.value.character_gender,
          character_mbti_type: editedCharacter.value.character_mbti_type || characterData.value.character_mbti_type,
          character_enneagram_type: editedCharacter.value.character_enneagram_type || characterData.value.character_enneagram_type,
        };

        console.log("Données envoyées à l'API :", validData);

        await axios.put(
            `http://localhost:3000/api/animes/${encodeURIComponent(animeName.value)}/characters/${encodeURIComponent(characterName.value)}`,
            validData
        );

        const previousCharacterName = characterName.value;
        characterName.value = validData.character_name; // Met à jour le nom localement
        characterData.value = { ...validData }; // Met à jour les données locales
        editMode.value = false;

        if (previousCharacterName !== characterName.value) {
          router.push({
            name: 'CharacterDetail',
            params: { anime: animeName.value, character: characterName.value },
          });
        } else {
          alert("Les informations du personnage ont été mises à jour !");
        }
      } catch (error) {
        console.error('Error saving character details:', error);
        alert("Erreur lors de la mise à jour des informations.");
      }
    };

    const cancelEdit = () => {
      editMode.value = false;
      editedCharacter.value = { ...characterData.value }; // Réinitialise les modifications
    };

    const getCharacterImage = () => {
      return `../../images/${animeName.value || 'all-animes'}/${characterName.value}.png`;
    };

    const genderText = computed(() => {
      if (characterData.value.character_gender === 'm') {
        return 'Homme';
      } else if (characterData.value.character_gender === 'f') {
        return 'Femme';
      }
      return 'Inconnu';
    });

    onMounted(() => {
      fetchCharacterDetails();
    });

    return {
      animeName,
      characterName,
      characterDetails: characterData,
      editedCharacter,
      editMode,
      fetchCharacterDetails,
      saveCharacter,
      cancelEdit,
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