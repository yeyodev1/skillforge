import { useMemo } from 'react';
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from '@remotion/captions';
import { marca } from '../marca';

// Menos milisegundos = menos palabras por pantalla. 600 da 2–3 palabras en español hablado.
const AGRUPAR_MS = 600;

const Pagina: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ahoraMs = page.startMs + (frame / fps) * 1000;
  const entrada = spring({ frame, fps, config: { damping: 14, stiffness: 220 }, durationInFrames: 6 });

  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          top: '58%',
          maxWidth: 900,
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          fontFamily: marca.fuente,
          fontWeight: marca.pesoSubtitulos,
          fontSize: 92,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          color: marca.colores.texto,
          WebkitTextStroke: `14px ${marca.colores.contorno}`,
          paintOrder: 'stroke fill',
          transform: `scale(${0.85 + 0.15 * entrada})`,
        }}
      >
        {page.tokens.map((token, i) => {
          const activa = token.fromMs <= ahoraMs && token.toMs > ahoraMs;
          return (
            <span key={`${token.fromMs}-${i}`} style={{ color: activa ? marca.colores.resaltado : undefined }}>
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Subtitulos: React.FC<{ captions: Caption[]; ocultarHastaMs: number }> = ({ captions, ocultarHastaMs }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: AGRUPAR_MS }),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        if (page.startMs < ocultarHastaMs) return null;
        const siguiente = pages[i + 1];
        const desde = Math.round((page.startMs / 1000) * fps);
        const hasta = Math.round(((siguiente ? siguiente.startMs : page.startMs + page.durationMs) / 1000) * fps);
        if (hasta <= desde) return null;
        return (
          <Sequence key={i} from={desde} durationInFrames={hasta - desde} layout="none">
            <Pagina page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
