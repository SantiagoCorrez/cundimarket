import { syncMunicipalityNews } from "../lib/news-sync";
import { prisma } from "../lib/prisma";
import { MUNICIPALITIES, PILOT_MUNICIPALITY } from "../lib/taxonomy";

/**
 * Uso:
 *   npm run news:sync                 → Mosquera
 *   npm run news:sync -- Funza Chía   → esos municipios
 *   npm run news:sync -- --all        → los 116 municipios
 */
async function main() {
  const args = process.argv.slice(2);
  const targets = args.includes("--all") ? MUNICIPALITIES : args.length ? args : [PILOT_MUNICIPALITY];

  for (const municipality of targets) {
    if (!MUNICIPALITIES.includes(municipality)) {
      console.log(`${municipality}: municipio desconocido`);
      continue;
    }
    try {
      const { checked, created } = await syncMunicipalityNews(municipality, { limit: 20 });
      console.log(`${municipality}: revisadas ${checked} · nuevas ${created}`);
    } catch (error) {
      console.log(`${municipality}: sin sincronizar (${error instanceof Error ? error.message : error})`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
