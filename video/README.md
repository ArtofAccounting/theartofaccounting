# Videos promocionales (Remotion)

- `npm install`
- `npm run studio` para editar en vivo.
- Render: `npx remotion render src/index.ts <Composición> out/<archivo>.mp4`
  - **Motion graphic** (interfaz animada con cursor y cámara, `src/BalancesMotion.tsx`):
    `MotionReel` (9:16, voz + música), `MotionReelSoloVoz` (9:16, solo voz, para
    añadir el audio en tendencia desde Instagram/TikTok) y `MotionLinkedIn` (4:5).
  - Versión con capturas (`src/BalancesPromo.tsx`): `BalancesReel`,
    `BalancesReelSoloVoz` y `BalancesLinkedIn`.
- Después del render, normalizar el volumen para redes:
  `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out.mp4`

Contenido:
- `src/BalancesPromo.tsx`: escenas y tiempos (`T`), ajustados a la locución.
- `public/balances/`: capturas reales del Explorador de Balances.
- `public/audio/<voz>/`: locución por escena (voces Kokoro: `em_alex`, `ef_dora`,
  `em_santa`). La voz se elige en `src/Root.tsx`.
- `public/audio/musica.wav`: pista original sintetizada (sin derechos de terceros).
- `public/fonts/`: Manrope e IBM Plex Sans (licencia OFL).
