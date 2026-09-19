import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// Evita múltiples instancias de Prisma Client en desarrollo con hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Verifica la conectividad con la base de datos PostgreSQL en Neon
 */
export const testDbConnection = async (): Promise<void> => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("La variable de entorno DATABASE_URL no está definida.");
    }
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW()`;
      console.log("✅ :", result[0]);
  } catch (error) {
      console.error("❌: ", error);
      throw error;
  }
};
