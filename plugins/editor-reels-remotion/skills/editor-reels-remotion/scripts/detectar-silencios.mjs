#!/usr/bin/env node
// Detecta silencios con ffmpeg y guarda los tramos que se conservan en segundos del video original.
// Uso: node scripts/detectar-silencios.mjs <video> <salida.json> [--umbral -35] [--min 0.5] [--aire 0.12] [--tramo-min 0.25]
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const [video, salida, ...resto] = process.argv.slice(2);
if (!video || !salida) {
  console.error('Uso: node detectar-silencios.mjs <video> <salida.json> [--umbral -35] [--min 0.5] [--aire 0.12]');
  process.exit(1);
}
const opcion = (nombre, porDefecto) => {
  const i = resto.indexOf(`--${nombre}`);
  return i === -1 ? porDefecto : Number(resto[i + 1]);
};
const umbral = opcion('umbral', -35);
const minSilencio = opcion('min', 0.5);
const aire = opcion('aire', 0.12);
const tramoMin = opcion('tramo-min', 0.25);

const duracion = Number(
  spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }).stdout.trim(),
);
if (!duracion) {
  console.error(`No se pudo leer la duración de ${video}. ¿Existe el archivo y está instalado ffprobe?`);
  process.exit(1);
}

const { stderr } = spawnSync(
  'ffmpeg',
  ['-hide_banner', '-nostats', '-i', video, '-vn', '-af', `silencedetect=noise=${umbral}dB:d=${minSilencio}`, '-f', 'null', '-'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
);

const silencios = [];
let inicio = null;
for (const linea of stderr.split('\n')) {
  const s = linea.match(/silence_start: (-?[\d.]+)/);
  const e = linea.match(/silence_end: ([\d.]+)/);
  if (s) inicio = Math.max(0, Number(s[1]));
  if (e && inicio !== null) {
    silencios.push([inicio, Number(e[1])]);
    inicio = null;
  }
}
if (inicio !== null) silencios.push([inicio, duracion]);

// Invertir silencios en tramos hablados, con aire a cada lado.
const tramos = [];
let cursor = 0;
for (const [s, e] of silencios) {
  if (s > cursor) tramos.push({ desde: cursor, hasta: s });
  cursor = e;
}
if (cursor < duracion) tramos.push({ desde: cursor, hasta: duracion });

const conAire = tramos
  .map((t) => ({ desde: Math.max(0, t.desde - aire), hasta: Math.min(duracion, t.hasta + aire) }))
  .filter((t) => t.hasta - t.desde >= tramoMin);

// Unir tramos que se solapan tras sumar el aire.
const cortes = [];
for (const t of conAire) {
  const ultimo = cortes.at(-1);
  if (ultimo && t.desde <= ultimo.hasta) ultimo.hasta = t.hasta;
  else cortes.push({ ...t });
}
const redondear = (n) => Math.round(n * 1000) / 1000;
const resultado = cortes.map((t) => ({ desde: redondear(t.desde), hasta: redondear(t.hasta) }));

mkdirSync(dirname(salida), { recursive: true });
writeFileSync(salida, JSON.stringify(resultado, null, 2));

const final = resultado.reduce((acc, t) => acc + t.hasta - t.desde, 0);
console.log(`✅ ${resultado.length} tramos → ${salida}`);
console.log(`   ${duracion.toFixed(1)} s originales → ${final.toFixed(1)} s (${silencios.length} silencios cortados)`);
