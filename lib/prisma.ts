let PrismaClient: any;

try {
  const prismaModule = require("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  console.error("Error importing PrismaClient:", error);
  PrismaClient = class MockPrismaClient {
    constructor() {
      throw new Error("PrismaClient not available. Run: npx prisma generate");
    }
  };
}

const globalForPrisma = global as typeof globalThis & {
  prisma?: typeof PrismaClient;
};

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
