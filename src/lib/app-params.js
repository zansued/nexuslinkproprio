// Parâmetros de configuração da aplicação
// Agora usando variáveis de ambiente para configuração

export const appParams = {
  appId: process.env.VITE_APP_ID || 'nexuslink-app',
  serverUrl: process.env.VITE_API_URL || 'http://localhost:3000/api',
  token: process.env.VITE_API_TOKEN || '',
  functionsVersion: 'v1'
};
