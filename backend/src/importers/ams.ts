import { prisma } from "../db.js";
import { convert } from "html-to-text";

const AMS_API =
  "https://www.ams.ubc.ca/wp-json/tribe/events/v1/events?per_page=20";

type AmsVenue = {
  venue?: string;
  address?: string;
  city?: string;
  province?: string;
  zip?: string;
};

type AmsOrganizer = {
  organizer: string;
};

type AmsCategory = {
  name: string;
};

type AmsTag = {
  name: string;
};

type AmsImage =
  | false
  | {
      url: string;
    };

type AmsEvent = {
  id: number;
  title: string;
  description: string;
  url: string;

  utc_start_date: string;
  utc_end_date: string | null;
  timezone: string;

  venue?: AmsVenue;
  organizer?: AmsOrganizer[];
  categories?: AmsCategory[];
  tags?: AmsTag[];
  image: AmsImage;
};

type AmsResponse = {
  events: AmsEvent[];
};

function parseUtcDate(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}

function stripHtml(html: string): string {
  return convert(html, {
    wordwrap: false,
  })
    .replace(/\s+/g, " ")
    .trim();
}

function buildAddress(venue?: AmsVenue): string | null {
  if (!venue) {
    return null;
  }

  const address = [venue.address, venue.city, venue.province, venue.zip]
    .filter(Boolean)
    .join(", ");

  return address || null;
}

async function importAmsEvents() {
  console.log("Importing AMS events...");

  const response = await fetch(AMS_API);

  if (!response.ok) {
    throw new Error(`AMS request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("events" in data) ||
    !Array.isArray(data.events)
  ) {
    throw new Error("AMS returned an unexpected response structure");
  }

  const result = data as AmsResponse;

  for (const amsEvent of result.events) {
    const eventData = {
      externalId: String(amsEvent.id),
      title: stripHtml(amsEvent.title),
      organizer: "AMS UBC",
      source: "ams",
      category: amsEvent.categories?.[0]?.name ?? "General",

      startsAt: parseUtcDate(amsEvent.utc_start_date),
      endsAt: amsEvent.utc_end_date
        ? parseUtcDate(amsEvent.utc_end_date)
        : null,

      timezone: "America/Vancouver",

      location: amsEvent.venue?.venue ?? "UBC Vancouver",
      address:
        buildAddress(amsEvent.venue) ??
        "6200 University Blvd, Vancouver, BC V6T 1Z4",

      imageUrl: amsEvent.image === false ? null : amsEvent.image.url,
      tags: amsEvent.tags?.map((tag) => tag.name.toLowerCase()) ?? [],

      description: stripHtml(amsEvent.description),
      sourceUrl: amsEvent.url,
    };

    await prisma.event.upsert({
      where: {
        source_externalId: {
          source: "ams",
          externalId: eventData.externalId,
        },
      },
      update: eventData,
      create: eventData,
    });
  }
  console.log(`Imported ${result.events.length} AMS events.`);
}

importAmsEvents()
  .catch((error) => {
    console.error("AMS import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
