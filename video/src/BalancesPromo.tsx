import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Audio,
} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Tipografías de la marca, incluidas en public/fonts (licencia OFL)
export const MANROPE = 'Manrope';
export const PLEX = 'IBM Plex Sans';
for (const w of ['600', '700', '800']) {
  loadFont({family: MANROPE, url: staticFile(`fonts/manrope-latin-${w}-normal.woff2`), weight: w});
}
for (const w of ['400', '500', '600']) {
  loadFont({family: PLEX, url: staticFile(`fonts/ibm-plex-sans-latin-${w}-normal.woff2`), weight: w});
}

// Marca (misma paleta que financesview.com)
export const BLUE = '#1A4FE8';
export const NAVY = '#0B1B4A';
export const GOLD = '#F5A800';
export const SOFT = '#C9D6FF';

const img = (f: string) => staticFile('balances/' + f);

// Medidas de las capturas (px de CSS del celular: 430 × 932; capturas a 3×)
const PHONE_W = 430;
const PHONE_H = 932;
const POS = {card: 579, charts: 1190, tables: 2270};

/* ---------------- utilidades ---------------- */

export const useSpring = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

export const ease = (frame: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });

/** Escala general: 1 en el Reel (1080×1920). */
export const useK = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width / 1080, height / 1920);
};

export const useIsTall = () => {
  const {width, height} = useVideoConfig();
  return height / width > 1.5;
};

/* ---------------- fondo ---------------- */

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${30 + drift / 10}% ${20 + drift / 20}%, rgba(26,79,232,.55), transparent 55%),
                       radial-gradient(circle at ${80 - drift / 12}% 85%, rgba(26,79,232,.35), transparent 50%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          backgroundPosition: `0 ${frame * 0.6}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------------- textos ---------------- */

export const Caption: React.FC<{
  children: React.ReactNode;
  delay?: number;
  out?: number; // frame (local) en que sale
  size?: number;
  top?: number;
}> = ({children, delay = 0, out, size = 74, top}) => {
  const frame = useCurrentFrame();
  const k = useK();
  const tall = useIsTall();
  const p = useSpring(delay);
  const o = out !== undefined ? 1 - ease(frame, out, out + 10) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70 * k,
        right: 70 * k,
        top: (top ?? (tall ? 150 : 70)) * k,
        zIndex: 10,
        textShadow: '0 4px 24px rgba(11,27,74,.9)',
        textAlign: 'center',
        fontFamily: MANROPE,
        fontWeight: 800,
        fontSize: size * k * (tall ? 1 : 1.15),
        lineHeight: 1.1,
        letterSpacing: -1.5 * k,
        color: '#fff',
        opacity: p * o,
        transform: `translateY(${(1 - p) * 40 * k}px)`,
      }}
    >
      {children}
    </div>
  );
};

export const Gold: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{color: GOLD}}>{children}</span>;

/* ---------------- celular ---------------- */

const usePhoneSize = () => {
  const {height} = useVideoConfig();
  const tall = useIsTall();
  const screenH = height * (tall ? 0.66 : 0.68);
  const screenW = (screenH * PHONE_W) / PHONE_H;
  return {screenW, screenH, s: screenW / PHONE_W};
};

const Phone: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const {screenW, screenH} = usePhoneSize();
  const bez = screenW * 0.035;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: screenH * 0.06,
        width: screenW + bez * 2,
        height: screenH + bez * 2,
        marginLeft: -(screenW / 2 + bez),
        background: '#0A0F24',
        borderRadius: screenW * 0.12,
        padding: bez,
        boxShadow: '0 40px 120px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.08) inset',
        ...style,
      }}
    >
      <div style={{width: screenW, height: screenH, borderRadius: screenW * 0.09, overflow: 'hidden', position: 'relative', background: '#fff'}}>
        {children}
      </div>
    </div>
  );
};

const Tap: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const frame = useCurrentFrame();
  const {s} = usePhoneSize();
  const show = ease(frame, at - 12, at - 4);
  const ring = ease(frame, at, at + 14);
  const r = 22 * s;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x * s - r,
          top: y * s - r,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          background: 'rgba(26,79,232,.35)',
          border: `${3 * s}px solid ${BLUE}`,
          opacity: show * (1 - ring * 0.6),
          transform: `scale(${1 - ring * 0.2})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x * s - r * 2,
          top: y * s - r * 2,
          width: r * 4,
          height: r * 4,
          borderRadius: r * 2,
          border: `${2 * s}px solid ${BLUE}`,
          opacity: (1 - ring) * (ring > 0 ? 1 : 0),
          transform: `scale(${0.5 + ring * 0.7})`,
        }}
      />
    </>
  );
};

/* ---------------- escenas ---------------- */

// 1. Gancho
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useK();
  const {width, height} = useVideoConfig();
  const zoom = interpolate(frame, [0, 90], [1.15, 1.05]);
  const line = ease(frame, 22, 40);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img
          src={img('m_full.jpg')}
          style={{
            width: width,
            position: 'absolute',
            top: -height * 0.25,
            transform: `scale(${zoom}) rotate(-6deg)`,
            filter: 'blur(6px)',
            opacity: 0.25,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', padding: 80 * k, fontFamily: MANROPE}}>
        <div style={{opacity: useSpring(0), transform: `translateY(${(1 - useSpring(0)) * 50}px)`}}>
          <div style={{fontSize: 100 * k, fontWeight: 800, color: '#fff', lineHeight: 1.02, letterSpacing: -3 * k}}>
            ¿Cuánto vende
          </div>
          <div style={{fontSize: 100 * k, fontWeight: 800, color: '#fff', lineHeight: 1.02, letterSpacing: -3 * k, display: 'inline-block', position: 'relative'}}>
            tu competencia?
            <div style={{position: 'absolute', left: 0, bottom: -8 * k, height: 14 * k, width: `${line * 100}%`, background: GOLD, borderRadius: 8}} />
          </div>
        </div>
        <div
          style={{
            marginTop: 60 * k,
            fontFamily: PLEX,
            fontSize: 50 * k,
            color: SOFT,
            fontWeight: 500,
            opacity: useSpring(30),
            transform: `translateY(${(1 - useSpring(30)) * 30}px)`,
          }}
        >
          Sus balances son públicos.
          <br />
          Ahora los ves en segundos.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 2. Búsqueda en el celular
const Search: React.FC = () => {
  const frame = useCurrentFrame();
  const {s, screenH} = usePhoneSize();
  const enter = useSpring(0, 18);
  // frames de escritura: home, t1..t8
  const typeStart = 30;
  const step = 5;
  const idx = Math.max(0, Math.min(8, Math.floor((frame - typeStart) / step) + 1));
  const src = idx === 0 ? 'm_home.jpg' : `m_t${idx}.jpg`;
  return (
    <AbsoluteFill>
      <Caption>
        Busca cualquier empresa
        <br />
        por <Gold>nombre o RUC</Gold>
      </Caption>
      <Phone style={{transform: `translateY(${(1 - enter) * screenH}px)`}}>
        <Img src={img(src)} style={{width: '100%'}} />
        <Tap x={180} y={585} at={118} />
      </Phone>
    </AbsoluteFill>
  );
};

// 3. Ficha de la empresa: desplazamiento y tarjeta de KPIs
const Company: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useK();
  const {width, height} = useVideoConfig();
  const {s} = usePhoneSize();
  const scroll = ease(frame, 5, 35, 0, POS.card - 60);
  const pop = useSpring(45, 16);
  const tall = useIsTall();
  const kw = Math.min(width * 0.86, (height * (tall ? 0.7 : 0.66) * 1170) / 1782);
  const ks = kw / 1170;
  const kh = 1782 * ks;
  // marco sobre "Margen neto" (px de la captura)
  const box = {x: 70, y: 1000, w: 496, h: 334};
  const hl = ease(frame, 78, 92);
  return (
    <AbsoluteFill>
      <Caption out={38}>Su ficha financiera, al instante</Caption>
      <Caption delay={48}>
        Margen neto <Gold>6,1 %</Gold>
        <br />
        vs. su sector 1,4 %
      </Caption>
      <Phone style={{opacity: 1 - pop * 0.6, transform: `scale(${1 - pop * 0.06})`}}>
        <Img src={img('m_full.jpg')} style={{width: '100%', transform: `translateY(${-scroll * s}px)`}} />
      </Phone>
      <div
        style={{
          position: 'absolute',
          left: (width - kw) / 2,
          top: tall ? height * 0.24 : height * 0.25,
          width: kw,
          height: kh,
          opacity: pop,
          transform: `scale(${0.7 + pop * 0.3}) translateY(${(1 - pop) * 200 * k}px)`,
          borderRadius: 24 * k,
          boxShadow: '0 50px 120px rgba(0,0,0,.5)',
        }}
      >
        <Img src={img('m_kpis.png')} style={{width: '100%', borderRadius: 24 * k}} />
        <div
          style={{
            position: 'absolute',
            left: box.x * ks - 8 * k,
            top: box.y * ks - 8 * k,
            width: box.w * ks + 16 * k,
            height: box.h * ks + 16 * k,
            border: `${7 * k}px solid ${GOLD}`,
            borderRadius: 26 * k,
            opacity: hl,
            transform: `scale(${1.15 - hl * 0.15})`,
            boxShadow: `0 0 ${40 * k}px rgba(245,168,0,.6)`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// 4. Gráficos
const ChartCard: React.FC<{src: string; at: number; out?: number; rotate?: number}> = ({src, at, out, rotate = 0}) => {
  const frame = useCurrentFrame();
  const k = useK();
  const {width, height} = useVideoConfig();
  const tall = useIsTall();
  const p = useSpring(at, 18);
  const reveal = ease(frame, at + 8, at + 40);
  const o = out !== undefined ? 1 - ease(frame, out, out + 12) : 1;
  const cw = Math.min(width * 0.92, (height * 0.62 * 1170) / 1029);
  return (
    <div
      style={{
        position: 'absolute',
        left: (width - cw) / 2,
        top: tall ? height * 0.26 : height * 0.27,
        width: cw,
        opacity: p * o,
        transform: `translateX(${(1 - p) * 300 * k - (1 - o) * 300 * k}px) rotate(${(1 - p) * rotate}deg)`,
        borderRadius: 24 * k,
        overflow: 'hidden',
        boxShadow: '0 50px 120px rgba(0,0,0,.45)',
        background: '#fff',
      }}
    >
      <Img src={img(src)} style={{width: '100%', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`}} />
    </div>
  );
};

const Charts: React.FC = () => (
  <AbsoluteFill>
    <Caption out={46}>
      <Gold>4 años</Gold> de ingresos
      <br />y utilidad
    </Caption>
    <ChartCard src="m_chart0.png" at={0} out={46} rotate={4} />
    <Caption delay={52}>
      ¿Cómo se <Gold>financia</Gold>?
      <br />
      Deuda vs. patrimonio
    </Caption>
    <ChartCard src="m_chart1.png" at={52} rotate={-4} />
  </AbsoluteFill>
);

// 5. Tablas (versión escritorio)
const TableCard: React.FC<{
  src: string;
  w: number;
  h: number;
  at: number;
  out?: number;
  hl: {x: number; y: number; w: number; h: number; at: number};
  focus: {x: number; y: number; z: number; zWide: number};
}> = ({src, w, h, at, out, hl, focus}) => {
  const frame = useCurrentFrame();
  const k = useK();
  const {width, height} = useVideoConfig();
  const tall = useIsTall();
  const p = useSpring(at, 20);
  const o = out !== undefined ? 1 - ease(frame, out, out + 12) : 1;
  const tw = Math.min(width * 0.94, ((tall ? height * 0.5 : height * 0.6) * w) / h);
  const ts = tw / w;
  const hp = ease(frame, hl.at, hl.at + 14);
  const zoom = 1 + ease(frame, hl.at + 18, hl.at + 45) * ((tall ? focus.z : focus.zWide) - 1);
  return (
    <div
      style={{
        position: 'absolute',
        left: (width - tw) / 2,
        top: height * (tall ? 0.33 : 0.3),
        transformOrigin: `${focus.x * ts}px ${focus.y * ts}px`,
        width: tw,
        opacity: p * o,
        transform: `perspective(${2000 * k}px) rotateX(${(1 - p) * 25}deg) scale(${(0.85 + p * 0.15) * zoom})`,
        boxShadow: '0 50px 120px rgba(0,0,0,.45)',
        borderRadius: 20 * k,
        background: '#fff',
      }}
    >
      <Img src={img(src)} style={{width: '100%', display: 'block', borderRadius: 20 * k}} />
      <div
        style={{
          position: 'absolute',
          left: hl.x * ts,
          top: hl.y * ts,
          width: hl.w * ts * hp,
          height: hl.h * ts,
          border: `${5 * k}px solid ${GOLD}`,
          borderRadius: 12 * k,
          background: 'rgba(245,168,0,.12)',
          opacity: hp,
          boxShadow: `0 0 ${30 * k}px rgba(245,168,0,.5)`,
        }}
      />
    </div>
  );
};

const Tables: React.FC = () => (
  <AbsoluteFill>
    <Caption out={66}>
      Estados financieros
      <br />
      <Gold>completos</Gold>
    </Caption>
    <TableCard
      src="d_table0.png"
      w={2080}
      h={1354}
      at={0}
      out={66}
      hl={{x: 50, y: 1135, w: 1980, h: 85, at: 20}}
      focus={{x: 0, y: 1250, z: 1.45, zWide: 1.2}}
    />
    <Caption delay={72}>
      Compáralo con la
      <br />
      <Gold>mediana de su sector</Gold>
    </Caption>
    <TableCard
      src="d_table2.png"
      w={2080}
      h={1946}
      at={72}
      hl={{x: 1570, y: 110, w: 450, h: 1715, at: 90}}
      focus={{x: 2000, y: 700, z: 1.7, zWide: 1.2}}
    />
  </AbsoluteFill>
);

// 6. Cifras
const Stat: React.FC<{value: string; label: string; at: number}> = ({value, label, at}) => {
  const k = useK();
  const p = useSpring(at, 14);
  return (
    <div style={{opacity: p, transform: `scale(${0.6 + p * 0.4})`, textAlign: 'center'}}>
      <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 130 * k, color: '#fff', letterSpacing: -4 * k, lineHeight: 1}}>{value}</div>
      <div style={{fontFamily: PLEX, fontWeight: 500, fontSize: 44 * k, color: SOFT, marginTop: 10 * k}}>{label}</div>
    </div>
  );
};

export const Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useK();
  const n = Math.round(ease(frame, 0, 35, 0, 174833));
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 70 * k}}>
      <Stat value={n.toLocaleString('es-EC')} label="empresas del Ecuador" at={0} />
      <Stat value="2022–2025" label="4 años de balances" at={15} />
      <Stat value="100 %" label="gratis" at={30} />
    </AbsoluteFill>
  );
};

// 7. Cierre con el logo FV
export const LogoFV: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  const blue = ease(frame, 0, 18);
  const gold = ease(frame, 12, 30);
  return (
    <svg width={size} height={(size * 98) / 108} viewBox="0 0 108 98" style={{overflow: 'visible'}}>
      <path
        fill={BLUE}
        d="M1.7 6 H61.3 L55.4 16.6 H16.2 L21.5 26.2 H51 V35.4 H26.9 L55.6 87 L51.2 95.3 Z"
        style={{opacity: blue, transform: `translateX(${(1 - blue) * -30}px)`}}
      />
      <path
        fill={GOLD}
        d="M42.1 40.8 H51 L62 59.2 L95.3 1.3 H105.3 L61.5 76.4 Z"
        style={{opacity: gold, transform: `translate(${(1 - gold) * 30}px, ${(1 - gold) * 30}px)`}}
      />
    </svg>
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const k = useK();
  const pulse = 1 + Math.sin(frame / 6) * 0.025 * ease(frame, 50, 60);
  const logo = useSpring(0, 12);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 70 * k, textAlign: 'center'}}>
      <div
        style={{
          background: '#fff',
          borderRadius: 48 * k,
          padding: 44 * k,
          transform: `scale(${0.5 + logo * 0.5})`,
          opacity: logo,
          boxShadow: '0 30px 90px rgba(26,79,232,.55)',
        }}
      >
        <LogoFV size={190 * k} />
      </div>
      <div
        style={{
          marginTop: 50 * k,
          opacity: useSpring(14),
          transform: `translateY(${(1 - useSpring(14)) * 40}px)`,
          fontFamily: MANROPE,
          fontWeight: 800,
          fontSize: 84 * k,
          color: '#fff',
          lineHeight: 1.05,
          letterSpacing: -2 * k,
        }}
      >
        El Arte de la
        <br />
        Contabilidad
      </div>
      <div
        style={{
          marginTop: 30 * k,
          opacity: useSpring(26),
          fontFamily: MANROPE,
          fontWeight: 700,
          fontSize: 38 * k,
          color: GOLD,
          letterSpacing: 3 * k,
        }}
      >
        EXPLORADOR DE BALANCES · GRATIS
      </div>
      <div
        style={{
          marginTop: 50 * k,
          background: '#fff',
          color: BLUE,
          fontFamily: MANROPE,
          fontWeight: 800,
          fontSize: 46 * k,
          padding: `${26 * k}px ${44 * k}px`,
          borderRadius: 999,
          opacity: useSpring(36),
          transform: `scale(${pulse})`,
          boxShadow: '0 20px 60px rgba(26,79,232,.6)',
        }}
      >
        herramientas.financesview.com
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- composición ---------------- */

export const T = {hook: 132, search: 165, company: 150, charts: 110, tables: 150, stats: 105, cta: 120};
export const TOTAL_FRAMES = Object.values(T).reduce((a, b) => a + b, 0);

export const Fade: React.FC<{children: React.ReactNode; dur: number}> = ({children, dur}) => {
  const frame = useCurrentFrame();
  const o = Math.min(ease(frame, 0, 8), 1 - ease(frame, dur - 8, dur));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export type PromoProps = {musica: boolean; voz: string};

export const BalancesPromo: React.FC<PromoProps> = ({musica, voz}) => {
  let t = 0;
  const seq = (dur: number, el: React.ReactNode, linea: string) => {
    const from = t;
    t += dur;
    return (
      <Sequence from={from} durationInFrames={dur}>
        {voz && (
          <Sequence from={6}>
            <Audio src={staticFile(`audio/${voz}/${linea}.wav`)} />
          </Sequence>
        )}
        <Fade dur={dur}>{el}</Fade>
      </Sequence>
    );
  };
  return (
    <AbsoluteFill style={{fontFamily: PLEX}}>
      <Background />
      {musica && <Audio src={staticFile('audio/musica.wav')} volume={voz ? 0.22 : 0.6} />}
      {seq(T.hook, <Hook />, 'hook')}
      {seq(T.search, <Search />, 'search')}
      {seq(T.company, <Company />, 'company')}
      {seq(T.charts, <Charts />, 'charts')}
      {seq(T.tables, <Tables />, 'tables')}
      {seq(T.stats, <Stats />, 'stats')}
      {seq(T.cta, <Cta />, 'cta')}
    </AbsoluteFill>
  );
};

