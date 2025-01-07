import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const BRIDGE_DATA_PATH = path.join(__dirname, '../data/PA22.txt');

const prisma = new PrismaClient();

// County name lookup (you'll need to populate this)
const COUNTY_NAMES: Record<string, string> = {
  '001': 'Adams',
  '003': 'Allegheny',
  '005': 'Armstrong',
  '007': 'Beaver',
  '009': 'Bedford',
  '011': 'Berks',
  '013': 'Blair',
  '015': 'Bradford',
  '017': 'Bucks',
  '019': 'Butler',
  '021': 'Cambria',
  '023': 'Cameron',
  '025': 'Carbon',
  '027': 'Centre',
  '029': 'Chester',
  '031': 'Clarion',
  '033': 'Clearfield',
  '035': 'Clinton',
  '037': 'Columbia',
  '039': 'Crawford',
  '041': 'Cumberland',
  '043': 'Dauphin',
  '045': 'Delaware',
  '047': 'Elk',
  '049': 'Erie',
  '051': 'Fayette',
  '053': 'Forest',
  '055': 'Franklin',
  '057': 'Fulton',
  '059': 'Greene',
  '061': 'Huntingdon',
  '063': 'Indiana',
  '065': 'Jefferson',
  '067': 'Juniata',
  '069': 'Lackawanna',
  '071': 'Lancaster',
  '073': 'Lawrence',
  '075': 'Lebanon',
  '077': 'Lehigh',
  '079': 'Luzerne',
  '081': 'Lycoming',
  '083': 'McKean',
  '085': 'Mercer',
  '087': 'Mifflin',
  '089': 'Monroe',
  '091': 'Montgomery',
  '093': 'Montour',
  '095': 'Northampton',
  '097': 'Northumberland',
  '099': 'Perry',
  '101': 'Philadelphia',
  '103': 'Pike',
  '105': 'Potter',
  '107': 'Schuylkill',
  '109': 'Snyder',
  '111': 'Somerset',
  '113': 'Sullivan',
  '115': 'Susquehanna',
  '117': 'Tioga',
  '119': 'Union',
  '121': 'Venango',
  '123': 'Warren',
  '125': 'Washington',
  '127': 'Wayne',
  '129': 'Westmoreland',
  '131': 'Wyoming',
  '133': 'York',
};

interface NBIRecord {
  STATE_CODE_001: string;
  STRUCTURE_NUMBER_008: string;
  COUNTY_CODE_003: string;
  FEATURES_DESC_006A: string;
  FACILITY_CARRIED_007: string;
  LOCATION_009: string;
  LAT_016: string;
  LONG_017: string;
  YEAR_BUILT_027: string;
  STRUCTURE_LEN_MT_049: string;
  DECK_WIDTH_MT_052: string;
  TRAFFIC_LANES_ON_028A: string;
  DECK_COND_058: string;
  SUPERSTRUCTURE_COND_059: string;
  SUBSTRUCTURE_COND_060: string;
  ADT_029: string;
  YEAR_ADT_030: string;
  FUTURE_ADT_114: string;
  YEAR_OF_FUTURE_ADT_115: string;
  BRIDGE_CONDITION: string;
}

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Read the CSV file
    const csvPath = BRIDGE_DATA_PATH;
    const fileContent = await fs.readFile(csvPath, 'utf-8');

    // Parse CSV
    const { data } = Papa.parse<NBIRecord>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    console.log(`Parsed ${data.length} records from CSV`);

    // Create counties first
    const uniqueCounties = [
      ...new Set(data.map((record) => record.COUNTY_CODE_003)),
    ];

    for (const countyCode of uniqueCounties) {
      await prisma.county.upsert({
        where: { code: countyCode },
        update: {},
        create: {
          code: countyCode,
          name: COUNTY_NAMES[countyCode] || `County ${countyCode}`,
          state: 'PA',
        },
      });
    }

    console.log('Counties created/updated');

    // Process bridges in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      await Promise.all(
        batch.map((record) =>
          prisma.bridge.upsert({
            where: { structureNumber: record.STRUCTURE_NUMBER_008 },
            update: {},
            create: {
              structureNumber: record.STRUCTURE_NUMBER_008,
              latitude: parseFloat(record.LAT_016),
              longitude: parseFloat(record.LONG_017),
              countyCode: record.COUNTY_CODE_003,
              locationDesc: record.LOCATION_009,
              featureDesc: record.FEATURES_DESC_006A,
              facilityCarried: record.FACILITY_CARRIED_007,
              yearBuilt: record.YEAR_BUILT_027
                ? parseInt(record.YEAR_BUILT_027)
                : null,
              lengthMeters: record.STRUCTURE_LEN_MT_049
                ? parseFloat(record.STRUCTURE_LEN_MT_049)
                : null,
              widthMeters: record.DECK_WIDTH_MT_052
                ? parseFloat(record.DECK_WIDTH_MT_052)
                : null,
              trafficLanes: record.TRAFFIC_LANES_ON_028A
                ? parseInt(record.TRAFFIC_LANES_ON_028A)
                : null,
              deckCondition: record.DECK_COND_058
                ? parseInt(record.DECK_COND_058)
                : null,
              superstructureCond: record.SUPERSTRUCTURE_COND_059
                ? parseInt(record.SUPERSTRUCTURE_COND_059)
                : null,
              substructureCond: record.SUBSTRUCTURE_COND_060
                ? parseInt(record.SUBSTRUCTURE_COND_060)
                : null,
              bridgeCondition: record.BRIDGE_CONDITION,
              avgDailyTraffic: record.ADT_029 ? parseInt(record.ADT_029) : null,
              avgDailyTrafficYear: record.YEAR_ADT_030
                ? parseInt(record.YEAR_ADT_030)
                : null,
              futureAvgDailyTraffic: record.FUTURE_ADT_114
                ? parseInt(record.FUTURE_ADT_114)
                : null,
              futureADTYear: record.YEAR_OF_FUTURE_ADT_115
                ? parseInt(record.YEAR_OF_FUTURE_ADT_115)
                : null,
            },
          })
        )
      );

      console.log(`Processed ${i + batch.length}/${data.length} bridges`);
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow running directly or importing
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedDatabase };
