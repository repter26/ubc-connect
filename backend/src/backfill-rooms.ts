import { prisma } from "./db.js";

async function backfillRooms() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply")) {
    throw new Error("Usage: npm run backfill:rooms -- [--apply]");
  }

  const apply = args.includes("--apply");
  const where = { rooms: { none: {} } };

  if (!apply) {
    const count = await prisma.event.count({ where });
    console.log(`${count} events have no rooms; would create ${count * 4} rooms.`);
    console.log("To save these rooms, run: npm run backfill:rooms -- --apply");
    return;
  }

  const count = await prisma.$transaction(
    async (tx) => {
      const events = await tx.event.findMany({
        where,
        select: { id: true },
      });

      if (events.length === 0) return 0;

      await tx.room.createMany({
        data: events.flatMap((event) =>
          Array.from({ length: 4 }, (_, i) => ({
            name: `Room ${i + 1}`,
            capacity: 10,
            eventId: event.id,
          })),
        ),
      });

      return events.length;
    },
    // Concurrent backfills must not both create defaults for the same events.
    // If a serialization conflict occurs, the transaction rolls back; rerun it.
    { isolationLevel: "Serializable" },
  );

  console.log(`Created ${count * 4} rooms for ${count} events.`);
}

backfillRooms()
  .catch((error) => {
    console.error("Room backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
