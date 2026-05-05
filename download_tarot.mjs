import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'public', 'tarot-cards');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// All 78 Rider-Waite card filenames on Wikimedia Commons
const CARD_MAP = [
  // Major Arcana (id 0–21)
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
  // Wands (id 22–35)
  { id: 22, file: 'Wands01.jpg' },
  { id: 23, file: 'Wands02.jpg' },
  { id: 24, file: 'Wands03.jpg' },
  { id: 25, file: 'Wands04.jpg' },
  { id: 26, file: 'Wands05.jpg' },
  { id: 27, file: 'Wands06.jpg' },
  { id: 28, file: 'Wands07.jpg' },
  { id: 29, file: 'Wands08.jpg' },
  { id: 30, file: 'Wands09.jpg' },
  { id: 31, file: 'Wands10.jpg' },
  { id: 32, file: 'Wands11.jpg' },
  { id: 33, file: 'Wands12.jpg' },
  { id: 34, file: 'Wands13.jpg' },
  { id: 35, file: 'Wands14.jpg' },
  // Cups (id 36–49)
  { id: 36, file: 'Cups01.jpg' },
  { id: 37, file: 'Cups02.jpg' },
  { id: 38, file: 'Cups03.jpg' },
  { id: 39, file: 'Cups04.jpg' },
  { id: 40, file: 'Cups05.jpg' },
  { id: 41, file: 'Cups06.jpg' },
  { id: 42, file: 'Cups07.jpg' },
  { id: 43, file: 'Cups08.jpg' },
  { id: 44, file: 'Cups09.jpg' },
  { id: 45, file: 'Cups10.jpg' },
  { id: 46, file: 'Cups11.jpg' },
  { id: 47, file: 'Cups12.jpg' },
  { id: 48, file: 'Cups13.jpg' },
  { id: 49, file: 'Cups14.jpg' },
  // Swords (id 50–63)
  { id: 50, file: 'Swords01.jpg' },
  { id: 51, file: 'Swords02.jpg' },
  { id: 52, file: 'Swords03.jpg' },
  { id: 53, file: 'Swords04.jpg' },
  { id: 54, file: 'Swords05.jpg' },
  { id: 55, file: 'Swords06.jpg' },
  { id: 56, file: 'Swords07.jpg' },
  { id: 57, file: 'Swords08.jpg' },
  { id: 58, file: 'Swords09.jpg' },
  { id: 59, file: 'Swords10.jpg' },
  { id: 60, file: 'Swords11.jpg' },
  { id: 61, file: 'Swords12.jpg' },
  { id: 62, file: 'Swords13.jpg' },
  { id: 63, file: 'Swords14.jpg' },
  // Pentacles (id 64–77)
  { id: 64, file: 'Pents01.jpg' },
  { id: 65, file: 'Pents02.jpg' },
  { id: 66, file: 'Pents03.jpg' },
  { id: 67, file: 'Pents04.jpg' },
  { id: 68, file: 'Pents05.jpg' },
  { id: 69, file: 'Pents06.jpg' },
  { id: 70, file: 'Pents07.jpg' },
  { id: 71, file: 'Pents08.jpg' },
  { id: 72, file: 'Pents09.jpg' },
  { id: 73, file: 'Pents10.jpg' },
  { id: 74, file: 'Pents11.jpg' },
  { id: 75, file: 'Pents12.jpg' },
  { id: 76, file: 'Pents13.jpg' },
  { id: 77, file: 'Pents14.jpg' },
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'TarotApp/1.0 (tarot-project)' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Non-JSON response: ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'TarotApp/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function getImageUrl(filename, retries = 3) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json`;
  for (let i = 0; i < retries; i++) {
    try {
      const data = await fetchJson(apiUrl);
      if (!data.query) {
        // Rate limited, wait and retry
        await new Promise(r => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      const pages = data.query.pages;
      const page = Object.values(pages)[0];
      if (page.missing !== undefined) return null;
      return page.imageinfo[0].url;
    } catch (e) {
      if (i < retries - 1) await new Promise(r => setTimeout(r, 3000 * (i + 1)));
      else throw e;
    }
  }
  return null;
}

async function main() {
  console.log(`Downloading ${CARD_MAP.length} tarot card images to public/tarot-cards/\n`);
  const results = {};

  for (const card of CARD_MAP) {
    const destPath = path.join(OUTPUT_DIR, `${card.id}.jpg`);
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
      console.log(`[SKIP] ${card.id} (already exists)`);
      results[card.id] = `/tarot-cards/${card.id}.jpg`;
      continue;
    }
    try {
      const imageUrl = await getImageUrl(card.file);
      if (!imageUrl) {
        console.error(`[MISS] ${card.id} - file not found: ${card.file}`);
        continue;
      }
      await downloadFile(imageUrl, destPath);
      results[card.id] = `/tarot-cards/${card.id}.jpg`;
      console.log(`[OK]   ${card.id} - ${card.file}`);
    } catch (err) {
      console.error(`[ERR]  ${card.id} - ${err.message}`);
    }
    // Delay to be polite to Wikimedia API (2s between requests)
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone! ${Object.keys(results).length}/78 images downloaded.`);
  fs.writeFileSync(path.join(__dirname, 'tarot_image_map.json'), JSON.stringify(results, null, 2));
}

main().catch(console.error);
