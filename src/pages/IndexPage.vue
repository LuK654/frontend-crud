<template>
  <q-page padding>
    <q-card class="my-card">
      <q-card-section class="row justify-between items-center">
        <div>
          <div class="text-h6">Lista de Utilizadores</div>
          <div class="text-subtitle2">CRUD Completo com Vue, Quasar e Axios</div>
        </div>

        <q-btn
          label="Adicionar Utilizador"
          color="primary"
          icon="add"
          @click="openDialog()"
        />
      </q-card-section>

      <q-separator />

      <!-- NOVO: O q-card-section agora tem uma posição relativa para o loading funcionar -->
      <q-card-section class="relative-position">
        <!-- NOVO: Componente de loading do Quasar -->
        <!-- Ele só aparece quando a variável 'isLoading' for verdadeira -->
        <q-inner-loading :showing="isLoading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <!-- A lista e a mensagem de "nenhum utilizador" só aparecem quando NÃO está a carregar -->
        <template v-if="!isLoading">
          <div v-if="users.length === 0" class="text-center text-grey q-pa-md">
            Nenhum utilizador encontrado.
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
              <q-item-section side>
                <div class="row q-gutter-sm">
                  <q-btn
                    icon="edit"
                    color="info"
                    flat
                    round
                    dense
                    @click="openDialog(user)"
                  />
                  <q-btn
                    icon="delete"
                    color="negative"
                    flat
                    round
                    dense
                    @click="deleteUser(user.id)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </q-card-section>
    </q-card>

    <!-- O diálogo de Criar/Editar permanece o mesmo -->
    <q-dialog v-model="showDialog">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar Utilizador' : 'Criar Novo Utilizador' }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form @submit="onSubmit">
            <q-input
              v-model="form.nome"
              label="Nome *"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'O nome é obrigatório']"
              lazy-rules
            />
            <q-input
              v-model="form.email"
              label="Email *"
              type="email"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'O email é obrigatório']"
              lazy-rules
            />
            <q-input
              v-if="!form.id"
              v-model="form.senha"
              label="Senha *"
              type="password"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'A senha é obrigatória']"
              lazy-rules
            />
            <div class="row justify-end q-mt-md">
              <q-btn label="Cancelar" color="grey" flat v-close-popup />
              <q-btn :label="form.id ? 'Atualizar' : 'Criar'" type="submit" color="primary" class="q-ml-sm" />
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
import { useQuasar } from 'quasar'

defineOptions({
  name: 'IndexPage'
});

const $q = useQuasar();

// --- ESTADO REATIVO ---
const users = ref([]);
const showDialog = ref(false);
const form = ref({
  id: null,
  nome: '',
  email: '',
  senha: ''
});
// NOVO: Variável reativa para controlar o estado de carregamento.
const isLoading = ref(false);

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchUsers();
});

// --- MÉTODOS ---
const fetchUsers = async () => {
  // NOVO: Ativamos o loading antes de iniciar a chamada à API.
  isLoading.value = true;
  try {
    const response = await api.get('/usuarios');
    users.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Falha ao buscar utilizadores.',
      icon: 'report_problem'
    })
  } finally {
    // NOVO: Desativamos o loading no final, quer a chamada tenha
    // sucesso ou falhe. O `finally` é perfeito para isto!
    isLoading.value = false;
  }
};

const openDialog = (user = null) => {
  if (user) {
    form.value = { ...user, senha: '' };
  } else {
    form.value = { id: null, nome: '', email: '', senha: '' };
  }
  showDialog.value = true;
};

const onSubmit = async () => {
  if (form.value.id) {
    await updateUser();
  } else {
    await createUser();
  }
};

const createUser = async () => {
  try {
    const response = await api.post('/usuarios', form.value);
    showDialog.value = false;
    $q.notify({ color: 'positive', message: response.data.message, icon: 'check_circle' });
    fetchUsers(); // Ao chamar fetchUsers, o loading será ativado automaticamente.
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao criar utilizador.', icon: 'report_problem' });
  }
};

const updateUser = async () => {
  try {
    const response = await api.put(`/usuarios/${form.value.id}`, form.value);
    showDialog.value = false;
    $q.notify({ color: 'positive', message: response.data.message, icon: 'check_circle' });
    fetchUsers(); // Ao chamar fetchUsers, o loading será ativado automaticamente.
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao atualizar utilizador.', icon: 'report_problem' });
  }
};

const deleteUser = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: `Tem a certeza que deseja eliminar o utilizador com ID ${id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      $q.notify({ color: 'positive', message: response.data.message, icon: 'check_circle' });
      fetchUsers(); // Ao chamar fetchUsers, o loading será ativado automaticamente.
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao eliminar utilizador.', icon: 'report_problem' });
    }
  });
};
</script>

