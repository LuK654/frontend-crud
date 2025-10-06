<template>
  <!-- O seu template HTML permanece exatamente o mesmo -->
  <q-page padding>
    <q-card class="my-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <div class="text-h6">Lista de Utilizadores</div>
          <div class="text-subtitle2">Dados recebidos da nossa API Backend</div>
        </div>

        <q-btn
          label="Adicionar Utilizador"
          color="primary"
          icon="add"
          @click="openCreateDialog"
        />
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
                {{ user.nome.charAt(0).toUpperCase() }}
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

    <q-dialog v-model="showCreateDialog">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">Criar Novo Utilizador</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit="createUser">
            <q-input
              v-model="newUser.nome"
              label="Nome *"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'O nome é obrigatório']"
              lazy-rules
            />
            <q-input
              v-model="newUser.email"
              label="Email *"
              type="email"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'O email é obrigatório']"
              lazy-rules
            />
            <q-input
              v-model="newUser.senha"
              label="Senha *"
              type="password"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'A senha é obrigatória']"
              lazy-rules
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" color="grey" flat @click="showCreateDialog = false" />
              <q-btn label="Criar Utilizador" type="submit" color="primary" class="q-ml-sm" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
// Importamos a função `useQuasar`
import { useQuasar } from 'quasar'

defineOptions({
  name: 'IndexPage'
});

// AQUI ESTÁ A FORMA CORRETA DE USAR:
// Invocamos a função `useQuasar()` DENTRO do script setup do componente.
const $q = useQuasar();

// --- ESTADO REATIVO ---
const users = ref([]);
const showCreateDialog = ref(false);
const newUser = ref({
  nome: '',
  email: '',
  senha: ''
});

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchUsers();
});

// --- MÉTODOS ---
const fetchUsers = async () => {
  try {
    const response = await api.get('/usuarios');
    users.value = response.data;
  } catch (error) {
    console.error('Detalhes do erro ao buscar:', error);
    const errorMessage = error.response?.data?.message || 'Falha ao buscar utilizadores. Verifique a consola.';
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    })
  }
};

const openCreateDialog = () => {
  newUser.value = { nome: '', email: '', senha: '' };
  showCreateDialog.value = true;
};

const createUser = async () => {
  try {
    const response = await api.post('/usuarios', newUser.value);

    showCreateDialog.value = false;
    $q.notify({
      color: 'positive',
      message: response.data.message || 'Utilizador criado com sucesso!',
      icon: 'check_circle'
    });
    fetchUsers();

  } catch (error) {
    console.error('Detalhes do erro ao criar utilizador:', error);
    const errorMessage = error.response?.data?.message || 'Ocorreu uma falha ao criar o utilizador.';
    $q.notify({
      color: 'negative',
      message: errorMessage,
      icon: 'report_problem'
    });
  }
};
</script>

