#!/usr/bin/env node
// Transcribe en local con whisper.cpp y guarda Caption[] de @remotion/captions (tiempos del video original).
// Uso: node scripts/transcribir.mjs <video> <salida.json> [--idioma es] [--modelo medium]
//
// Si hay un whisper-cli en el PATH (brew install whisper-cpp), se usa ese: es reciente y transcribe mejor.
// Si no, se compila whisper.cpp 1.5.5 dentro del proyecto con @remotion/install-whisper-cpp.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } from '@remotion/install-whisper-cpp';

const [video, salida, ...resto] = process.argv.slice(2);
if (!video || !salida) {
  console.error('Uso: node transcribir.mjs <video> <salida.json> [--idioma es] [--modelo medium]');
  process.exit(1);
}
const opcion = (nombre, porDefecto) => {
  const i = resto.indexOf(`--${nombre}`);
  return i === -1 ? porDefecto : resto[i + 1];
};
const idioma = opcion('idioma', 'es');
const modelo = opcion('modelo', 'medium');
if (idioma !== 'en' && modelo.endsWith('.en')) {
  console.error(`El modelo ${modelo} solo sirve para inglés. Usa uno multilingüe (small, medium, large-v3-turbo).`);
  process.exit(1);
}

// 1. Motor de whisper.cpp
const cliSistema = spawnSync('which', ['whisper-cli'], { encoding: 'utf8' }).stdout.trim();
let carpetaWhisper;
let version;
if (cliSistema) {
  // Remotion busca <carpeta>/build/bin/whisper-cli para versiones >= 1.7.4: apuntamos ahí el binario del sistema.
  carpetaWhisper = join(process.cwd(), 'whisper-sistema');
  version = '1.7.4';
  const destino = join(carpetaWhisper, 'build', 'bin', 'whisper-cli');
  if (!existsSync(destino)) {
    mkdirSync(dirname(destino), { recursive: true });
    symlinkSync(cliSistema, destino);
  }
  console.log(`🎙️  Usando whisper-cli del sistema (${cliSistema})`);
} else {
  carpetaWhisper = join(process.cwd(), 'whisper.cpp');
  version = '1.5.5';
  console.log('🎙️  No hay whisper-cli en el sistema; compilando whisper.cpp 1.5.5 en ./whisper.cpp (solo la primera vez).');
  console.log('    Para mejor calidad en español: brew install whisper-cpp (Mac) y vuelve a correr.');
  await installWhisperCpp({ to: carpetaWhisper, version });
}

// 2. Modelo (se reutiliza ~/.cache/whisper-models si ya está descargado)
const carpetaModelos = join(process.cwd(), 'whisper-modelos');
mkdirSync(carpetaModelos, { recursive: true });
const rutaModelo = join(carpetaModelos, `ggml-${modelo}.bin`);
const enCache = join(homedir(), '.cache', 'whisper-models', `ggml-${modelo}.bin`);
if (!existsSync(rutaModelo) && existsSync(enCache)) symlinkSync(enCache, rutaModelo);
await downloadWhisperModel({ model: modelo, folder: carpetaModelos });

// 3. Audio: whisper.cpp exige WAV 16 kHz mono.
const wav = join(tmpdir(), `transcribir-${Date.now()}.wav`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-vn', '-ar', '16000', '-ac', '1', wav]);

try {
  const whisperCppOutput = await transcribe({
    inputPath: wav,
    whisperPath: carpetaWhisper,
    whisperCppVersion: version,
    model: modelo,
    modelFolder: carpetaModelos,
    language: idioma,
    tokenLevelTimestamps: true,
    printOutput: false,
    // whisper.cpp >= 1.8 activa flash attention por defecto y eso apaga el DTW (marcas por palabra).
    additionalArgs: cliSistema ? ['-nfa'] : [],
  });
  const { captions: tokens } = toCaptions({ whisperCppOutput });
  // Los offsets de whisper.cpp son imprecisos (la primera palabra de cada frase arranca con el silencio previo).
  // Con --dtw cada palabra trae timestampMs, que sí cae donde se dice: lo usamos como inicio real.
  const conDtw = tokens.some((c) => c.timestampMs !== null);
  if (conDtw) {
    for (const c of tokens) if (c.timestampMs !== null) c.startMs = c.timestampMs;
    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i];
      const siguiente = tokens[i + 1];
      const hueco = siguiente ? siguiente.startMs - c.startMs : Infinity;
      c.endMs = hueco <= 1500 ? siguiente.startMs : c.startMs + Math.max(300, Math.min(700, c.endMs - c.startMs));
    }
  } else {
    console.log('⚠️  Sin marcas por palabra (DTW); los tiempos pueden adelantarse un poco.');
    for (let i = 0; i < tokens.length - 1; i++) {
      if (tokens[i + 1].startMs - tokens[i].startMs > 700) tokens[i].startMs = tokens[i + 1].startMs - 250;
    }
  }
  // whisper.cpp parte palabras en trozos ("cop" + "iar"). Unimos cada trozo sin espacio inicial a la palabra anterior
  // para que un subtítulo nunca corte una palabra por la mitad.
  const captions = [];
  for (const t of tokens) {
    const anterior = captions.at(-1);
    if (anterior && !/^\s/.test(t.text)) {
      anterior.text += t.text;
      // Un signo de puntuación no alarga la palabra: si no, el subtítulo se queda colgado durante la pausa.
      if (/\p{L}|\d/u.test(t.text)) anterior.endMs = Math.max(anterior.endMs, t.endMs);
      anterior.confidence = Math.min(anterior.confidence ?? 1, t.confidence ?? 1);
    } else {
      captions.push({ ...t });
    }
  }
  mkdirSync(dirname(salida), { recursive: true });
  writeFileSync(salida, JSON.stringify(captions, null, 2));

  const dudosas = captions
    .filter((c) => c.confidence !== null && c.confidence < 0.5 && /\p{L}{3,}/u.test(c.text))
    .map((c) => c.text.trim());
  console.log(`✅ ${captions.length} palabras → ${salida}`);
  console.log(`   ${captions.map((c) => c.text).join('').trim()}`);
  if (dudosas.length) console.log(`⚠️  Revisar (confianza baja): ${[...new Set(dudosas)].join(', ')}`);
} finally {
  rmSync(wav, { force: true });
}
