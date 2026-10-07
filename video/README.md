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

## Control de calidad del render

El navegador a veces entrega un fotograma en blanco al renderizar en paralelo.
Antes de publicar, buscar fotogramas aislados (brillo distinto a sus dos vecinos):

```
ffmpeg -i out/MotionReel.mp4 -vf "scale=270:480,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null - 2>/dev/null | grep -o "YAVG=[0-9.]*" | cut -d= -f2 > y.txt
```

Si aparece alguno, volver a renderizar esa composición. `MotionReel` y
`MotionReelSoloVoz` tienen la misma imagen: se puede tomar el video de una y el
audio de la otra (`ffmpeg -i A.mp4 -i B.mp4 -map 0:v -map 1:a -c copy`).
