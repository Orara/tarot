import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'public', 'tarot-cards');

const CARD_MAP = [
  { id: 0,  file: 'RWS_Tarot_00_Fool.jpg' },
  { id: 1,  file: 'RWS_Tarot_01_Magician.jpg' },
  { id: 2,  file: 'RWS_Tarot_02_High_Priestess.jpg' },
  { id: 3,  file: 'RWS_Tarot_03_Empress.jpg' },
  { id: 4,  file: 'RWS_Tarot_04_Emperor.jpg' },
  { id: 5,  file: 'RWS_Tarot_05_Hierophant.jpg' },
  { id: 6,  file: 'RWS_Tarot_06_Lovers.jpg' },
  { id: 7,  file: 'RWS_Tarot_07_Chariot.jpg' },
  { id: 8,  file: 'RWS_Tarot_08_Strength.jpg' },
  { id: 9,  file: 'RWS_Tarot_09_Hermit.jpg' },
  { id: 10, file: 'RWS_Tarot_10_Wheel_of_Fortune.jpg' },
  { id: 11, file: 'RWS_Tarot_11_Justice.jpg' },
  { id: 12, file: 'RWS_Tarot_12_Hanged_Man.jpg' },
  { id: 13, file: 'RWS_Tarot_13_Death.jpg' },
  { id: 14, file: 'RWS_Tarot_14_Temperance.jpg' },
  { id: 15, file: 'RWS_Tarot_15_Devil.jpg' },
  { id: 16, file: 'RWS_Tarot_16_Tower.jpg' },
  { id: 17, file: 'RWS_Tarot_17_Star.jpg' },
  { id: 18, file: 'RWS_Tarot_18_Moon.jpg' },
  { id: 19, file: 'RWS_Tarot_19_Sun.jpg' },
  { id: 20, file: 'RWS_Tarot_20_Judgement.jpg' },
  { id: 21, file: 'RWS_Tarot_21_World.jpg' },
  { id: 22, file: 'Wands01.jpg' }, { id: 23, file: 'Wands02.jpg' },
  { id: 24, file: 'Wands03.jpg' }, { id: 25, file: 'Wands04.jpg' },
  { id: 26, file: 'Wands05.jpg' }, { id: 27, file: 'Wands06.jpg' },
  { id: 28, file: 'Wands07.jpg' }, { id: 29, file: 'Wands08.jpg' },
  { id: 30, file: 'Wands09.jpg' }, { id: 31, file: 'Wands10.jpg' },
  { id: 32, file: 'Wands11.jpg' }, { id: 33, file: 'Wands12.jpg' },
  { id: 34, file: 'Wands13.jpg' }, { id: 35, file: 'Wands14.jpg' },
  { id: 36, file: 'Cups01.jpg' },  { id: 37, file: 'Cups02.jpg' },
  { id: 38, file: 'Cups03.jpg' },  { id: 39, file: 'Cups04.jpg' },
  { id: 40, file: 'Cups05.jpg' },  { id: 41, file: 'Cups06.jpg' },
  { id: 42, file: 'Cups07.jpg' },  { id: 43, file: 'Cups08.jpg' },
  { id: 44, file: 'Cups09.jpg' },  { id: 45, file: 'Cups10.jpg' },
  { id: 46, file: 'Cups11.jpg' },  { id: 47, file: 'Cups12.jpg' },
  { id: 48, file: 'Cups13.jpg' },  { id: 49, file: 'Cups14.jpg' },
  { id: 50, file: 'Swords01.jpg' }, { id: 51, file: 'Swords02.jpg' },
  { id: 52, file: 'Swords03.jpg' }, { id: 53, file: 'Swords04.jpg' },
  { id: 54, file: 'Swords05.jpg' }, { id: 55, file: 'Swords06.jpg' },
  { id: 56, file: 'Swords07.jpg' }, { id: 57, file: 'Swords08.jpg' },
  { id: 58, file: 'Swords09.jpg' }, { id: 59, file: 'Swords10.jpg' },
  { id: 60, file: 'Swords11.jpg' }, { id: 61, file: 'Swords12.jpg' },
  { id: 62, file: 'Swords13.jpg' }, { id: 63, file: 'Swords14.jpg' },
  { id: 64, file: 'Pents01.jpg' },  { id: 65, file: 'Pents02.jpg' },
  { id: 66, file: 'Pents03.jpg' },  { id: 67, file: 'Pents04.jpg' },
  { id: 68, file: 'Pents05.jpg' },  { id: 69, file: 'Pents06.jpg' },
  { id: 70, file: 'Pents07.jpg' },  { id: 71, file: 'Pents08.jpg' },
  { id: 72, file: 'Pents09.jpg' },  { id: 73, file: 'Pents10.jpg' },
  { id: 74, file: 'Pents11.jpg' },  { id: 75, file: 'Pents12.jpg' },
  { id: 76, file: 'Pents13.jpg' },  { id: 77, file: 'Pents14.jpg' },
];

// Only broken ones (< 5KB)
const BROKEN = CARD_MAP.filter(c => {
  const p = path.join(OUTPUT_DIR, `${c.id}.jpg`);
  try { return fs.statSync(p).size < 5000; } catch { return true; }
});

console.log(`재다운로드 필요: ${BROKEN.length}장`);
BROKEN.forEach(c => console.log(` - ${c.id}.jpg (${c.file})`));

function get(url, opts = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { ...opts, headers: { 'User-Agent': 'Mozilla/5.0 TarotApp/1.0' } }, res => {
      if ([301, 302].includes(res.statusCode))
        return get(res.headers.location, opts).then(resolve).catch(reject);
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

async function getImageUrl(filename, retries = 4) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json`;
  for (let i = 0; i < retries; i++) {
    try {
      const { body } = await get(url);
      const text = body.toString('utf8');
      if (!text.startsWith('{')) {
        console.log(`  Rate limited, waiting ${4 + i * 3}s...`);
        await new Promise(r => setTimeout(r, (4 + i * 3) * 1000));
        continue;
      }
      const data = JSON.parse(text);
      const page = Object.values(data.query.pages)[0];
      if (page.missing !== undefined) return null;
      return page.imageinfo[0].url;
    } catch (e) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  return null;
}

async function downloadImage(imageUrl, dest) {
  const { status, body } = await get(imageUrl);
  if (status !== 200 || body.length < 5000) throw new Error(`Bad response: ${status}, size: ${body.length}`);
  fs.writeFileSync(dest, body);
}

async function main() {
  for (const card of BROKEN) {
    const dest = path.join(OUTPUT_DIR, `${card.id}.jpg`);
    try {
      console.log(`\n[${card.id}] ${card.file}`);
      const imageUrl = await getImageUrl(card.file);
      if (!imageUrl) { console.log('  → 파일 없음'); continue; }
      await downloadImage(imageUrl, dest);
      console.log(`  → OK (${fs.statSync(dest).size.toLocaleString()} bytes)`);
    } catch (e) {
      console.error(`  → ERR: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log('\n완료!');
  // Final check
  let ok = 0, fail = 0;
  for (let i = 0; i < 78; i++) {
    const p = path.join(OUTPUT_DIR, `${i}.jpg`);
    try { fs.statSync(p).size > 5000 ? ok++ : fail++; } catch { fail++; }
  }
  console.log(`정상: ${ok}/78, 문제: ${fail}/78`);
}

main().catch(console.error);
