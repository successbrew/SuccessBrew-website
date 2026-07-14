import { defineConfig, env } from "prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrate needs the direct (non-pooled) Neon connection.
    url: env("DIRECT_URL"),
  },
});
