import { convert } from "html-to-text";
import type { PrismaClient } from "../generated/prisma/client.js";

const AMS_API = "https://www.ams.ubc.ca/wp-json/tribe/events/v1/events";
const MAX_RETRY_DELAY_MS = 120_000;

export class AmsImportError extends Error {}

type RecordValue = Record<string, unknown>;
function object(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AmsImportError("AMS returned an invalid object.");
  }
  return value as RecordValue;
}
function string(value: unknown): string {
  if (typeof value !== "string") throw new AmsImportError("AMS returned an invalid text field.");
  return value;
}
function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : string(value);
}
function utcDate(value: unknown): Date {
  const raw = string(value);
  if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(raw)) {
    throw new AmsImportError("AMS returned an invalid UTC date.");
  }
  const iso = `${raw.replace(" ", "T")}Z`;
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== iso.replace("Z", ".000Z")) {
    throw new AmsImportError("AMS returned an invalid UTC date.");
  }
  return date;
}
function text(value: unknown): string {
  return convert(string(value), { wordwrap: false }).replace(/\s+/g, " ").trim();
}
function names(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new AmsImportError("AMS returned invalid categories or tags.");
  return value.map((item) => string(object(item).name));
}
function eventData(value: unknown) {
  const event = object(value);
  if (!Number.isSafeInteger(event.id) || (event.id as number) <= 0) {
    throw new AmsImportError("AMS returned an invalid event ID.");
  }
  const title = text(event.title);
  const sourceUrl = string(event.url);
  if (!title || !/^https?:\/\//.test(sourceUrl)) throw new AmsImportError("AMS returned an invalid title or URL.");
  const venue = event.venue == null ? {} : object(event.venue);
  const address = [venue.address, venue.city, venue.province, venue.zip]
    .map(optionalString).filter(Boolean).join(", ");
  const startsAt = utcDate(event.utc_start_date);
  const endsAt = event.utc_end_date == null ? null : utcDate(event.utc_end_date);
  if (endsAt && endsAt < startsAt) throw new AmsImportError("AMS event ends before it starts.");
  return {
    externalId: String(event.id), title, organizer: "AMS UBC", source: "ams",
    category: names(event.categories)[0] ?? "General",
    startsAt, endsAt, timezone: "America/Vancouver",
    location: optionalString(venue.venue) || "UBC Vancouver",
    address: address || "6200 University Blvd, Vancouver, BC V6T 1Z4",
    imageUrl: event.image === false ? null : string(object(event.image).url),
    tags: names(event.tags).map((tag) => tag.toLowerCase()),
    description: text(event.description), sourceUrl,
  };
}
export type ImportedEvent = ReturnType<typeof eventData>;

export async function saveAmsEvent(db: Pick<PrismaClient, "event">, data: ImportedEvent) {
  await db.event.upsert({
    where: { source_externalId: { source: data.source, externalId: data.externalId } },
    update: data,
    create: { ...data, rooms: { create: Array.from({ length: 4 }, (_, i) => ({
      name: `Room ${i + 1}`, capacity: 10,
    })) } },
  });
}

interface ImportOptions {
  save: (event: ImportedEvent) => Promise<void>;
  fetch?: typeof globalThis.fetch;
  sleep?: (ms: number) => Promise<void>;
  log?: (message: string) => void;
  requestTimeoutMs?: number;
}

async function fetchPage(page: number, options: ImportOptions): Promise<unknown> {
  const fetcher = options.fetch ?? globalThis.fetch;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  for (let attempt = 1; attempt <= 3; attempt++) {
    let response: Response;
    let body: unknown;
    try {
      response = await fetcher(`${AMS_API}?per_page=100&page=${page}`, {
        signal: AbortSignal.timeout(options.requestTimeoutMs ?? 30_000),
      });
      // Consume the body within the request timeout as well.
      body = await response.text();
    } catch {
      if (attempt === 3) throw new AmsImportError(`AMS page ${page}: request failed after 3 attempts.`);
      options.log?.(`AMS page ${page}: retrying request (attempt ${attempt + 1}/3).`);
      await sleep(1000 * 2 ** (attempt - 1));
      continue;
    }
    if (response.ok) {
      try { return JSON.parse(body as string) as unknown; }
      catch { throw new AmsImportError(`AMS page ${page}: invalid JSON.`); }
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 3) throw new AmsImportError(`AMS page ${page}: HTTP ${response.status}.`);
    const retryAfter = response.headers.get("retry-after");
    let delay = 1000 * 2 ** (attempt - 1);
    if (retryAfter !== null) {
      const seconds = Number(retryAfter);
      const parsed = retryAfter.trim() !== "" && Number.isFinite(seconds)
        ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
      if (Number.isFinite(parsed)) delay = Math.max(delay, parsed);
    }
    // Fail rather than retry earlier than a long Retry-After or overrun the job.
    if (delay > MAX_RETRY_DELAY_MS) throw new AmsImportError(`AMS page ${page}: Retry-After exceeds retry budget.`);
    options.log?.(`AMS page ${page}: HTTP ${response.status}; retrying in ${delay}ms.`);
    await sleep(delay);
  }
  throw new AmsImportError("AMS request failed.");
}

export async function importAmsEvents(options: ImportOptions) {
  const log = options.log ?? console.log;
  const started = Date.now();
  let fetched = 0;
  let saved = 0;
  log(`AMS import started at ${new Date(started).toISOString()}.`);
  try {
    let totalPages: number | undefined;
    let total: number | undefined;
    for (let page = 1; page <= (totalPages ?? 1); page++) {
      const result = object(await fetchPage(page, { ...options, log }));
      if (!Array.isArray(result.events) || !Number.isSafeInteger(result.total_pages)
        || (result.total_pages as number) < 0 || !Number.isSafeInteger(result.total)
        || (result.total as number) < 0) throw new AmsImportError("AMS returned invalid pagination metadata.");
      const pages = result.total_pages as number;
      const count = result.total as number;
      if ((count === 0 && (pages > 1 || result.events.length !== 0))
        || (count > 0 && (pages < page || result.events.length === 0))
        || (totalPages !== undefined && (pages !== totalPages || count !== total))) {
        throw new AmsImportError("AMS pagination changed or is inconsistent; rerun the import.");
      }
      totalPages = pages;
      total = count;
      fetched += result.events.length;
      // Validate the entire page before saving any of its events.
      const events = result.events.map(eventData);
      for (const event of events) {
        try { await options.save(event); }
        catch { throw new AmsImportError(`AMS page ${page}: database write failed for event ${event.externalId}.`); }
        saved++;
      }
      log(`AMS page ${page}/${Math.max(1, pages)}: saved ${events.length} events.`);
    }
    if (fetched !== total) throw new AmsImportError("AMS event count does not match pagination metadata.");
    return { fetched, saved };
  } finally {
    log(`AMS import finished at ${new Date().toISOString()}: fetched=${fetched}, saved=${saved}, durationMs=${Date.now() - started}.`);
  }
}
