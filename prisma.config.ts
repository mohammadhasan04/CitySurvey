import path from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

// Load .env.local for development
try {
  loadEnvFile(path.resolve(".env.local"));
} catch {
  // .env.local may not exist in production
}

export default defineConfig({
  schema: path.resolve("prisma/schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
