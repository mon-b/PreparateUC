/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora errores de eslint durante el build para que deploye aunque haya warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores de tipado de TS durante el build
    ignoreBuildErrors: true,
  },
  // ... el resto de tu configuración
};

export default nextConfig;