import { initializeDatabase, execute, saveDb } from './database';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const CSV_PATH = 'C:\\Users\\abhig\\Downloads\\All_cars_dataset.csv';

function extractNumber(str: string): number | null {
  if (!str || str.trim() === '-' || str.trim() === '') return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function parsePrice(str: string): number {
  if (!str) return 0;
  if (str.includes('Crore')) {
    const num = extractNumber(str);
    return num ? num * 100 : 0;
  }
  return extractNumber(str) || 0;
}

function parseTransmission(str: string): string {
  if (!str) return 'Manual';
  const lower = str.toLowerCase();
  if (lower.includes('automatic')) return 'Automatic';
  return 'Manual';
}

function parseFuel(str: string): string {
  if (!str) return 'Petrol';
  const lower = str.toLowerCase();
  if (lower.includes('diesel')) return 'Diesel';
  if (lower.includes('electric') || lower.includes('ev')) return 'Electric';
  if (lower.includes('cng')) return 'CNG';
  if (lower.includes('hybrid')) return 'Hybrid';
  return 'Petrol';
}

function inferBodyType(name: string, seating: number, length: number): string {
  const lower = name.toLowerCase();
  if (seating >= 7 || lower.includes('innova') || lower.includes('ertiga')) return 'MUV';
  if (lower.includes('thar') || lower.includes('gurkha') || lower.includes('jimny')) return 'SUV';
  if (length > 4200) {
    if (lower.includes('city') || lower.includes('verna') || lower.includes('slavia') || lower.includes('virtus')) return 'Sedan';
    return 'SUV'; 
  }
  if (length > 3900 && length <= 4200) {
    if (lower.includes('nexon') || lower.includes('brezza') || lower.includes('venue') || lower.includes('sonet')) return 'SUV';
    if (lower.includes('dzire') || lower.includes('aura') || lower.includes('amaze')) return 'Sedan';
  }
  return 'Hatchback';
}

async function fetchWikiImage(make: string, model: string): Promise<string | null> {
  const searchTerms = encodeURIComponent(`${make} ${model} car`);
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${searchTerms}&gsrlimit=1&pithumbsize=800`);
    const data = await res.json() as any;
    const pages = data.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1' && pages[pageId]?.thumbnail?.source) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch (e) {
    // Skip on network errors
  }
  return null;
}

async function seed(): Promise<void> {
  await initializeDatabase();

  console.log('[SEED] Starting database seed with Kaggle Dataset...');

  // Clear existing data (using truncate/restart for Postgres if needed, but execute handles simple delete)
  await execute('DELETE FROM review_summaries');
  await execute('DELETE FROM reviews');
  await execute('DELETE FROM sessions');
  await execute('DELETE FROM cars');

  // Read Kaggle CSV - if it doesn't exist, we'll skip the CSV loop
  if (!fs.existsSync(CSV_PATH)) {
    console.warn(`[SEED] CSV not found at ${CSV_PATH}. Skipping CSV import.`);
    return;
  }

  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
  }) as any[];

  const carInsertSql = `INSERT INTO cars (make, model, variant, price_lakh, fuel_type, transmission, body_type, seating,
    mileage_kmpl, engine_cc, power_bhp, torque_nm, boot_liters, safety_rating, running_cost_per_km,
    image_url, image_url_2, image_url_3, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let inserted = 0;

  for (const row of records) {
    const fullNameParts = row.Name ? row.Name.split(' ') : ['Unknown', 'Car'];
    const make = fullNameParts[0];
    const model = fullNameParts.slice(1).join(' ');
    
    const priceLakh = parsePrice(row.Price);
    if (!priceLakh || priceLakh === 0) continue; 

    const mileage = extractNumber(row.Mileage);
    const engineCc = extractNumber(row.ENGINE) || extractNumber(row.Displacement);
    const power = extractNumber(row['Peak Power']);
    const torque = extractNumber(row['Peak Torque']);
    const seating = extractNumber(row['Seating Capacity']) || 5;
    const length = extractNumber(row['Length (mm)']) || 4000;
    const boot = extractNumber(row['Boot Space (L)']);

    const transmission = parseTransmission(row.TRANSMISSION);
    const fuelType = parseFuel(row['FUEL TYPE']);
    const bodyType = inferBodyType(row.Name, seating, length);

    const tags = [];
    if (mileage && mileage > 18) tags.push('eco', 'city');
    if (bodyType === 'SUV') tags.push('family', 'highway', 'safe');
    if (priceLakh < 8) tags.push('value', 'city');
    if (power && power > 120) tags.push('performance', 'highway');

    const wikiImage = await fetchWikiImage(make, model);

    const CAR_IMAGES = [
      '/cars/1.png',
      '/cars/2.png',
      '/cars/3.png'
    ];
    const imageUrl = wikiImage || CAR_IMAGES[inserted % CAR_IMAGES.length];

    const safetyRating = Math.floor(Math.random() * 3) + 3;

    try {
      await execute(carInsertSql, [
        make,
        model,
        'Base/Standard',
        priceLakh,
        fuelType,
        transmission,
        bodyType,
        seating,
        mileage,
        engineCc,
        power,
        torque,
        boot,
        safetyRating,
        mileage ? parseFloat((100 / mileage).toFixed(1)) : 5.0,
        imageUrl,
        null,
        null,
        JSON.stringify(tags)
      ]);
      inserted++;
    } catch (err) {
      console.warn(`Failed to insert car ${row.Name}:`, err);
    }
    
    if (inserted % 10 === 0) console.log(`[SEED] Processed ${inserted} cars...`);
  }

  console.log(`[SEED] Successfully inserted ${inserted} cars from Kaggle dataset.`);
  saveDb();
  console.log('[SEED] Done!');
}

seed().catch(console.error);
