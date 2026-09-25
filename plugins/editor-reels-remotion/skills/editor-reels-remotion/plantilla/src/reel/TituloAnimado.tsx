import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { marca } from '../marca';

export const TituloAnimado: React.FC<{ texto: string; duracion: number }> = ({ texto, duracion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = Math.round(duracion * fps);
  if (frame >= total) return null;

  const entrada = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const salida = interpolate(frame, [total - 8, total], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: salida }}>
      <div
        style={{
          maxWidth: 920,
          padding: '28px 44px',
          backgroundColor: marca.colores.primario,
          color: marca.colores.texto,
          fontFamily: marca.fuente,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.05,
          textAlign: 'center',
          textTransform: 'uppercase',
          borderRadius: 18,
          transform: `scale(${entrada}) rotate(${interpolate(entrada, [0, 1], [-4, 0])}deg)`,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};
