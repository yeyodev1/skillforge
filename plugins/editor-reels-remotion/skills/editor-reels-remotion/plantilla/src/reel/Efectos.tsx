import { useMemo } from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import type { Caption } from '@remotion/captions';
import { iniciosDeTramos, tieneNumero, type Sfx, type Tramo } from './datos';

// El whoosh arranca un poco antes para que el pico caiga en el corte.
const ADELANTO_WHOOSH_S = 0.08;
// Si dos cortes están más cerca que esto, el segundo no lleva whoosh.
const SEPARACION_MIN_S = 1;

type Disparo = { archivo: string; frame: number; volumen: number };

export const Efectos: React.FC<{ sfx: Sfx; cortes: Tramo[]; captions: Caption[] }> = ({ sfx, cortes, captions }) => {
  const { fps } = useVideoConfig();

  const disparos = useMemo(() => {
    const lista: Disparo[] = [];
    if (sfx.whoosh) {
      let ultimo = -Infinity;
      for (const inicio of iniciosDeTramos(cortes, fps).slice(1)) {
        if ((inicio - ultimo) / fps < SEPARACION_MIN_S) continue;
        lista.push({ archivo: sfx.whoosh.archivo, frame: Math.max(0, inicio - Math.round(ADELANTO_WHOOSH_S * fps)), volumen: sfx.whoosh.volumen ?? 0.5 });
        ultimo = inicio;
      }
    }
    if (sfx.ding) {
      for (const c of captions) {
        if (tieneNumero(c.text)) {
          lista.push({ archivo: sfx.ding.archivo, frame: Math.round((c.startMs / 1000) * fps), volumen: sfx.ding.volumen ?? 0.6 });
        }
      }
    }
    for (const e of sfx.extra ?? []) {
      lista.push({ archivo: e.archivo, frame: Math.round(e.en * fps), volumen: e.volumen ?? 0.5 });
    }
    return lista;
  }, [sfx, cortes, captions, fps]);

  return (
    <>
      {disparos.map((d, i) => (
        <Sequence key={i} from={d.frame} layout="none">
          <Audio src={staticFile(d.archivo)} volume={d.volumen} />
        </Sequence>
      ))}
    </>
  );
};
