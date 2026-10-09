import { syncMosqueraNews } from "../lib/news-sync";
import { prisma } from "../lib/prisma";

async function main() {
  const { checked, created } = await syncMosqueraNews({ limit: 40 });
  console.log(`Noticias revisadas: ${checked} · nuevas: ${created}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
