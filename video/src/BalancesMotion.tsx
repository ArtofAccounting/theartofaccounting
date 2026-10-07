/**
 * Versión "motion graphic": la interfaz del Explorador de Balances está
 * reconstruida con componentes (no capturas) y se anima en una sola toma:
 * cursor, escritura, clics, conteo de cifras, gráficos que crecen y una
 * cámara que sigue la acción. Cifras reales de CORPORACION FAVORITA C.A.
 * (Superintendencia de Compañías), tal como las muestra la herramienta.
 */
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  BLUE,
  NAVY,
  GOLD,
  MANROPE,
  PLEX,
  Stats,
  LogoFV,
  ease,
  useK,
  useIsTall,
  PromoProps,
} from './BalancesPromo';

import TIEMPOS from './voz-tiempos.json';

/** Dirección que se promociona (un solo lugar para cambiarla). */
export const SITE = 'app.finanzasview.com';

// Colores de la página (los mismos de la herramienta)
const INK = NAVY;
const MUTED = '#5B6890';
const LINE = '#E3E8F4';
const STONE = '#F3F6FC';
const GREEN = '#1B7A4B';

/* ---------------- tiempos ---------------- */

// Duración de cada escena (frames a 30 fps), ajustada a la locución
export const T5 = {hook: 112, search: 110, company: 165, charts: 95, tables: 115, stats: 100, cta: 105};
export const TOTAL5 = Object.values(T5).reduce((a, b) => a + b, 0);
const VOZ_OFFSET = 4; // la voz entra 4 frames después del corte

const DEMO_FROM = T5.hook; // la toma continua empieza al terminar el gancho
const DEMO_LEN = T5.search + T5.company + T5.charts + T5.tables;
const sS = T5.search;
const sC = sS + T5.company;
const sCh = sC + T5.charts;
// frames locales de la toma (L)
const L = {
  enter: 0,
  clickSearch: 18,
  type0: 24,
  typeStep: 4,
  pick: sS - 18,
  card: sS - 6,
  hoverMargin: sS + 78,
  toCharts: sC - 10,
  bars: sC + 6,
  stack: sC + 26,
  hoverBar: sC + 48,
  toTables: sCh - 10,
  rows: sCh + 8,
  hlNet: sCh + 32,
  toRatios: sCh + 54,
  hlSector: sCh + 74,
};
const WORD = 'favorita';

/* ---------------- utilidades ---------------- */

const E = Easing.bezier(0.45, 0, 0.2, 1);

/** Interpola por fotogramas clave: [[frame, valor], ...] con suavizado. */
const keys = (f: number, k: [number, number][]) =>
  interpolate(
    f,
    k.map((x) => x[0]),
    k.map((x) => x[1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E},
  );

const nf = (v: number, d = 0) => v.toLocaleString('es-EC', {minimumFractionDigits: d, maximumFractionDigits: d});
const money = (v: number) => '$' + nf(Math.round(v));
const millions = (v: number) => '$' + nf(v, 1) + ' M';

const pop = (f: number, at: number, len = 14) => ease(f, at, at + len);

/* ---------------- datos reales ---------------- */

const YEARS = [2022, 2023, 2024, 2025];
const ING = [2355580171, 2483015099, 2546101460, 2690137858];
const UTI = [152679114, 165234816, 157778086, 163876843];
const PC = [497406358, 447470595, 488504581, 513967400];
const PNC = [302975194, 330938051, 337974013, 328383968];
const PAT = [1680022315, 1785967495, 1867668167, 1946118212];

const RESULTS: [string, number[], 'b' | 'n' | 's'][] = [
  ['Ingresos', ING, 'n'],
  ['(−) Costo de ventas', [-1712662749, -1817217513, -1870957441, -1991880214], 's'],
  ['Ganancia bruta', [642917423, 665797586, 675144019, 698257644], 'b'],
  ['(−) Gastos de venta', [-281910007, -304020295, -306000725, -312577289], 's'],
  ['(−) Gastos administrativos', [-104562023, -87685272, -102530578, -110861846], 's'],
  ['(−) Gastos financieros', [-23918375, -27811079, -25572919, -26090524], 's'],
  ['Utilidad antes de participación e impuesto', [232525065, 246280940, 241039798, 248727985], 'b'],
  ['(−) 15% participación trabajadores', [-34878760, -36942141, -36155970, -37309198], 's'],
  ['(−) Impuesto a la renta', [-47843670, -47338196, -50323477, -51338956], 's'],
  ['(±) Impuesto diferido y otros', [2876479, 3234213, 3217735, 3797012], 's'],
  ['Utilidad neta', UTI, 'b'],
];

const RATIOS: (string | [string, string[], string])[] = [
  'Rentabilidad',
  ['Margen bruto', ['27,3%', '26,8%', '26,5%', '26,0%'], '29,0%'],
  ['Margen operativo (EBIT / ingresos)', ['10,9%', '11,0%', '10,5%', '10,2%'], '3,5%'],
  ['Margen neto', ['6,5%', '6,7%', '6,2%', '6,1%'], '1,4%'],
  ['ROA (utilidad / activo)', ['6,2%', '6,4%', '5,9%', '5,9%'], '1,9%'],
  ['ROE (utilidad / patrimonio)', ['9,1%', '9,3%', '8,4%', '8,4%'], '10,9%'],
  'Liquidez',
  ['Razón corriente', ['1,41', '1,27', '1,31', '1,36'], '1,45'],
  ['Prueba ácida (sin inventarios)', ['0,82', '0,62', '0,67', '0,76'], '—'],
  'Endeudamiento',
  ['Endeudamiento (pasivo / activo)', ['32,3%', '30,4%', '30,7%', '30,2%'], '72,1%'],
  ['Apalancamiento (pasivo / patrimonio)', ['0,48', '0,44', '0,44', '0,43'], '—'],
  ['Cobertura de intereses', ['10,72', '9,86', '10,43', '10,53'], '—'],
  'Eficiencia y crecimiento',
  ['Rotación de activos', ['0,95', '0,97', '0,95', '0,96'], '1,35'],
  ['Crecimiento de ingresos', ['—', '5,4%', '2,5%', '5,7%'], '—'],
];

const RESULTS_LIST = [
  ["COMPAÑIA DE TRANSPORTE PESADO ALIANZA FAVORITA ''ALIFAVORCOM'' S.A.", '1792801346001 · Transporte y almacenamiento'],
  ['CORPORACION FAVORITA C.A.', '1790016919001 · Comercio al por mayor y menor'],
  ['FABRICA DE FIDEOS LA FAVORITA VERDESOTO C LTDA', '1790775585001 · Industrias manufactureras'],
  ['FAVORITARECICLA S.A.', '1792956005001 · Agua, alcantarillado y saneamiento'],
  ['RADIO FAVORITA FM S.A.S.', '1291789949001 · Información y comunicación'],
];

/* ---------------- geometría de la página (px de la ventana) ---------------- */

const WW = 1000; // ancho de la ventana
const BAR = 64; // barra superior de la ventana
const PAD = 48;
const Y = {
  input: 420,
  inputH: 68,
  drop: 496,
  rowH: 66,
  card: 520,
  tiles: 520 + 178,
  tileW: (WW - 2 * PAD - 64 - 32) / 3,
  tileH: 132,
  charts: 1040,
  chartH: 430,
  results: 1500,
  ratios: 2160,
};
const tileX = (c: number) => PAD + 32 + c * (Y.tileW + 16);
const tileY = (r: number) => Y.tiles + r * (Y.tileH + 16);

/* ---------------- piezas de interfaz ---------------- */

const Cursor: React.FC<{x: number; y: number; down: number}> = ({x, y, down}) => (
  <div style={{position: 'absolute', left: x, top: y, zIndex: 50, transform: `scale(${1 - down * 0.15})`, transformOrigin: '0 0'}}>
    <svg width="34" height="40" viewBox="0 0 17 20" style={{filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.35))'}}>
      <path d="M1 1 L1 16 L5 12.5 L8 19 L10.6 17.8 L7.7 11.5 L13 11.2 Z" fill="#fff" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

const Ripple: React.FC<{x: number; y: number; at: number; f: number}> = ({x, y, at, f}) => {
  const p = ease(f, at, at + 16);
  if (f < at || p >= 1) return null;
  const r = 10 + p * 46;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        border: `3px solid ${BLUE}`,
        background: 'rgba(26,79,232,.15)',
        opacity: 1 - p,
        zIndex: 49,
      }}
    />
  );
};

const Tag: React.FC<{children: React.ReactNode; tone?: 'free' | 'gold' | 'plain'; p?: number}> = ({children, tone = 'plain', p = 1}) => {
  const s =
    tone === 'free'
      ? {background: '#E7F6EE', border: '1px solid #B9E3CB', color: GREEN}
      : tone === 'gold'
        ? {background: '#FFF3D1', border: '1px solid #F1D27A', color: INK}
        : {background: '#EEF2FC', border: `1px solid ${LINE}`, color: INK};
  return (
    <span
      style={{
        ...s,
        display: 'inline-block',
        padding: '7px 16px',
        borderRadius: 999,
        fontSize: 17,
        fontWeight: 600,
        fontFamily: PLEX,
        marginRight: 10,
        marginBottom: 10,
        opacity: p,
        transform: `scale(${0.8 + p * 0.2})`,
      }}
    >
      {children}
    </span>
  );
};

const Kpi: React.FC<{
  label: string;
  value: string;
  sub: string;
  good?: boolean;
  x: number;
  y: number;
  p: number;
  glow?: number;
}> = ({label, value, sub, good, x, y, p, glow = 0}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: Y.tileW,
      height: Y.tileH,
      border: `1.5px solid ${glow ? GOLD : LINE}`,
      borderRadius: 16,
      padding: '18px 20px',
      background: '#fff',
      opacity: p,
      transform: `translateY(${(1 - p) * 24}px) scale(${1 + glow * 0.05})`,
      boxShadow: glow ? `0 0 0 ${4 * glow}px rgba(245,168,0,.35), 0 18px 40px rgba(245,168,0,${0.35 * glow})` : 'none',
      zIndex: glow ? 5 : 1,
    }}
  >
    <div style={{fontSize: 17, color: MUTED, fontWeight: 600}}>{label}</div>
    <div style={{fontFamily: MANROPE, fontSize: 34, fontWeight: 800, color: good ? GREEN : INK, marginTop: 8, letterSpacing: -0.5}}>{value}</div>
    <div style={{fontSize: 15, color: MUTED, marginTop: 6}}>{sub}</div>
  </div>
);

const Card: React.FC<{x: number; y: number; w: number; h?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: '#fff',
      border: `1.5px solid ${LINE}`,
      borderRadius: 20,
      padding: 28,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- gráficos (SVG animado) ---------------- */

const Axis: React.FC<{w: number; h: number; max: number; step: number}> = ({w, h, max, step}) => (
  <g>
    {Array.from({length: max / step + 1}, (_, i) => {
      const y = h - (i * step * h) / max;
      return (
        <g key={i}>
          <line x1={70} x2={w} y1={y} y2={y} stroke={LINE} strokeWidth={1.5} />
          <text x={62} y={y + 5} textAnchor="end" fontSize={14} fill={MUTED} fontFamily={PLEX}>
            ${nf(i * step)} M
          </text>
        </g>
      );
    })}
  </g>
);

const Legend: React.FC<{items: [string, string][]}> = ({items}) => (
  <div style={{display: 'flex', gap: 18, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap'}}>
    {items.map(([c, t]) => (
      <span key={t} style={{display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, color: MUTED}}>
        <span style={{width: 14, height: 14, borderRadius: 7, background: c}} />
        {t}
      </span>
    ))}
  </div>
);

const BarsIncome: React.FC<{f: number; hover: number}> = ({f, hover}) => {
  const w = 390;
  const h = 250;
  const max = 3000;
  const gw = (w - 80) / 4;
  return (
    <div style={{position: 'relative'}}>
      <svg width={w} height={h + 30}>
        <Axis w={w} h={h} max={max} step={500} />
        {YEARS.map((yr, i) => {
          const p = ease(f, L.bars + i * 5, L.bars + i * 5 + 22);
          const x = 80 + i * gw + gw * 0.12;
          const bw = gw * 0.42;
          const hi = ((ING[i] / 1e6) * h * p) / max;
          const hu = ((UTI[i] / 1e6) * h * p) / max;
          const on = i === 3 ? hover : 0;
          return (
            <g key={yr}>
              <rect x={x} y={h - hi} width={bw} height={hi} rx={4} fill={BLUE} opacity={1 - hover * 0.35 + on * 0.35} />
              <rect x={x + bw + 4} y={h - hu} width={bw * 0.8} height={hu} rx={3} fill={INK} />
              <text x={x + bw} y={h + 24} textAnchor="middle" fontSize={15} fill={MUTED} fontFamily={PLEX}>
                {yr}
              </text>
            </g>
          );
        })}
      </svg>
      {hover > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 170,
            top: 0,
            background: INK,
            color: '#fff',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 15,
            lineHeight: 1.45,
            opacity: hover,
            transform: `translateY(${(1 - hover) * 10}px)`,
            boxShadow: '0 12px 30px rgba(11,27,74,.35)',
          }}
        >
          <b style={{fontFamily: MANROPE}}>2025</b>
          <br />
          Ingresos: {millions(ING[3] / 1e6)}
          <br />
          Utilidad: {millions(UTI[3] / 1e6)}
        </div>
      )}
      <Legend items={[[BLUE, 'Ingresos'], [INK, 'Utilidad neta']]} />
    </div>
  );
};

const BarsFinance: React.FC<{f: number}> = ({f}) => {
  const w = 390;
  const h = 250;
  const max = 3000;
  const gw = (w - 80) / 4;
  const cols = ['#A9BEF7', BLUE, INK];
  return (
    <div>
      <svg width={w} height={h + 30}>
        <Axis w={w} h={h} max={max} step={500} />
        {YEARS.map((yr, i) => {
          const x = 80 + i * gw + gw * 0.15;
          const bw = gw * 0.7;
          let acc = 0;
          return (
            <g key={yr}>
              {[PC[i], PNC[i], PAT[i]].map((v, j) => {
                const p = ease(f, L.stack + i * 4 + j * 7, L.stack + i * 4 + j * 7 + 18);
                const hh = ((v / 1e6) * h * p) / max;
                const y = h - acc - hh;
                acc += hh;
                return <rect key={j} x={x} y={y} width={bw} height={hh} fill={cols[j]} />;
              })}
              <text x={x + bw / 2} y={h + 24} textAnchor="middle" fontSize={15} fill={MUTED} fontFamily={PLEX}>
                {yr}
              </text>
            </g>
          );
        })}
      </svg>
      <Legend items={[[cols[0], 'Pasivo corriente'], [cols[1], 'Pasivo no corriente'], [cols[2], 'Patrimonio']]} />
    </div>
  );
};

/* ---------------- la página completa ---------------- */

const Page: React.FC<{f: number}> = ({f}) => {
  const typed = Math.max(0, Math.min(WORD.length, Math.floor((f - L.type0) / L.typeStep) + 1));
  const picked = f >= L.pick;
  const text = picked ? 'CORPORACION FAVORITA C.A.' : WORD.slice(0, f >= L.type0 ? typed : 0);
  const focus = f >= L.clickSearch && f < L.pick + 4;
  const caretOn = focus && Math.floor(f / 8) % 2 === 0;
  const dropOpen = !picked && typed >= 2 && f >= L.type0;
  const dropP = ease(f, L.type0 + L.typeStep * 1, L.type0 + L.typeStep * 1 + 10);
  const hoverRow = ease(f, L.pick - 22, L.pick - 14);
  const loading = f >= L.pick && f < L.card;
  const cp = pop(f, L.card, 16);

  // conteo de las cifras
  const cnt = (i: number) => ease(f, L.card + 22 + i * 6, L.card + 22 + i * 6 + 26);
  const marginGlow = ease(f, L.hoverMargin + 6, L.hoverMargin + 18);

  return (
    <div style={{position: 'relative', width: WW, height: 3200, background: '#fff', fontFamily: PLEX, color: INK}}>
      {/* encabezado del sitio, sin nombre personal */}
      <div style={{position: 'absolute', left: 0, top: 0, width: WW, height: 84, borderBottom: `1.5px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: `0 ${PAD}px`, boxSizing: 'border-box', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <svg width="38" height="34" viewBox="0 0 108 98">
            <path fill={BLUE} d="M1.7 6 H61.3 L55.4 16.6 H16.2 L21.5 26.2 H51 V35.4 H26.9 L55.6 87 L51.2 95.3 Z" />
            <path fill={GOLD} d="M42.1 40.8 H51 L62 59.2 L95.3 1.3 H105.3 L61.5 76.4 Z" />
          </svg>
          <span style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 22, color: BLUE}}>{SITE}</span>
        </div>
        <span style={{fontSize: 18, fontWeight: 600}}>Herramientas</span>
      </div>

      {/* hero */}
      <div style={{position: 'absolute', left: PAD, top: 116, width: WW - 2 * PAD}}>
        <div style={{color: BLUE, fontWeight: 600, fontSize: 18}}>Herramienta gratuita</div>
        <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 52, letterSpacing: -1.5, marginTop: 6}}>Explorador de Balances</div>
        <div style={{fontSize: 20, color: '#3D4A72', marginTop: 8, lineHeight: 1.45}}>
          Busca una empresa del Ecuador y mira sus estados financieros, sus ratios y cómo se compara con su sector.
        </div>
        <div style={{marginTop: 16}}>
          <Tag tone="free">Gratis</Tag>
          <Tag>174.833 empresas</Tag>
          <Tag>Datos 2022–2025</Tag>
        </div>
      </div>

      {/* buscador */}
      <div style={{position: 'absolute', left: PAD, top: Y.input - 34, color: BLUE, fontWeight: 600, fontSize: 18}}>Buscar empresa</div>
      <div
        style={{
          position: 'absolute',
          left: PAD,
          top: Y.input,
          width: WW - 2 * PAD,
          height: Y.inputH,
          border: `2px solid ${focus ? BLUE : LINE}`,
          borderRadius: 14,
          boxShadow: focus ? '0 0 0 5px rgba(26,79,232,.15)' : 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          boxSizing: 'border-box',
          fontSize: 22,
          zIndex: 20,
          background: '#fff',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" style={{marginRight: 14}}>
          <circle cx="10" cy="10" r="7" stroke={MUTED} strokeWidth="2.4" fill="none" />
          <path d="M15.5 15.5 L21 21" stroke={MUTED} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {text ? <span>{text}</span> : <span style={{color: '#9AA5C4'}}>Nombre o RUC de la empresa</span>}
        <span style={{width: 2.5, height: 28, background: caretOn ? INK : 'transparent', marginLeft: 2}} />
      </div>

      {/* resultados */}
      {dropOpen && (
        <div
          style={{
            position: 'absolute',
            left: PAD,
            top: Y.drop,
            width: WW - 2 * PAD,
            background: '#fff',
            border: `1.5px solid ${LINE}`,
            borderRadius: 14,
            boxShadow: '0 24px 50px -12px rgba(11,27,74,.3)',
            overflow: 'hidden',
            zIndex: 30,
            opacity: dropP,
            transform: `translateY(${(1 - dropP) * -10}px)`,
          }}
        >
          {RESULTS_LIST.map(([n, r], i) => {
            const rp = ease(f, L.type0 + L.typeStep + i * 3, L.type0 + L.typeStep + i * 3 + 10);
            return (
              <div
                key={n}
                style={{
                  height: Y.rowH,
                  padding: '9px 20px',
                  boxSizing: 'border-box',
                  borderBottom: `1px solid ${LINE}`,
                  background: i === 1 ? `rgba(26,79,232,${0.09 * hoverRow})` : '#fff',
                  opacity: rp,
                  transform: `translateX(${(1 - rp) * 20}px)`,
                }}
              >
                <div style={{fontSize: 18, fontWeight: i === 1 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{n}</div>
                <div style={{fontSize: 14, color: MUTED}}>RUC {r}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* esqueleto de carga */}
      {loading && (
        <Card x={PAD} y={Y.card} w={WW - 2 * PAD} h={480}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: i === 0 ? 34 : 22,
                width: ['60%', '45%', '80%', '70%'][i],
                borderRadius: 8,
                marginBottom: 22,
                background: `linear-gradient(90deg, ${STONE} 0%, #E6ECFA ${((f * 6) % 200) - 50}%, ${STONE} 100%)`,
              }}
            />
          ))}
        </Card>
      )}

      {/* ficha de la empresa */}
      {f >= L.card && (
        <Card x={PAD} y={Y.card} w={WW - 2 * PAD} h={Y.tiles - Y.card + 2 * (Y.tileH + 16) + 20} style={{opacity: cp, transform: `translateY(${(1 - cp) * 30}px)`}}>
          <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 34, letterSpacing: -0.5}}>CORPORACION FAVORITA C.A.</div>
          <div style={{fontSize: 18, color: MUTED, marginTop: 6}}>RUC 1790016919001 · Comercio al por mayor y menor</div>
          <div style={{marginTop: 14}}>
            <Tag p={pop(f, L.card + 8)}>Último balance: 2025</Tag>
            <Tag p={pop(f, L.card + 12)}>Gran empresa por ventas</Tag>
            <Tag tone="gold" p={pop(f, L.card + 16)}>
              Top 1% de su sector por ventas
            </Tag>
          </div>
        </Card>
      )}
      {f >= L.card && (
        <>
          <Kpi label="Ingresos" value={millions(2690.1 * cnt(0))} sub="+5,7% frente a 2024" x={tileX(0)} y={tileY(0)} p={pop(f, L.card + 18 + 0)} />
          <Kpi label="Utilidad neta" value={millions(163.9 * cnt(1))} sub="2025" good x={tileX(1)} y={tileY(0)} p={pop(f, L.card + 18 + 6)} />
          <Kpi label="Margen neto" value={nf(6.1 * cnt(2), 1) + '%'} sub="Sector: 1,4%" good x={tileX(2)} y={tileY(0)} p={pop(f, L.card + 18 + 12)} glow={marginGlow} />
          <div
            style={{
              position: 'absolute',
              left: tileX(2) + Y.tileW - 150,
              top: tileY(0) - 22,
              zIndex: 8,
              background: GOLD,
              color: INK,
              fontFamily: MANROPE,
              fontWeight: 800,
              fontSize: 20,
              padding: '8px 16px',
              borderRadius: 999,
              boxShadow: '0 10px 30px rgba(245,168,0,.55)',
              opacity: marginGlow,
              transform: `scale(${0.6 + 0.4 * marginGlow}) rotate(-4deg)`,
            }}
          >
            4× su sector
          </div>
          <Kpi label="ROE" value={nf(8.4 * cnt(3), 1) + '%'} sub="Sector: 10,9%" good x={tileX(0)} y={tileY(1)} p={pop(f, L.card + 18 + 18)} />
          <Kpi label="Activo total" value={millions(2788.5 * cnt(4))} sub="2025" x={tileX(1)} y={tileY(1)} p={pop(f, L.card + 18 + 24)} />
          <Kpi label="Gasto en personal" value={millions(182.8 * cnt(5))} sub="6,8% de los ingresos" x={tileX(2)} y={tileY(1)} p={pop(f, L.card + 18 + 30)} />
        </>
      )}

      {/* gráficos */}
      {f >= L.card && (
        <>
          <Card x={PAD} y={Y.charts} w={(WW - 2 * PAD - 16) / 2} h={Y.chartH}>
            <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 22}}>Ingresos y utilidad</div>
            <div style={{fontSize: 15, color: MUTED, margin: '4px 0 14px'}}>Cuánto vende y cuánto le queda.</div>
            <BarsIncome f={f} hover={ease(f, L.hoverBar + 8, L.hoverBar + 16) * (1 - ease(f, L.toTables - 6, L.toTables))} />
          </Card>
          <Card x={PAD + (WW - 2 * PAD) / 2 + 8} y={Y.charts} w={(WW - 2 * PAD - 16) / 2} h={Y.chartH}>
            <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 22}}>¿Cómo se financian sus activos?</div>
            <div style={{fontSize: 15, color: MUTED, margin: '4px 0 14px'}}>Deudas frente a patrimonio.</div>
            <BarsFinance f={f} />
          </Card>
        </>
      )}

      {/* estado de resultados */}
      {f >= L.card && (
        <Card x={PAD} y={Y.results} w={WW - 2 * PAD}>
          <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 24, marginBottom: 12}}>Estado de resultados (USD)</div>
          <TableHead cols={YEARS.map(String)} />
          {RESULTS.map(([label, vals, kind], i) => {
            const rp = ease(f, L.rows + i * 2, L.rows + i * 2 + 10);
            const hl = label === 'Utilidad neta' ? ease(f, L.hlNet, L.hlNet + 14) : 0;
            return (
              <Row key={label} p={rp} hl={hl} bold={kind === 'b'} indent={kind === 's'} label={label} cells={vals.map(money)} />
            );
          })}
        </Card>
      )}

      {/* indicadores */}
      {f >= L.card && (
        <Card x={PAD} y={Y.ratios} w={WW - 2 * PAD}>
          <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 24, marginBottom: 12}}>Indicadores financieros</div>
          <div style={{position: 'relative'}}>
            <TableHead cols={[...YEARS.map(String), 'Sector 2025']} ratio />
            {RATIOS.map((r, i) =>
              typeof r === 'string' ? (
                <div key={r} style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 17, padding: '12px 10px 6px'}}>
                  {r}
                </div>
              ) : (
                <Row key={r[0]} p={ease(f, L.toRatios + 4 + i * 0.8, L.toRatios + 12 + i * 0.8)} label={r[0]} cells={[...r[1], r[2]]} ratio good />
              ),
            )}
            <div
              style={{
                position: 'absolute',
                right: -6,
                top: -4,
                width: 132,
                bottom: -4,
                border: `4px solid ${GOLD}`,
                borderRadius: 14,
                background: 'rgba(245,168,0,.10)',
                opacity: ease(f, L.hlSector, L.hlSector + 12),
                transform: `scaleY(${ease(f, L.hlSector, L.hlSector + 18)})`,
                transformOrigin: 'top',
                boxShadow: '0 0 30px rgba(245,168,0,.4)',
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

const COLW = 128;
const TableHead: React.FC<{cols: string[]; ratio?: boolean}> = ({cols, ratio}) => (
  <div style={{display: 'flex', borderBottom: `1.5px solid ${LINE}`, padding: '8px 10px', fontSize: 15, fontWeight: 600, color: MUTED}}>
    <div style={{flex: 1}} />
    {cols.map((c, i) => (
      <div key={c} style={{width: ratio ? (i === 4 ? 120 : 104) : COLW, textAlign: 'right'}}>
        {c}
      </div>
    ))}
  </div>
);

const Row: React.FC<{
  label: string;
  cells: string[];
  p: number;
  hl?: number;
  bold?: boolean;
  indent?: boolean;
  ratio?: boolean;
  good?: boolean;
}> = ({label, cells, p, hl = 0, bold, indent, ratio, good}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '9px 10px',
      borderBottom: `1px solid ${LINE}`,
      fontSize: ratio ? 16 : 15.5,
      fontWeight: bold ? 700 : 400,
      opacity: p,
      transform: `translateX(${(1 - p) * 30}px)`,
      position: 'relative',
      borderRadius: hl ? 10 : 0,
      background: hl ? `rgba(245,168,0,${0.16 * hl})` : 'transparent',
      boxShadow: hl ? `0 0 0 ${3 * hl}px ${GOLD}` : 'none',
    }}
  >
    <div style={{flex: 1, paddingLeft: indent ? 18 : 0, color: indent ? '#3D4A72' : INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</div>
    {cells.map((c, i) => (
      <div
        key={i}
        style={{
          width: ratio ? (i === 4 ? 120 : 104) : COLW,
          textAlign: 'right',
          color: ratio ? (i === 4 ? INK : good ? GREEN : INK) : INK,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {c}
      </div>
    ))}
  </div>
);

/* ---------------- ventana, cámara y cursor ---------------- */

/** Recorrido de la toma: desplazamiento de la página, cámara y cursor. */
const useShot = (f: number, viewH: number) => {
  const scroll = keys(f, [
    [0, 0],
    [L.toCharts, 0],
    [L.toCharts + 24, Y.charts - 70],
    [L.toTables, Y.charts - 70],
    [L.toTables + 24, Y.results - 40],
    [L.toRatios, Y.results - 40],
    [L.toRatios + 22, Y.ratios - 40],
  ]);
  // cámara: punto de la ventana (coords. de pantalla de la ventana) y acercamiento
  const fx = keys(f, [
    [0, WW / 2],
    [10, WW / 2],
    [L.clickSearch, 480],
    [L.pick, 480],
    [L.card + 30, WW / 2],
    [L.hoverMargin - 10, WW / 2],
    [L.hoverMargin + 10, 760],
    [L.toCharts - 5, 760],
    [L.toCharts + 20, WW / 2],
    [L.hoverBar, WW / 2],
    [L.hoverBar + 12, 330],
    [L.toTables - 4, 330],
    [L.toTables + 16, WW / 2],
    [L.hlNet - 4, WW / 2],
    [L.hlNet + 10, 640],
    [L.toRatios - 4, 640],
    [L.toRatios + 16, WW / 2],
    [L.hlSector, WW / 2],
    [L.hlSector + 14, 820],
  ]);
  const fy = keys(f, [
    [0, viewH / 2],
    [10, viewH / 2],
    [L.clickSearch, Y.input + 170],
    [L.pick, Y.input + 170],
    [L.card + 30, Y.tiles + 80],
    [L.hoverMargin + 10, Y.tiles + 70],
    [L.toCharts - 5, Y.tiles + 70],
    [L.toCharts + 20, 70 + Y.chartH / 2],
    [L.hoverBar + 12, 70 + Y.chartH / 2 - 20],
    [L.toTables - 4, 70 + Y.chartH / 2 - 20],
    [L.toTables + 16, viewH * 0.42],
    [L.hlNet + 10, 40 + 540],
    [L.toRatios - 4, 40 + 540],
    [L.toRatios + 16, viewH * 0.42],
    [L.hlSector + 14, viewH * 0.42],
  ]);
  const zoom = keys(f, [
    [0, 1],
    [10, 1],
    [L.clickSearch, 1.32],
    [L.pick, 1.32],
    [L.card + 30, 1.08],
    [L.hoverMargin - 10, 1.08],
    [L.hoverMargin + 10, 1.5],
    [L.toCharts - 5, 1.5],
    [L.toCharts + 20, 1.25],
    [L.hoverBar, 1.25],
    [L.hoverBar + 12, 1.4],
    [L.toTables - 4, 1.4],
    [L.toTables + 16, 1.05],
    [L.hlNet - 4, 1.05],
    [L.hlNet + 10, 1.35],
    [L.toRatios - 4, 1.35],
    [L.toRatios + 16, 1.05],
    [L.hlSector, 1.05],
    [L.hlSector + 14, 1.3],
  ]);
  // cursor (coords. de pantalla de la ventana)
  const mx = keys(f, [
    [0, 820],
    [6, 820],
    [L.clickSearch - 4, 400],
    [L.pick - 30, 400],
    [L.pick - 14, 330],
    [L.card + 40, 330],
    [L.hoverMargin, tileX(2) + Y.tileW * 0.55],
    [L.toCharts, tileX(2) + Y.tileW * 0.55],
    [L.hoverBar, 400],
    [L.toTables, 400],
    [L.hlNet - 6, 560],
    [L.toRatios, 560],
    [L.hlSector - 4, 870],
  ]);
  const my = keys(f, [
    [0, viewH * 0.75],
    [6, viewH * 0.75],
    [L.clickSearch - 4, Y.input + Y.inputH / 2],
    [L.pick - 30, Y.input + Y.inputH / 2],
    [L.pick - 14, Y.drop + Y.rowH * 1.5],
    [L.card + 40, Y.drop + Y.rowH * 1.5],
    [L.hoverMargin, tileY(0) + Y.tileH * 0.6],
    [L.toCharts, tileY(0) + Y.tileH * 0.6 - 0],
    [L.hoverBar, 70 + 28 + 60 + 110],
    [L.toTables, 70 + 28 + 60 + 110],
    [L.hlNet - 6, 40 + 560],
    [L.toRatios, 40 + 560],
    [L.hlSector - 4, viewH * 0.4],
  ]);
  const clicks = [L.clickSearch, L.pick];
  const down = Math.max(...clicks.map((c) => (f >= c - 3 && f < c + 4 ? 1 : 0)));
  return {scroll, fx, fy, zoom, mx, my, down, clicks};
};

const Window: React.FC<{f: number; viewH: number}> = ({f, viewH}) => {
  const {scroll, mx, my, down, clicks} = useShot(f, viewH);
  return (
    <div
      style={{
        width: WW,
        height: viewH + BAR,
        borderRadius: 26,
        overflow: 'hidden',
        background: '#0D1638',
        boxShadow: '0 60px 140px rgba(0,0,0,.6), 0 0 0 1.5px rgba(255,255,255,.12), 0 0 80px rgba(26,79,232,.35)',
        position: 'relative',
      }}
    >
      {/* barra de la ventana */}
      <div style={{height: BAR, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 10, background: 'linear-gradient(180deg,#16204A,#0D1638)'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} style={{width: 15, height: 15, borderRadius: 8, background: c, opacity: 0.9}} />
        ))}
        <div
          style={{
            marginLeft: 24,
            flex: 1,
            height: 38,
            borderRadius: 12,
            background: 'rgba(255,255,255,.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
            color: '#C9D6FF',
            fontSize: 17,
            fontFamily: PLEX,
          }}
        >
          <svg width="14" height="16" viewBox="0 0 14 16">
            <rect x="1" y="7" width="12" height="8" rx="2" fill="#C9D6FF" />
            <path d="M4 7 V5 a3 3 0 0 1 6 0 V7" stroke="#C9D6FF" strokeWidth="2" fill="none" />
          </svg>
          {SITE}
        </div>
        <span style={{marginLeft: 12, fontSize: 14, fontWeight: 700, color: '#fff', background: 'rgba(245,168,0,.9)', borderRadius: 999, padding: '5px 12px', fontFamily: MANROPE}}>
          GRATIS
        </span>
      </div>
      {/* contenido */}
      <div style={{position: 'relative', height: viewH, overflow: 'hidden', background: '#fff'}}>
        <div style={{transform: `translateY(${-scroll}px)`}}>
          <Page f={f} />
        </div>
        {clicks.map((c) => (
          <Ripple key={c} x={mx} y={my} at={c} f={f} />
        ))}
        <Cursor x={mx} y={my} down={down} />
      </div>
    </div>
  );
};

const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const tall = useIsTall();
  const top = tall ? 380 : 250 * (height / 1350);
  const viewH = height - top - (tall ? 70 : 40) - BAR;
  const base = Math.min((width * 0.93) / WW, 1);
  const {fx, fy, zoom} = useShot(f, viewH);
  // entrada de la ventana: solo 2D (las transformaciones 3D hacían parpadear el render)
  const enter = ease(f, 0, 14);
  const z = zoom * base * (0.92 + 0.08 * enter);
  const cx = width / 2;
  const cy = top + (viewH + BAR) * base * 0.5;
  let X = cx - fx * z;
  let Yy = cy - (fy + BAR / 2) * z;
  // límites: la ventana nunca deja huecos dentro del área visible
  const Wz = WW * z;
  const Hz = (viewH + BAR) * z;
  const areaBottom = top + (viewH + BAR) * base;
  X = Wz >= width ? Math.min(0, Math.max(width - Wz, X)) : (width - Wz) / 2;
  Yy = Math.min(top, Math.max(areaBottom - Hz, Yy)) + (1 - enter) * 120;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(${Math.round(X)}px, ${Math.round(Yy)}px) scale(${z})`,
          opacity: enter,
        }}
      >
        <Window f={f} viewH={viewH} />
      </div>
      {/* viñeta superior para que los subtítulos se lean sobre la ventana */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(6,13,38,.97) 0%, rgba(6,13,38,.8) ${tall ? 15 : 16}%, transparent ${tall ? 23 : 25}%)`}} />
      <Punch />
    </AbsoluteFill>
  );
};

/** Golpe visual con la cifra clave, sincronizado con la voz. */
const Punch: React.FC = () => {
  const f = useCurrentFrame();
  const k = useK();
  const at = sS + VOZ_OFFSET + 2;
  const p = ease(f, at, at + 8);
  const out = ease(f, at + 44, at + 54);
  if (f < at || out >= 1) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(6,13,38,${0.88 * p * (1 - out)})`}}>
      <div style={{textAlign: 'center', opacity: p * (1 - out), transform: `scale(${1.6 - 0.6 * p + out * 0.2})`}}>
        <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 64 * k, color: '#fff', letterSpacing: 2 * k}}>UTILIDAD 2025</div>
        <div style={{fontFamily: MANROPE, fontWeight: 800, fontSize: 190 * k, color: GOLD, letterSpacing: -6 * k, lineHeight: 1, textShadow: '0 20px 60px rgba(245,168,0,.45)'}}>
          $163,9 M
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- subtítulos palabra por palabra ---------------- */

type Linea = keyof (typeof TIEMPOS)['em_alex'];
// Texto en pantalla. "palabra|peso" ajusta la duración de las cifras habladas.
const SUBS: Record<Linea, string> = {
  hook: '¿Sabes cuánto ganó la dueña de Supermaxi en 2025|14?',
  search: 'Entra al Explorador de Balances y búscala por nombre o RUC.',
  company: '$163|22 millones de utilidad. Y un margen 4|6 veces mayor que el de su sector.',
  charts: 'Mira 4|6 años de evolución, y cómo se financia.',
  tables: 'Estados financieros completos, frente a la mediana del sector.',
  stats: 'Más de 170.000|26 empresas del Ecuador. Gratis.',
  cta: 'Búscala ya en app.finanzasview.com|30',
};
const RESALTE = /^(Supermaxi|2025|\$163|millones|4|cuatro|completos|mediana|Gratis|nombre|RUC|170\.000)/;

const WordCaptions: React.FC<{linea: Linea; voz: string; big?: boolean}> = ({linea, voz, big}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useK();
  const tall = useIsTall();
  const t = (TIEMPOS as Record<string, Record<string, {start: number; end: number}>>)[voz]?.[linea] ?? TIEMPOS.em_alex[linea];
  const toks = SUBS[linea].split(' ').map((w) => {
    const m = w.match(/^(.*?)\|(\d+)(.*)$/);
    const txt = m ? m[1] + m[3] : w;
    const base = m ? +m[2] : txt.replace(/[¿?.,]/g, '').length + 1;
    return {txt, peso: base + (/[.,?]$/.test(txt) ? 4 : 0)};
  });
  const total = toks.reduce((a, b) => a + b.peso, 0);
  const t0 = VOZ_OFFSET + t.start * fps;
  const span = (t.end - t.start) * fps;
  let acc = 0;
  const words = toks.map((w) => {
    const s0 = t0 + (acc / total) * span;
    acc += w.peso;
    return {...w, s0};
  });
  // grupos de hasta 3 palabras; se corta también en puntuación
  const groups: (typeof words)[] = [];
  let g: typeof words = [];
  words.forEach((w) => {
    g.push(w);
    if (g.length === 3 || /[.,?]$/.test(w.txt)) {
      groups.push(g);
      g = [];
    }
  });
  if (g.length) groups.push(g);
  const cur = Math.max(0, groups.findIndex((gr, i) => f >= gr[0].s0 && (i === groups.length - 1 || f < groups[i + 1][0].s0)));
  const gr = groups[cur];
  const fs = (big ? 108 : 78) * k * (tall ? 1 : 1.15);
  return (
    <div
      style={{
        position: 'absolute',
        left: 50 * k,
        right: 50 * k,
        top: big ? '38%' : (tall ? 150 : 60) * k,
        textAlign: 'center',
        fontFamily: MANROPE,
        fontWeight: 800,
        fontSize: fs,
        lineHeight: 1.12,
        letterSpacing: -1.5 * k,
        zIndex: 20,
      }}
    >
      {gr.map((w, i) => {
        const on = f >= w.s0;
        const p = ease(f, w.s0, w.s0 + 5);
        const hot = RESALTE.test(w.txt.replace(/^[¿$]?/, (m) => (m === '$' ? '$' : '')));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: fs * 0.25,
              color: on ? (hot ? GOLD : '#fff') : 'rgba(255,255,255,.35)',
              transform: `translateY(${(1 - p) * 10}px) scale(${0.9 + 0.1 * p})`,
              textShadow: '0 4px 24px rgba(6,13,38,.95)',
            }}
          >
            {w.txt}
          </span>
        );
      })}
    </div>
  );
};

/* ---------------- gancho, fondo y cierre ---------------- */

const BG = '#060D26';
const StillBackground: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 25% 15%, rgba(26,79,232,.55), transparent 55%), radial-gradient(circle at 85% 90%, rgba(26,79,232,.35), transparent 50%)',
      }}
    />
  </AbsoluteFill>
);

/** Gancho: pregunta + cifra que se "busca" (bucle abierto que se cierra en la ficha). */
const Hook5: React.FC = () => {
  const f = useCurrentFrame();
  const k = useK();
  const digits = '$???.???.???'
    .split('')
    .map((c, i) => (c === '?' ? String((Math.floor(f / 2) * 7 + i * 3) % 10) : c))
    .join('');
  const shake = f < 6 ? Math.sin(f * 3) * 6 * (1 - f / 6) : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: '62%',
          fontFamily: MANROPE,
          fontWeight: 800,
          fontSize: 120 * k,
          color: GOLD,
          letterSpacing: -2 * k,
          fontVariantNumeric: 'tabular-nums',
          transform: `translateX(${shake}px)`,
          textShadow: '0 20px 60px rgba(245,168,0,.4)',
        }}
      >
        {digits}
      </div>
      <div style={{position: 'absolute', top: '74%', fontFamily: PLEX, fontSize: 40 * k, color: '#C9D6FF'}}>Datos públicos · Superintendencia de Compañías</div>
    </AbsoluteFill>
  );
};

const Cta5: React.FC = () => {
  const f = useCurrentFrame();
  const k = useK();
  const logo = ease(f, 0, 10);
  const pulse = 1 + Math.sin(f / 6) * 0.02 * ease(f, 30, 40);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: 60 * k, textAlign: 'center'}}>
      <div style={{background: '#fff', borderRadius: 48 * k, padding: 44 * k, transform: `scale(${0.6 + logo * 0.4})`, opacity: logo, boxShadow: '0 30px 90px rgba(26,79,232,.55)'}}>
        <LogoFV size={200 * k} />
      </div>
      <div style={{marginTop: 50 * k, fontFamily: MANROPE, fontWeight: 700, fontSize: 40 * k, color: GOLD, letterSpacing: 3 * k, opacity: ease(f, 10, 20)}}>
        EXPLORADOR DE BALANCES · GRATIS
      </div>
      <div
        style={{
          marginTop: 36 * k,
          background: '#fff',
          color: BLUE,
          fontFamily: MANROPE,
          fontWeight: 800,
          fontSize: 66 * k,
          padding: `${26 * k}px ${48 * k}px`,
          borderRadius: 999,
          opacity: ease(f, 16, 26),
          transform: `scale(${pulse})`,
          boxShadow: '0 20px 70px rgba(26,79,232,.7)',
        }}
      >
        {SITE}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- composición ---------------- */

const Sfx: React.FC<{at: number; src: string; vol?: number}> = ({at, src, vol = 1}) => (
  <Sequence from={Math.round(at)} durationInFrames={40}>
    <Audio src={staticFile(`audio/sfx/${src}.wav`)} volume={vol} />
  </Sequence>
);

export const BalancesMotion: React.FC<PromoProps> = ({musica, voz}) => {
  const starts: Record<Linea, number> = {
    hook: 0,
    search: T5.hook,
    company: T5.hook + T5.search,
    charts: T5.hook + T5.search + T5.company,
    tables: T5.hook + T5.search + T5.company + T5.charts,
    stats: DEMO_FROM + DEMO_LEN,
    cta: DEMO_FROM + DEMO_LEN + T5.stats,
  };
  const D = DEMO_FROM;
  const lineas = Object.keys(starts) as Linea[];
  return (
    <AbsoluteFill style={{fontFamily: PLEX}}>
      <StillBackground />
      {musica && <Audio src={staticFile('audio/musica_v5.wav')} volume={voz ? 0.2 : 0.6} />}
      {voz &&
        lineas.map((key) => (
          <Sequence key={key} from={starts[key] + VOZ_OFFSET}>
            <Audio src={staticFile(`audio/v5_${voz}/${key}.wav`)} />
          </Sequence>
        ))}

      {/* efectos de sonido */}
      <Sfx at={0} src="impacto" vol={0.7} />
      <Sfx at={D - 30} src="subida" vol={0.5} />
      <Sfx at={D} src="whoosh" vol={0.7} />
      <Sfx at={D + L.clickSearch} src="clic" vol={0.8} />
      {Array.from({length: WORD.length}, (_, i) => (
        <Sfx key={i} at={D + L.type0 + i * L.typeStep} src="tecla" vol={0.6} />
      ))}
      <Sfx at={D + L.pick} src="clic" vol={0.8} />
      <Sfx at={D + sS + VOZ_OFFSET + 2} src="impacto" vol={0.8} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Sfx key={'p' + i} at={D + L.card + 18 + i * 6} src="pop" vol={0.35} />
      ))}
      <Sfx at={D + L.hoverMargin + 6} src="pop" vol={0.7} />
      <Sfx at={D + L.toCharts} src="whoosh" vol={0.6} />
      <Sfx at={D + L.toTables} src="whoosh" vol={0.6} />
      <Sfx at={D + L.toRatios} src="whoosh" vol={0.5} />
      <Sfx at={D + L.hlSector} src="pop" vol={0.6} />
      <Sfx at={starts.stats} src="whoosh" vol={0.6} />
      <Sfx at={starts.cta} src="impacto" vol={0.8} />

      <Sequence from={0} durationInFrames={T5.hook}>
        <Hook5 />
        <WordCaptions linea="hook" voz={voz} big />
      </Sequence>
      <Sequence from={DEMO_FROM} durationInFrames={DEMO_LEN}>
        <Demo />
      </Sequence>
      {(['search', 'company', 'charts', 'tables'] as Linea[]).map((key) => (
        <Sequence key={key} from={starts[key]} durationInFrames={key === 'search' ? T5.search : key === 'company' ? T5.company : key === 'charts' ? T5.charts : T5.tables}>
          <WordCaptions linea={key} voz={voz} />
        </Sequence>
      ))}
      <Sequence from={starts.stats} durationInFrames={T5.stats}>
        <Stats />
      </Sequence>
      <Sequence from={starts.cta} durationInFrames={T5.cta}>
        <Cta5 />
      </Sequence>
    </AbsoluteFill>
  );
};
