import {Composition} from 'remotion';
import {BalancesPromo, PromoProps, TOTAL_FRAMES} from './BalancesPromo';
import {BalancesMotion, TOTAL5} from './BalancesMotion';

// voz: carpeta de public/audio con la locución (em_alex, ef_dora o em_santa)
const conMusica: PromoProps = {musica: true, voz: 'em_alex'};
const sinMusica: PromoProps = {musica: false, voz: 'em_alex'};

const formatos = [
  {id: 'Reel', width: 1080, height: 1920, props: conMusica}, // Instagram / Facebook
  {id: 'ReelSoloVoz', width: 1080, height: 1920, props: sinMusica}, // para audio en tendencia desde la app
  {id: 'LinkedIn', width: 1080, height: 1350, props: conMusica}, // 4:5
];

export const Root: React.FC = () => (
  <>
    {/* Versión motion graphic: interfaz animada con cursor y cámara */}
    {formatos.map((f) => (
      <Composition key={'m' + f.id} id={'Motion' + f.id} component={BalancesMotion} durationInFrames={TOTAL5} fps={30} width={f.width} height={f.height} defaultProps={f.props} />
    ))}
    {/* Versión anterior con capturas de pantalla */}
    {formatos.map((f) => (
      <Composition key={'b' + f.id} id={'Balances' + f.id} component={BalancesPromo} durationInFrames={TOTAL_FRAMES} fps={30} width={f.width} height={f.height} defaultProps={f.props} />
    ))}
  </>
);
