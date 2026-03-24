import { PrismaClient } from "@prisma/client";
import { DEFAULT_STORES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  for (const name of DEFAULT_STORES) {
    await prisma.store.upsert({
      where: { name },
      update: {},
      create: { name, isDefault: true },
    });
  }
  console.log("Seed completed: default stores created");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
