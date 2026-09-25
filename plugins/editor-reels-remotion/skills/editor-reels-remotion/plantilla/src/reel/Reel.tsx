import { useMemo } from 'react';
import { AbsoluteFill, Img, OffthreadVideo, Series, staticFile, useVideoConfig } from 'remotion';
import type { CalculateMetadataFunction } from 'remotion';
import type { Caption } from '@remotion/captions';
import { marca } from '../marca';
import { framesDeTramo, remapearCaptions, type Sfx, type Titulo, type Tramo } from './datos';
import { Subtitulos } from './Subtitulos';
import { TituloAnimado } from './TituloAnimado';
import { Efectos } from './Efectos';

export type ReelProps = {
  slug: string; // carpeta en public/reels/<slug>/
  crudo: string; // ruta del video original dentro de public/
  // Lo siguiente lo rellena calcularReel desde los JSON; no se escribe a mano.
  video?: string;
  cortes?: Tramo[];
  captions?: Caption[];
  titulo?: Titulo | null;
  sfx?: Sfx;
};

const FPS = 30;

const cargarJson = async <T,>(ruta: string, porDefecto: T): Promise<T> => {
  try {
    const r = await fetch(staticFile(ruta));
    return r.ok ? ((await r.json()) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
};

const existe = async (ruta: string) => {
  try {
    return (await fetch(staticFile(ruta), { method: 'HEAD' })).ok;
  } catch {
    return false;
  }
};

// Lee los datos del reel y calcula la duración a partir de los cortes.
export const calcularReel: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const base = `reels/${props.slug}`;
  const cortes = await cargarJson<Tramo[]>(`${base}/cortes.json`, []);
  if (cortes.length === 0) {
    throw new Error(
      `Falta public/${base}/cortes.json. Corre scripts/detectar-silencios.mjs o créalo con [{"desde":0,"hasta":<duración>}].`,
    );
  }
  const video = (await existe(`${base}/graded.mp4`)) ? `${base}/graded.mp4` : props.crudo;
  const captions = await cargarJson<Caption[]>(`${base}/captions.json`, []);
  const titulo = await cargarJson<Titulo | null>(`${base}/titulo.json`, null);
  const sfx = await cargarJson<Sfx>(`${base}/sfx.json`, {});
  const durationInFrames = cortes.reduce((acc, t) => acc + framesDeTramo(t, FPS), 0);
  return { durationInFrames, fps: FPS, props: { ...props, video, cortes, captions, titulo, sfx } };
};

export const Reel: React.FC<ReelProps> = ({ video, cortes = [], captions = [], titulo = null, sfx = {} }) => {
  const { fps } = useVideoConfig();
  const captionsReel = useMemo(() => remapearCaptions(captions, cortes, fps), [captions, cortes, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      <Series>
        {cortes.map((t, i) => {
          const desde = Math.round(t.desde * fps);
          const frames = framesDeTramo(t, fps);
          return (
            <Series.Sequence key={i} durationInFrames={frames}>
              {/* En Remotion < 4.0.319 usa startFrom/endAt en lugar de trimBefore/trimAfter. */}
              <OffthreadVideo
                src={staticFile(video!)}
                trimBefore={desde}
                trimAfter={desde + frames}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Series.Sequence>
          );
        })}
      </Series>

      <Subtitulos captions={captionsReel} ocultarHastaMs={titulo ? titulo.duracion * 1000 : 0} />
      {titulo ? <TituloAnimado texto={titulo.texto} duracion={titulo.duracion} /> : null}
      <Efectos sfx={sfx} cortes={cortes} captions={captionsReel} />

      {marca.logo ? (
        <Img src={staticFile(marca.logo)} style={{ position: 'absolute', top: 240, right: 60, width: 110, opacity: 0.9 }} />
      ) : null}
    </AbsoluteFill>
  );
};
