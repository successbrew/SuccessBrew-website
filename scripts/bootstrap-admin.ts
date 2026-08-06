/**
 * One-time bootstrap: promote a Neon Auth user (already created via the Neon
 * console) to `role: "admin"` and grant their AdminProfile the SUPER_ADMIN role.
 *
 * Neon Auth's admin API requires an already-authenticated admin session, so
 * the very first admin has to be bootstrapped via direct SQL against the
 * neon_auth schema (the same approach Neon's own docs recommend for this).
 *
 * Usage: npx tsx --env-file=.env.local scripts/bootstrap-admin.ts <email>
 */
import { prisma } from "../src/lib/prisma";
import { AdminRole } from "@prisma/client";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/bootstrap-admin.ts <email>");
    process.exit(1);
  }

  const users = await prisma.$queryRaw<{ id: string; email: string }[]>`
    SELECT id::text, email::text FROM neon_auth."user" WHERE email = ${email}
  `;
  const user = users[0];

  if (!user) {
    console.error(`No Neon Auth user found with email ${email}. Create it in the Neon console first.`);
    process.exit(1);
  }

  await prisma.$executeRaw`
    UPDATE neon_auth."user" SET role = 'admin' WHERE id = ${user.id}::uuid
  `;

  await prisma.adminProfile.upsert({
    where: { id: user.id },
    create: { id: user.id, roles: [AdminRole.SUPER_ADMIN] },
    update: { roles: [AdminRole.SUPER_ADMIN] },
  });

  console.log(`${email} (${user.id}) is now a Super Admin.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
