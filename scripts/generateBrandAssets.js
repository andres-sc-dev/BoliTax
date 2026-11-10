// AI-assisted: see docs/AI_LOG.md #20
// Genera la marca de BoliTax: los SVG del logo en assets/brand/ y, a partir de ellos, los PNG
// que necesita la app (ícono, ícono adaptativo de Android, splash e ícono de notificación).
// Uso: npm run brand:assets   (requiere la devDependency @resvg/resvg-js; no entra en la app)
//
// Logo: una "B" de trazos gruesos dentro de un cuadrado redondeado. La parte inferior de la B
// es una RUEDA (anillo) con un pequeño damero en el centro.
// - logo-b-dark:  B amarilla sobre cuadrado negro (para usar encima de fondos amarillos)
// - logo-b-light: B negra sobre cuadrado amarillo (para usar encima de fondos oscuros)
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const YELLOW = '#FFC72C';
const BLACK = '#0B0B0F';
const WHITE = '#FFFFFF';

const ROOT = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT, 'assets', 'brand');

// centro de la rueda (parte inferior de la B), en el sistema de 512 x 512
const WHEEL = { cx: 304, cy: 326, outer: 90, inner: 46, hub: 30 };

// la B: `fg` es el color de la letra; `hubAlt` es el color de los cuadros claros del damero
// (null = transparentes, para las versiones de una sola tinta)
function bGlyph(fg, hubAlt, idSuffix) {
  const { cx, cy, outer, inner, hub } = WHEEL;
  const hubSquares = hubAlt
    ? `<rect x="${cx - hub}" y="${cy}" width="${hub}" height="${hub}" fill="${hubAlt}"/>
       <rect x="${cx}" y="${cy - hub}" width="${hub}" height="${hub}" fill="${hubAlt}"/>`
    : '';
  return `
  <!-- máscara: recorta el hueco de la rueda (queda transparente también en las versiones de una tinta) -->
  <mask id="cut-${idSuffix}" maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
    <rect x="0" y="0" width="512" height="512" fill="#FFFFFF"/>
    <circle cx="${cx}" cy="${cy}" r="${inner}" fill="#000000"/>
  </mask>
  <g fill="${fg}" mask="url(#cut-${idSuffix})">
    <!-- tronco de la B -->
    <rect x="128" y="96" width="76" height="320" rx="10"/>
    <!-- panza superior (con su hueco) -->
    <path fill-rule="evenodd" d="M196 96 H300 A72 72 0 0 1 300 240 H196 Z M204 140 H296 A28 28 0 0 1 296 196 H204 Z"/>
    <!-- mitad inferior: bloque que une el tronco con la rueda -->
    <rect x="196" y="${cy - outer}" width="${cx - 196}" height="${outer * 2}"/>
    <!-- rueda: la panza inferior de la B -->
    <circle cx="${cx}" cy="${cy}" r="${outer}"/>
  </g>
  <!-- centro de la rueda: damero de 2 x 2 recortado en círculo -->
  <clipPath id="hub-${idSuffix}"><circle cx="${cx}" cy="${cy}" r="${hub}"/></clipPath>
  <g clip-path="url(#hub-${idSuffix})">
    <rect x="${cx - hub}" y="${cy - hub}" width="${hub}" height="${hub}" fill="${fg}"/>
    <rect x="${cx}" y="${cy}" width="${hub}" height="${hub}" fill="${fg}"/>
    ${hubSquares}
  </g>
  <circle cx="${cx}" cy="${cy}" r="${hub}" fill="none" stroke="${fg}" stroke-width="5"/>`;
}

// logo completo: cuadrado redondeado + B
function logoSvg({ square, fg, id }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="0" y="0" width="512" height="512" rx="112" fill="${square}"/>
  ${bGlyph(fg, square, id)}
</svg>
`;
}

// solo la B, centrada y escalada en un lienzo de `size` (para íconos sin cuadrado propio).
// La B ocupa x 128-394 e y 96-416 (centro 261, 256) en el sistema de 512.
function glyphOnlySvg({ size, fg, hubAlt, background, heightRatio, id }) {
  const scale = (size * heightRatio) / 320;
  const tx = size / 2 - 261 * scale;
  const ty = size / 2 - 256 * scale;
  const bg = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})">
    ${bGlyph(fg, hubAlt, id)}
  </g>
</svg>
`;
}

function renderPng(svg, width, outputPath) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  fs.writeFileSync(outputPath, png);
  console.log(`  ${path.relative(ROOT, outputPath)} (${width}px)`);
}

function main() {
  fs.mkdirSync(BRAND_DIR, { recursive: true });

  // 1. SVG fuente de la marca
  const darkSvg = logoSvg({ square: BLACK, fg: YELLOW, id: 'dark' });
  const lightSvg = logoSvg({ square: YELLOW, fg: BLACK, id: 'light' });
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-b-dark.svg'), darkSvg);
  fs.writeFileSync(path.join(BRAND_DIR, 'logo-b-light.svg'), lightSvg);
  console.log('SVG: assets/brand/logo-b-dark.svg y logo-b-light.svg');

  console.log('PNG:');
  // 2. logo para usar con <Image> dentro de la app
  renderPng(darkSvg, 512, path.join(BRAND_DIR, 'logo-b-dark.png'));
  renderPng(lightSvg, 512, path.join(BRAND_DIR, 'logo-b-light.png'));

  // 3. ícono de la app: cuadrado amarillo completo (el sistema redondea) con la B negra
  renderPng(
    glyphOnlySvg({ size: 1024, fg: BLACK, hubAlt: YELLOW, background: YELLOW, heightRatio: 0.58, id: 'icon' }),
    1024,
    path.join(ROOT, 'assets', 'icon.png'),
  );

  // 4. ícono adaptativo de Android: B negra en la zona segura (66 %) sobre transparente;
  //    el fondo amarillo lo pone app.json (backgroundColor)
  renderPng(
    glyphOnlySvg({ size: 1024, fg: BLACK, hubAlt: YELLOW, heightRatio: 0.46, id: 'fg' }),
    1024,
    path.join(ROOT, 'assets', 'android-icon-foreground.png'),
  );
  //    versión de una sola tinta (íconos temáticos de Android 13+)
  renderPng(
    glyphOnlySvg({ size: 1024, fg: WHITE, hubAlt: null, heightRatio: 0.46, id: 'mono' }),
    1024,
    path.join(ROOT, 'assets', 'android-icon-monochrome.png'),
  );

  // 5. splash nativa: logo amarillo (B negra) sobre el fondo oscuro de app.json
  renderPng(lightSvg, 512, path.join(ROOT, 'assets', 'splash-icon.png'));

  // 6. ícono de notificación: blanco con transparencia (Android lo tiñe con el color de app.json)
  renderPng(
    glyphOnlySvg({ size: 96, fg: WHITE, hubAlt: null, heightRatio: 0.8, id: 'notif' }),
    96,
    path.join(ROOT, 'assets', 'notification-icon.png'),
  );
}

main();
