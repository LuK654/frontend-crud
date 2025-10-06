import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Criamos uma instância dedicada do Axios para a nossa API.
const api = axios.create({
  baseURL: 'http://localhost/API_CRUD/public/'
})

export default boot(({ app }) => {
  // Tornamos a 'api' disponível globalmente como '$api' para conveniência.
  app.config.globalProperties.$api = api
})

// Exportamos a 'api' para que possamos importá-la diretamente nos nossos scripts.
export { api }

