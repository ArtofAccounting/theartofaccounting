import {Composition} from 'remotion';
import {BalancesPromo} from './BalancesPromo';

const FPS = 30;
const DURATION = 24 * FPS;

export const Root: React.FC = () => (
  <>
    <Composition id="BalancesReel" component={BalancesPromo} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
    <Composition id="BalancesLinkedIn" component={BalancesPromo} durationInFrames={DURATION} fps={FPS} width={1080} height={1350} />
  </>
);
