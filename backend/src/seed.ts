import { prisma } from "./db.js";

async function seed() {
  const event = await prisma.event.upsert({
    where: {
      source_externalId: {
        source: "ams",
        externalId: "test-1",
      },
    },

    update: {},

    create: {
      externalId: "test-1",
      title: "AMS Welcome Back BBQ",
      organizer: "AMS UBC",
      source: "ams",
      category: "Social",

      startsAt: new Date("2026-09-15T12:00:00-07:00"),
      endsAt: new Date("2026-09-15T16:00:00-07:00"),
      timezone: "America/Vancouver",

      location: "Nest Plaza",
      address: "6133 University Boulevard, Vancouver, BC",

      imageUrl:
        "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=240&fit=crop&auto=format",

      tags: ["free", "social", "welcome-week"],

      description:
        "Celebrate the beginning of the school year with food, music, and activities at the AMS Nest.",

      sourceUrl: "https://www.ams.ubc.ca/events/",
    },
  });

  console.log("Created event:", event.title);
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
