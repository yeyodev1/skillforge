import { loadFont } from '@remotion/google-fonts/Montserrat';

// Tokens de la marca. Todos los componentes leen de aquí.
// Para otra fuente de Google, cambia el import. Para una fuente propia, usa loadFont de @remotion/fonts.
const { fontFamily } = loadFont('normal', { weights: ['800', '900'], subsets: ['latin', 'latin-ext'] });

export const marca = {
  colores: {
    primario: '#FF3D00',
    texto: '#FFFFFF',
    resaltado: '#FFE600',
    contorno: '#000000',
  },
  fuente: fontFamily,
  pesoSubtitulos: 900,
  // Ruta dentro de public/, o null si no hay logo.
  logo: null as string | null,
};
