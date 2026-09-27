// Run after changing src/app/icon.svg: node scripts/generate-icons.mjs
// sharp is supplied by Next.js. Keep all platform exports on the same artwork.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/app/icon.svg', import.meta.url));
const root = new URL('../', import.meta.url);
await writeFile(new URL('public/brand/sapiens-scientia.svg', root), source);
for (const [path, size] of [['src/app/apple-icon.png', 180], ['public/brand/sapiens-scientia.png', 512]]) {
  await sharp(source).resize(size, size).png().toFile(new URL(path, root).pathname);
}
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(image.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL('src/app/favicon.ico', root), Buffer.concat([header, ...images]));
