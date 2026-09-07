import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Evita múltiples instancias de Prisma Client en desarrollo con hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

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
      console.log("✅ Conexión a la base de datos establecida (Prisma):", result[0]);
  } catch (error) {
      console.error("❌ Error al conectar a la base de datos con Prisma:", error);
      process.exit(1);
  }
};
