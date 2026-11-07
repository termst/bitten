// One-time tool (M16, T11): writes index.html from the v13.7 pieces. index.html is hand edited after this.
import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync(new URL('./.pieces.json', import.meta.url)));
const face = (fam, file, w) => ['latin', 'latin-ext'].map((s) => `@font-face{font-family:'${fam}';font-style:normal;font-weight:${w};font-display:swap;src:url(fonts/${file}-${s}-${w}-normal.woff2) format('woff2');unicode-range:${s === 'latin' ? 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' : 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'}}`).join('\n');
const fonts = [400, 500, 600, 700].map((w) => face('Barlow Condensed', 'barlow-condensed', w)).concat([600, 800].map((w) => face('Grenze Gotisch', 'grenze-gotisch', w))).join('\n');
const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Bitten</title>
<meta name="description" content="Bitten. You are an apple. You shoot seeds at snakes. A roguelike with horror, Dutch humor and up to 4 players.">
<meta name="theme-color" content="#0b0807">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Bitten">
<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#0b0807;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style>
<!-- T11: fonts are self hosted (SIL OFL 1.1, see fonts/OFL-*.txt) -->
<style>
${fonts}
</style>
<!-- Bitten v14.0: the web release. The game runs as a normal website: one page, the game script, fonts and the De Wals track as files, an app icon and an offline cache, so it installs on a phone home screen and plays without a connection. Downloads (save, texts file) work in any browser. Couch coop and online coop for up to 4 apples, see the Multiplayer tab in How to play. -->
${p.comments}
${p.style}
</head>
<body>
${p.markup}
<script src="bitten.js"></script>
<script>
/* T11: offline cache, only when served over http(s) */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
</body>
</html>
`;
fs.writeFileSync(new URL('../index.html', import.meta.url), out);
console.log('index.html', out.length);
