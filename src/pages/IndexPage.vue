<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Lista de Utilizadores</div>
        <div class="text-subtitle2">Dados recebidos da nossa API Backend</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="users.length === 0" class="text-center text-grey q-pa-md">
          A carregar utilizadores ou nenhum utilizador encontrado...
        </div>

        <q-list v-else separator>
          <q-item v-for="user in users" :key="user.id">
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white">
                {{ user.nome.charAt(0) }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ user.nome }}</q-item-label>
              <q-item-label caption>{{ user.email }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios' // Importamos a nossa instância configurada do Axios!

defineOptions({
  name: 'IndexPage'
});

// 1. REATIVIDADE:
// Criamos uma variável reativa 'users'. O Vue irá "observar" esta variável.
// Se o seu conteúdo mudar, o HTML será atualizado automaticamente.
// Começa como uma lista vazia.
const users = ref([]);

// 2. CICLO DE VIDA:
// A função onMounted() é um "gancho" do ciclo de vida. O código dentro dela
// será executado assim que o componente for montado e estiver visível na tela.
// É o momento perfeito para ir buscar os dados iniciais.
onMounted(() => {
  // Chamamos a função que vai buscar os dados à API.
  fetchUsers();
});

// 3. LÓGICA DA API:
// Esta função assíncrona é responsável por comunicar com o nosso backend.
const fetchUsers = async () => {
  try {
    // Usamos a nossa instância 'api' para fazer uma requisição GET para o endpoint '/usuarios'.
    // O Axios junta o baseURL com este caminho: http://localhost/API_CRUD/public/usuarios
    const response = await api.get('/usuarios');

    // Quando a resposta chegar, atualizamos a nossa variável reativa 'users'.
    // O .value é necessário porque estamos a usar ref().
    // Assim que esta linha for executada, o Vue irá automaticamente atualizar a lista na tela!
    users.value = response.data;

  } catch (error) {
    // Se algo correr mal (ex: a API está offline), mostramos um erro na consola.
    console.error('Erro ao buscar utilizadores:', error);
    // No futuro, poderíamos mostrar uma notificação de erro para o utilizador.
  }
};
</script>