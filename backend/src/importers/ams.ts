import { AmsImportError, importAmsEvents, saveAmsEvent } from "./ams-import.js";

async function main() {
  // Dynamic import lets configuration failures use the same safe error handling.
  const { prisma } = await import("../db.js");
  try {
    await importAmsEvents({ save: (event) => saveAmsEvent(prisma, event) });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  // Do not print raw database errors, which can include connection details.
  console.error(error instanceof AmsImportError
    ? `AMS import failed: ${error.message}`
    : "AMS import failed. Verify DATABASE_URL and database availability.");
  process.exitCode = 1;
});
