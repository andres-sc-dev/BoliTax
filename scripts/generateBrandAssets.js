// AI-assisted: see docs/AI_LOG.md #20
// AI-assisted: see docs/AI_LOG.md #22
// Genera la marca de BoliTax: los SVG fuente en assets/brand/ y, a partir de ellos, los PNG
// que usa la app (logo, logotipo, ícono, ícono adaptativo de Android, splash y notificación).
// Uso: npm run brand:assets   (requiere la devDependency @resvg/resvg-js; no entra en la app)
//
// Marca final (Fase C): simple y limpia.
// - La "B" es la letra B de Montserrat ExtraBold, sin adornos.
// - Debajo lleva una franja fina de damero (2 filas): del ancho de la B en el ícono y del
//   ancho de toda la palabra en el logotipo "BoliTAX" ("B" y "TAX" ExtraBold, "oli" Regular).
// El texto se dibuja con los .ttf de Montserrat del proyecto (los mismos que carga la app).
// Los anchos se MIDEN con getBBox() de resvg sobre la tinta real de las letras, así el damero
// queda exactamente del ancho de la B o de la palabra.
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const YELLOW = '#FFC72C';
const BLACK = '#0B0B0F';
const LIGHT = '#F5F5F7';
const WHITE = '#FFFFFF';

const ROOT = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT, 'assets', 'brand');
const FONT_DIR = path.join(ROOT, 'node_modules', '@expo-google-fonts', 'montserrat');
const FONT_OPTIONS = {
  fontFiles: [
    path.join(FONT_DIR, '400Regular', 'Montserrat_400Regular.ttf'),
    path.join(FONT_DIR, '800ExtraBold', 'Montserrat_800ExtraBold.ttf'),
  ],
  loadSystemFonts: false,
  defaultFontFamily: 'Montserrat',
};

// tamaño de referencia con el que se mide y se dibuja (luego se escala)
const FONT_SIZE = 400;
// columnas del damero bajo la B del ícono (2 filas siempre)
const ICON_COLUMNS = 6;
// en el logotipo, cada cuadro mide aprox. este % de la altura de la B
const LOGOTYPE_SQUARE_RATIO = 0.12;
// separación entre las letras y el damero, en cuadros
const GAP_IN_SQUARES = 0.9;

// ---------- medición ----------

// caja (x, y, ancho, alto) de la tinta de un fragmento SVG con texto
function measure(inner) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="1000">${inner}</svg>`;
  const box = new Resvg(svg, { font: FONT_OPTIONS }).getBBox();
  if (!box) throw new Error('No se pudo medir el texto (¿faltan los .ttf de Montserrat?)');
  return box;
}

// texto en la línea base y = FONT_SIZE (sobra espacio arriba para medir)
const BASELINE = FONT_SIZE;
const bText = (fill) =>
  `<text x="0" y="${BASELINE}" font-family="Montserrat" font-weight="800" font-size="${FONT_SIZE}" fill="${fill}">B</text>`;
const wordText = ({ b, oli, tax }) =>
  `<text x="0" y="${BASELINE}" font-family="Montserrat" font-size="${FONT_SIZE}">` +
  `<tspan font-weight="800" fill="${b}">B</tspan>` +
  `<tspan font-weight="400" fill="${oli}">oli</tspan>` +
  `<tspan font-weight="800" fill="${tax}">TAX</tspan></text>`;

const B_BOX = measure(bText(BLACK));
const WORD_BOX = measure(wordText({ b: BLACK, oli: BLACK, tax: BLACK }));

// ---------- piezas ----------

// franja de damero de 2 filas: `dark` y `light` alternan; null = cuadro transparente
function checker({ x, y, columns, size, dark, light }) {
  let rects = '';
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const fill = (row + column) % 2 === 0 ? dark : light;
      if (!fill) continue;
      rects += `<rect x="${(x + column * size).toFixed(2)}" y="${(y + row * size).toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${fill}"/>`;
    }
  }
  return rects;
}

// "marca": la B con su damero debajo. Devuelve el SVG interno y su caja (en unidades de FONT_SIZE)
function markGroup({ fg, alt, withChecker = true }) {
  const size = B_BOX.width / ICON_COLUMNS;
  const gap = size * GAP_IN_SQUARES;
  const top = B_BOX.y;
  const bottom = B_BOX.y + B_BOX.height;
  const inner =
    bText(fg) +
    (withChecker
      ? checker({ x: B_BOX.x, y: bottom + gap, columns: ICON_COLUMNS, size, dark: fg, light: alt })
      : '');
  const height = bottom - top + (withChecker ? gap + size * 2 : 0);
  return { inner, box: { x: B_BOX.x, y: top, width: B_BOX.width, height } };
}

// logotipo "BoliTAX" con el damero subrayando toda la palabra
function logotypeGroup({ b, oli, tax, dark, light }) {
  const capHeight = B_BOX.height;
  // número entero de cuadros que cubre exactamente el ancho de la palabra
  const columns = Math.max(2, Math.round(WORD_BOX.width / (capHeight * LOGOTYPE_SQUARE_RATIO)));
  const size = WORD_BOX.width / columns;
  const gap = size * GAP_IN_SQUARES;
  const bottom = WORD_BOX.y + WORD_BOX.height;
  const inner =
    wordText({ b, oli, tax }) +
    checker({ x: WORD_BOX.x, y: bottom + gap, columns, size, dark, light });
  const height = bottom - WORD_BOX.y + gap + size * 2;
  return { inner, box: { x: WORD_BOX.x, y: WORD_BOX.y, width: WORD_BOX.width, height } };
}

// coloca un grupo centrado en un lienzo, escalado para que su alto sea `targetHeight`
// (o su ancho `targetWidth`, lo que quede más chico)
function placeCentered(group, canvasW, canvasH, targetHeight, targetWidth = Infinity) {
  const scale = Math.min(targetHeight / group.box.height, targetWidth / group.box.width);
  const tx = canvasW / 2 - (group.box.x + group.box.width / 2) * scale;
  const ty = canvasH / 2 - (group.box.y + group.box.height / 2) * scale;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})">${group.inner}</g>`;
}

const svgDoc = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${body}\n</svg>\n`;

// ---------- archivos ----------

// 1. ícono cuadrado: cuadrado redondeado amarillo, B negra y damero negro/amarillo
function iconSvg(size, { rounded }) {
  const mark = markGroup({ fg: BLACK, alt: YELLOW });
  const background = rounded
    ? `<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${YELLOW}"/>`
    : `<rect width="${size}" height="${size}" fill="${YELLOW}"/>`;
  return svgDoc(size, size, background + placeCentered(mark, size, size, size * 0.6));
}

// 2. logotipo horizontal con fondo transparente (el fondo lo pone la pantalla)
function logotypeSvg(variant) {
  const colors =
    variant === 'onDark'
      ? { b: YELLOW, oli: LIGHT, tax: YELLOW, dark: YELLOW, light: BLACK }
      : { b: BLACK, oli: BLACK, tax: BLACK, dark: BLACK, light: YELLOW };
  const group = logotypeGroup(colors);
  // lienzo ajustado a la marca, con un margen pequeño
  const width = 1200;
  const pad = 24;
  const scale = (width - pad * 2) / group.box.width;
  const height = Math.ceil(group.box.height * scale + pad * 2);
  return svgDoc(width, height, placeCentered(group, width, height, height - pad * 2, width - pad * 2));
}

// 3. ícono de notificación: solo la B blanca (sin damero, es muy pequeño)
function notificationSvg(size) {
  const mark = markGroup({ fg: WHITE, alt: null, withChecker: false });
  return svgDoc(size, size, placeCentered(mark, size, size, size * 0.78));
}

// 4. ícono adaptativo de Android: B con damero dentro de la zona segura (66 %) del lienzo
//    `alt` null = versión de una sola tinta (íconos temáticos)
function adaptiveForegroundSvg(size, { fg, alt }) {
  const mark = markGroup({ fg, alt });
  // la zona segura es un círculo del 66 %: la marca entera cabe en un cuadrado de ~44 %
  return svgDoc(size, size, placeCentered(mark, size, size, size * 0.44, size * 0.44));
}

function renderPng(svg, width, outputPath) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: FONT_OPTIONS })
    .render()
    .asPng();
  fs.writeFileSync(outputPath, png);
  console.log(`  ${path.relative(ROOT, outputPath)} (${width}px)`);
}

function writeSvg(svg, name) {
  fs.writeFileSync(path.join(BRAND_DIR, name), svg);
  console.log(`  assets/brand/${name}`);
}

function main() {
  fs.mkdirSync(BRAND_DIR, { recursive: true });

  // SVG fuente (usan Montserrat: se ven bien donde esa fuente esté instalada)
  const iconRounded = iconSvg(512, { rounded: true });
  const logotypeDark = logotypeSvg('onDark');
  const logotypeLight = logotypeSvg('onYellow');
  console.log('SVG:');
  writeSvg(iconRounded, 'logo-icon.svg');
  writeSvg(logotypeDark, 'logotype-on-dark.svg');
  writeSvg(logotypeLight, 'logotype-on-yellow.svg');

  console.log('PNG:');
  // dentro de la app (con <Image>)
  renderPng(iconRounded, 512, path.join(BRAND_DIR, 'logo-icon.png'));
  renderPng(logotypeDark, 1200, path.join(BRAND_DIR, 'logotype-on-dark.png'));
  renderPng(logotypeLight, 1200, path.join(BRAND_DIR, 'logotype-on-yellow.png'));

  // ícono de la app: cuadrado completo (el sistema le pone la forma)
  renderPng(iconSvg(1024, { rounded: false }), 1024, path.join(ROOT, 'assets', 'icon.png'));

  // ícono adaptativo de Android: frente, fondo amarillo y versión monocroma
  renderPng(
    adaptiveForegroundSvg(1024, { fg: BLACK, alt: YELLOW }),
    1024,
    path.join(ROOT, 'assets', 'android-icon-foreground.png'),
  );
  renderPng(
    svgDoc(1024, 1024, `<rect width="1024" height="1024" fill="${YELLOW}"/>`),
    1024,
    path.join(ROOT, 'assets', 'android-icon-background.png'),
  );
  renderPng(
    adaptiveForegroundSvg(1024, { fg: WHITE, alt: null }),
    1024,
    path.join(ROOT, 'assets', 'android-icon-monochrome.png'),
  );

  // splash nativa: el ícono redondeado sobre el fondo oscuro de app.json
  renderPng(iconRounded, 512, path.join(ROOT, 'assets', 'splash-icon.png'));

  // notificación: blanco con transparencia (Android lo tiñe con el color de app.json)
  renderPng(notificationSvg(96), 96, path.join(ROOT, 'assets', 'notification-icon.png'));
}

main();
