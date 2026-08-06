import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rows = await prisma.testimonial.findMany({
  where: { group: "COMMUNITY" },
  orderBy: { order: "asc" },
  take: 6,
});
rows.forEach((r, i) => {
  console.log(`[${i}] order=${r.order} cardStyle=${r.cardStyle} name="${r.name}" quote="${r.quote.slice(0, 40)}..."`);
});
await prisma.$disconnect();
