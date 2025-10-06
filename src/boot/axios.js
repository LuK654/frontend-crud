import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Criamos uma instância do Axios para a nossa API
const api = axios.create({
  // Definimos o endereço base da nossa API backend.
  baseURL: 'http://localhost/API_CRUD/public/'
});

export default boot(({ app }) => {
  // Para fins de depuração, podemos adicionar isto à instância do Vue.
  app.config.globalProperties.$api = api;
});

// Exportamos a nossa instância 'api' para que possamos importá-la
// em qualquer ficheiro .vue do nosso projeto.
export { api }