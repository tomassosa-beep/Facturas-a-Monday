import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno para que estén disponibles
  // Fix: Use '.' instead of process.cwd() to resolve type error
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Esto asegura que process.env.API_KEY funcione en el código cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});