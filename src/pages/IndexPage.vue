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

      <q-card-section>
        <div v-if="users.length === 0" class="text-center text-grey q-pa-md">
          A carregar utilizadores ou nenhum utilizador encontrado...
        </div>

        <q-list v-else separator>
          <!-- Alteração: Adicionámos os botões de ação a cada item -->
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
            <!-- NOVO: Secção para os botões de Ação -->
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
      </q-card-section>
    </q-card>

    <!-- Diálogo reutilizável para Criar e Editar -->
    <q-dialog v-model="showDialog">
      <q-card style="width: 500px">
        <q-card-section>
          <!-- NOVO: Título dinâmico -->
          <div class="text-h6">{{ form.id ? 'Editar Utilizador' : 'Criar Novo Utilizador' }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <!-- O @submit agora chama um método que decide se cria ou atualiza -->
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
            <!-- NOVO: Mostramos o campo senha apenas na criação -->
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
              <!-- NOVO: Texto do botão dinâmico -->
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
// NOVO: Renomeámos `newUser` para `form` para ser mais genérico
const form = ref({
  id: null,
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
    console.error('Erro ao buscar utilizadores:', error);
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Falha ao buscar utilizadores.',
      icon: 'report_problem'
    })
  }
};

// NOVO: Função genérica para abrir o diálogo
const openDialog = (user = null) => {
  if (user) {
    // Modo Edição: Preenche o formulário com os dados do utilizador
    form.value = { ...user, senha: '' }; // Copiamos o utilizador e limpamos a senha
  } else {
    // Modo Criação: Reseta o formulário
    form.value = { id: null, nome: '', email: '', senha: '' };
  }
  showDialog.value = true;
};

// NOVO: Método que decide se cria ou atualiza
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
    fetchUsers();
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao criar utilizador.', icon: 'report_problem' });
  }
};

// NOVO: Método para atualizar o utilizador
const updateUser = async () => {
  try {
    const response = await api.put(`/usuarios/${form.value.id}`, form.value);
    showDialog.value = false;
    $q.notify({ color: 'positive', message: response.data.message, icon: 'check_circle' });
    fetchUsers();
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao atualizar utilizador.', icon: 'report_problem' });
  }
};

// NOVO: Método para eliminar o utilizador
const deleteUser = (id) => {
  // Usamos o plugin de Diálogo do Quasar para pedir confirmação
  $q.dialog({
    title: 'Confirmar',
    message: `Tem a certeza que deseja eliminar o utilizador com ID ${id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    // Se o utilizador clicar em "OK", executamos a eliminação
    try {
      const response = await api.delete(`/usuarios/${id}`);
      $q.notify({ color: 'positive', message: response.data.message, icon: 'check_circle' });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      $q.notify({ color: 'negative', message: error.response?.data?.message || 'Falha ao eliminar utilizador.', icon: 'report_problem' });
    }
  });
};
</script>

