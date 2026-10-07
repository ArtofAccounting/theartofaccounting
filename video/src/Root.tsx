import {Composition} from 'remotion';
import {BalancesPromo, TOTAL_FRAMES} from './BalancesPromo';

export const Root: React.FC = () => (
  <>
    {/* Instagram / Facebook (Reels) */}
    <Composition id="BalancesReel" component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} />
    {/* LinkedIn (4:5) */}
    <Composition id="BalancesLinkedIn" component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1350} />
  </>
);
