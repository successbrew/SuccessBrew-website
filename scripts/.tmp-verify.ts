import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const homepage = await prisma.testimonial.findMany({ where: { group: "SERVICE", showOnHomepage: true } });
  console.log(`Homepage (SERVICE + showOnHomepage): ${homepage.length}`);
  homepage.forEach((t) => console.log(` - ${t.name} | group=${t.group} showOnHomepage=${t.showOnHomepage}`));

  const service = await prisma.testimonial.count({ where: { group: "SERVICE" } });
  const community = await prisma.testimonial.count({ where: { group: "COMMUNITY" } });
  console.log(`\nSERVICE total: ${service}, COMMUNITY total: ${community}`);
}

main().finally(() => prisma.$disconnect());
