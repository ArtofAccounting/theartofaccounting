import {Composition} from 'remotion';
import {BalancesPromo, PromoProps, TOTAL_FRAMES} from './BalancesPromo';

// voz: carpeta de public/audio con la locución (em_alex, ef_dora o em_santa)
const conMusica: PromoProps = {musica: true, voz: 'em_alex'};
const sinMusica: PromoProps = {musica: false, voz: 'em_alex'};

export const Root: React.FC = () => (
  <>
    {/* Instagram / Facebook (Reels) */}
    <Composition id="BalancesReel" component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} defaultProps={conMusica} />
    {/* Solo voz: para agregar el audio en tendencia desde la app */}
    <Composition id="BalancesReelSoloVoz" component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1920} defaultProps={sinMusica} />
    {/* LinkedIn (4:5) */}
    <Composition id="BalancesLinkedIn" component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={1080} height={1350} defaultProps={conMusica} />
  </>
);
