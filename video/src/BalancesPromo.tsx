import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

// Marca (misma paleta que financesview.com)
const BLUE = '#1A4FE8';
const NAVY = '#0B1B4A';
const GOLD = '#F5A800';
const FONT = "Manrope, 'IBM Plex Sans', 'Segoe UI', Helvetica, Arial, sans-serif";

const URL_TXT = 'herramientas.financesview.com/balances';

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200}});
};

const Fade: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay = 0, children, style}) => {
  const p = useIn(delay);
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * 40}px)`, ...style}}>{children}</div>
  );
};

const Scene: React.FC<{bg?: string; children: React.ReactNode}> = ({bg = NAVY, children}) => (
  <AbsoluteFill style={{background: bg, fontFamily: FONT, padding: 80, justifyContent: 'center'}}>{children}</AbsoluteFill>
);

const Big: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = '#fff', size = 96}) => (
  <div style={{fontSize: size, fontWeight: 800, lineHeight: 1.1, color, letterSpacing: -2}}>{children}</div>
);

const Hook = () => (
  <Scene>
    <Fade><Big>¿Sabes cómo le va a tu <span style={{color: GOLD}}>competencia</span>?</Big></Fade>
    <Fade delay={25} style={{marginTop: 40}}><Big size={52} color="#B8C7F5">Sus balances son públicos.</Big></Fade>
  </Scene>
);

const Counter = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [0, 60], [0, 170000], {extrapolateRight: 'clamp'}));
  return (
    <Scene bg={BLUE}>
      <Big size={170}>+{n.toLocaleString('es-EC')}</Big>
      <Fade delay={10} style={{marginTop: 24}}><Big size={64}>empresas del Ecuador</Big></Fade>
      <Fade delay={30} style={{marginTop: 40}}>
        <div style={{fontSize: 40, color: '#DCE6FF', fontWeight: 500}}>con datos de la Superintendencia de Compañías</div>
      </Fade>
    </Scene>
  );
};

const Kpi: React.FC<{label: string; value: string; sector: string; delay: number}> = ({label, value, sector, delay}) => (
  <Fade delay={delay} style={{background: '#fff', borderRadius: 28, padding: '28px 36px', flex: 1, minWidth: 380}}>
    <div style={{fontSize: 30, color: '#5B6890', fontWeight: 600}}>{label}</div>
    <div style={{fontSize: 76, color: NAVY, fontWeight: 800, letterSpacing: -2}}>{value}</div>
    <div style={{fontSize: 28, color: BLUE, fontWeight: 700}}>{sector}</div>
  </Fade>
);

const Demo = () => (
  <Scene bg="#EEF3FF">
    <Fade><div style={{fontSize: 34, color: BLUE, fontWeight: 800, letterSpacing: 2}}>EJEMPLO ILUSTRATIVO</div></Fade>
    <Fade delay={6} style={{marginBottom: 40}}><Big color={NAVY} size={72}>Empresa Ejemplo S.A.</Big></Fade>
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Kpi label="Margen neto" value="8,4 %" sector="Sector: 5,1 %" delay={20} />
      <Kpi label="Razón corriente" value="1,6 veces" sector="Sector: 1,3 veces" delay={40} />
      <Kpi label="Endeudamiento" value="54 %" sector="Sector: 61 %" delay={60} />
    </div>
    <Fade delay={90} style={{marginTop: 30, fontSize: 26, color: '#5B6890'}}>Cifras ficticias para ilustrar la herramienta.</Fade>
  </Scene>
);

const Features = () => {
  const items = ['Estados financieros', 'Ratios de liquidez y endeudamiento', 'Comparación con su sector'];
  return (
    <Scene>
      <Fade><Big size={72} color={GOLD}>Busca cualquier empresa y mira:</Big></Fade>
      <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 36}}>
        {items.map((t, i) => (
          <Fade key={t} delay={20 + i * 25}>
            <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
              <div style={{width: 20, height: 20, borderRadius: 10, background: GOLD, flexShrink: 0}} />
              <div style={{fontSize: 62, fontWeight: 700, color: '#fff'}}>{t}</div>
            </div>
          </Fade>
        ))}
      </div>
    </Scene>
  );
};

const Cta = () => (
  <Scene bg={BLUE}>
    <Fade><div style={{alignSelf: 'flex-start', background: GOLD, color: NAVY, fontSize: 44, fontWeight: 800, padding: '12px 36px', borderRadius: 60}}>100 % GRATIS</div></Fade>
    <Fade delay={10} style={{marginTop: 40}}><Big size={110}>Explorador de Balances</Big></Fade>
    <Fade delay={30} style={{marginTop: 50}}>
      <div style={{background: '#fff', color: BLUE, fontSize: 46, fontWeight: 800, padding: '28px 36px', borderRadius: 24}}>{URL_TXT}</div>
    </Fade>
    <Fade delay={50} style={{marginTop: 50, fontSize: 36, color: '#DCE6FF', fontWeight: 600}}>El Arte de la Contabilidad · Didimo Montoya, CPA</Fade>
  </Scene>
);

export const BalancesPromo: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0} durationInFrames={90}><Hook /></Sequence>
    <Sequence from={90} durationInFrames={120}><Counter /></Sequence>
    <Sequence from={210} durationInFrames={210}><Demo /></Sequence>
    <Sequence from={420} durationInFrames={150}><Features /></Sequence>
    <Sequence from={570} durationInFrames={150}><Cta /></Sequence>
  </AbsoluteFill>
);
