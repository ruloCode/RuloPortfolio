// Copia los assets a public/ con un hash de contenido en el nombre y genera
// lib/asset-manifest.json (nombre original → URL pública hasheada).
//
// El hash en el nombre es lo que permite servirlos con
// `Cache-Control: immutable` (ver next.config.ts): si el contenido cambia,
// cambia la URL, así que la caché nunca puede quedarse obsoleta.
//
// og.jpg y rulo-mark.svg se copian SIN hash: sus URLs están referenciadas desde
// fuera (scrapers de OG, marcadores) y deben permanecer estables.
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Los masters (assets/, media/encoded) viven en el repo fauna-scroll-world; aquí
// solo aterrizan los archivos hasheados y el manifest.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = process.env.SCROLL_WORLD_SRC || join(ROOT, '..', 'fauna-scroll-world');
const manifest = {};

function hashCopy(srcDir, pattern, outDir, urlBase) {
  rmSync(join(ROOT, outDir), { recursive: true, force: true });
  mkdirSync(join(ROOT, outDir), { recursive: true });
  const files = readdirSync(join(SRC, srcDir)).filter((f) => pattern.test(f)).sort();
  if (!files.length) throw new Error(`sin archivos en ${srcDir} que casen con ${pattern}`);
  for (const f of files) {
    const buf = readFileSync(join(SRC, srcDir, f));
    const h = createHash('sha1').update(buf).digest('hex').slice(0, 8);
    const ext = extname(f);
    const hashed = `${basename(f, ext)}.${h}${ext}`;
    writeFileSync(join(ROOT, outDir, hashed), buf);
    manifest[f] = `${urlBase}/${hashed}`;
  }
  console.log(`${files.length} archivos → ${outDir}`);
}

hashCopy('media/encoded', /\.mp4$/, 'public/scroll/vid', '/scroll/vid');
hashCopy('assets/ia', /\.webp$/, 'public/scroll/ia', '/scroll/ia');

for (const stable of ['og.jpg', 'rulo-mark.svg']) {
  cpSync(join(SRC, 'assets', stable), join(ROOT, 'public/scroll', stable));
  manifest[stable] = `/scroll/${stable}`;
}

writeFileSync(join(ROOT, 'src/lib/scroll-world/asset-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${Object.keys(manifest).length} entradas → src/lib/scroll-world/asset-manifest.json`);
