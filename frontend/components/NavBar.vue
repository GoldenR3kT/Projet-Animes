<template>
  <v-app-bar app color="primary" dark>
    <!-- Bouton Accueil tout à gauche -->
    <v-btn text @click="goToHome">Accueil</v-btn>

    <!-- Titre centré -->
    <v-spacer></v-spacer>
    <v-toolbar-title class="text-center">Animes Characters Personnality</v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Bouton Graphiques tout à droite -->
    <v-btn text @click="goToGraphs">Graphiques</v-btn>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'NavBar',
  setup() {
    const router = useRouter();

    const goToHome = () => {
      router.push('/');
    };

    const goToGraphs = () => {
      router.push('/graph');
    };

    return {
      goToHome,
      goToGraphs,
    };
  },
});
</script>

<style scoped>
.v-toolbar-title {
  text-align: center;
}
.v-app-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
