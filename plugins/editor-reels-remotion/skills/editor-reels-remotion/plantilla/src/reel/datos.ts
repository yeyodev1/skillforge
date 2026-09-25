import type { Caption } from '@remotion/captions';

export type Tramo = { desde: number; hasta: number };
export type Titulo = { texto: string; duracion: number };
export type Sonido = { archivo: string; volumen?: number };
export type Sfx = {
  whoosh?: Sonido | null; // en cada corte
  ding?: Sonido | null; // en cada palabra con número
  extra?: (Sonido & { en: number })[]; // en segundos del reel ya cortado
};

// Frames que ocupa un tramo. Todo el proyecto usa esta función para que los cortes,
// los subtítulos y los sonidos cuadren al frame.
export const framesDeTramo = (t: Tramo, fps: number) => Math.max(1, Math.round((t.hasta - t.desde) * fps));

// Frame del reel en el que empieza cada tramo.
export const iniciosDeTramos = (cortes: Tramo[], fps: number) => {
  let acumulado = 0;
  return cortes.map((t) => {
    const inicio = acumulado;
    acumulado += framesDeTramo(t, fps);
    return inicio;
  });
};

// Pasa los captions de tiempos del video original a tiempos del reel ya cortado.
// Descarta las palabras que caen dentro de un silencio cortado.
export const remapearCaptions = (captions: Caption[], cortes: Tramo[], fps: number): Caption[] => {
  const inicios = iniciosDeTramos(cortes, fps);
  const resultado: Caption[] = [];
  for (const c of captions) {
    const i = cortes.findIndex((t) => c.startMs >= t.desde * 1000 && c.startMs < t.hasta * 1000);
    if (i === -1) continue;
    const t = cortes[i];
    const desplazamiento = (inicios[i] / fps) * 1000 - t.desde * 1000;
    resultado.push({
      ...c,
      startMs: c.startMs + desplazamiento,
      endMs: Math.min(c.endMs, t.hasta * 1000) + desplazamiento,
      timestampMs: c.timestampMs === null ? null : c.timestampMs + desplazamiento,
    });
  }
  return resultado;
};

const NUMERO = /\d|\b(dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta|cien|cientos?|mil|millón|millones|doble|triple|mitad)\b/i;
export const tieneNumero = (texto: string) => NUMERO.test(texto);
