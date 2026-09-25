import { Composition } from 'remotion';
import { Reel, calcularReel, type ReelProps } from './reel/Reel';

// Una <Composition> por reel. El id es el que se pasa a `npx remotion render`.
const reels: ReelProps[] = [{ slug: 'demo', crudo: 'crudo/video.mp4' }];

export const RemotionRoot: React.FC = () => (
  <>
    {reels.map((r) => (
      <Composition
        key={r.slug}
        id={`Reel-${r.slug}`}
        component={Reel}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={1}
        defaultProps={r}
        calculateMetadata={calcularReel}
      />
    ))}
  </>
);
